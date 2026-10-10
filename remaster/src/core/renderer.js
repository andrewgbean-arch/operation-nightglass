// The renderer: physically based lighting, soft shadows, filmic tone mapping, and a
// post-processing chain (ambient occlusion, bloom on the lamps, grain and vignette).
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';

export const QUALITY = {
  ultra:  { label: 'Ultra',  pr: 2,    shadow: 2048, ao: true,  bloom: true,  reflect: 1,   smaa: true },
  high:   { label: 'High',   pr: 1.5,  shadow: 2048, ao: true,  bloom: true,  reflect: 0.5, smaa: true },
  medium: { label: 'Medium', pr: 1,    shadow: 1024, ao: false, bloom: true,  reflect: 0.5, smaa: true },
  low:    { label: 'Low',    pr: 0.75, shadow: 512,  ao: false, bloom: false, reflect: 0,   smaa: false },
};

// Film grain, a gentle vignette and a touch of warm/cool grading, in display space.
const FilmShader = {
  uniforms: { tDiffuse: { value: null }, time: { value: 0 }, grain: { value: 0.045 }, vignette: { value: 0.32 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float time, grain, vignette; varying vec2 vUv;
    float rnd(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + time * 7.13) * 43758.5453); }
    void main(){
      vec4 c = texture2D(tDiffuse, vUv);
      float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      c.rgb = mix(c.rgb, c.rgb * vec3(1.04, 1.0, 0.94), smoothstep(0.35, 0.9, l));   // warm highlights
      c.rgb = mix(c.rgb * vec3(0.92, 0.98, 1.08), c.rgb, smoothstep(0.0, 0.3, l));    // cool shadows
      c.rgb += (rnd(vUv * 731.0) - 0.5) * grain;
      vec2 d = vUv - 0.5; c.rgb *= 1.0 - vignette * smoothstep(0.25, 0.85, dot(d, d) * 2.2);
      gl_FragColor = c;
    }`,
};

// Replaces any broken (infinite or not-a-number) pixel with black and caps very bright ones,
// so a stray highlight can't spread into dark squares through the bloom.
const SafeShader = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `precision highp float; uniform sampler2D tDiffuse; varying vec2 vUv;
    float ok(float v){ return (v >= 0.0 && v <= 60000.0) ? min(v, 48.0) : 0.0; }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); gl_FragColor = vec4(ok(c.r), ok(c.g), ok(c.b), 1.0); }`,
};

export class Renderer {
  constructor(canvas, quality = 'high') {
    this.canvas = canvas;
    this.gl = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
    this.gl.outputColorSpace = THREE.SRGBColorSpace;
    this.gl.toneMapping = THREE.ACESFilmicToneMapping;
    this.gl.toneMappingExposure = 1.0;
    this.gl.shadowMap.enabled = true;
    this.gl.shadowMap.type = THREE.PCFSoftShadowMap;
    this.setQuality(quality);
    addEventListener('resize', () => this.resize());
  }
  setQuality(q) {
    this.q = QUALITY[q] ? q : 'high';
    this.Q = QUALITY[this.q];
    this.gl.setPixelRatio(Math.min(devicePixelRatio || 1, this.Q.pr));
    if (this.scene) this.build(this.scene, this.camera);
    this.resize();
  }
  build(scene, camera) {
    this.scene = scene; this.camera = camera;
    const size = this.gl.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 0 });
    this.composer = new EffectComposer(this.gl, rt);
    this.composer.addPass(new RenderPass(scene, camera));
    if (this.Q.ao) {
      const ao = new GTAOPass(scene, camera, size.x, size.y);
      ao.updateGtaoMaterial({ radius: 0.35, distanceFallOff: 1.0, thickness: 1.0, scale: 1.0 });
      ao.blendIntensity = 0.85;
      // only solid things shade their surroundings: mist sprites, glass, puddle film and the
      // like would otherwise darken big rectangles of the picture
      ao._overrideVisibility = function () {
        const cache = this._visibilityCache;
        this.scene.traverse(o => {
          if (!o.visible) return;
          const m = o.material, see = m && (Array.isArray(m) ? m.some(x => x.transparent) : m.transparent);
          if (o.isPoints || o.isLine || o.isSprite || see || o.userData.noAO) { o.visible = false; cache.push(o); }
        });
      };
      this.composer.addPass(ao);
    }
    if (this.Q.bloom) this.composer.addPass(new ShaderPass(SafeShader));
    if (this.Q.bloom) { this.bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.75, 0.55, 0.82); this.composer.addPass(this.bloom); }
    this.composer.addPass(new OutputPass());
    this.film = new ShaderPass(FilmShader); this.composer.addPass(this.film);
    if (this.Q.smaa) this.composer.addPass(new SMAAPass(size.x, size.y));
    this.resize();
  }
  resize() {
    const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight;
    this.gl.setSize(w, h, false);
    if (this.camera) { this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
    if (this.composer) { this.composer.setPixelRatio(this.gl.getPixelRatio()); this.composer.setSize(w, h); }
  }
  render(t) {
    if (!this.composer) return;
    this.film.uniforms.time.value = t;
    this.composer.render();
  }
}
