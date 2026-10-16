// Michaelerplatz, Vienna, 21:40, in the rain. The Hotel Imperial on the left, Café
// Adler with its windows steamed up, a newspaper kiosk and its old vendor, an
// advertising column, a little yellow car, and down the avenue, past the passing
// headlights, the dome of the Karlskirche. Wet cobbles mirror every lamp.
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { texture, canvasTexture } from '../core/assets.js';
import { cobbles, facade } from '../fx/materials.js';
import { Rain, Mist } from '../fx/weather.js';
import { Audio } from '../core/audio.js';
import smokeURL from '../../assets/tex/smoke.png';
import waterN from '../../assets/tex/water_n.jpg';

const box = (w, h, d, mat, x, y, z, { cast = true, receive = true } = {}) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = receive; return m;
};
const std = (color, rough = 0.6, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });

// a cast-iron Viennese street lamp, with its light
function streetLamp(x, z, scene, flicker = false, shadows = true) {
  const g = new THREE.Group(), iron = std(0x1d2a24, 0.45, 0.6);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 4.2, 12), iron); pole.position.y = 2.1;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.5, 12), iron); base.position.y = 0.25;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.13, 0.45, 6), new THREE.MeshStandardMaterial({ color: 0xffe1a8, emissive: 0xffc070, emissiveIntensity: 3.2, roughness: 0.3 }));
  glass.position.y = 4.45;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.25, 6), iron); cap.position.y = 4.8;
  g.add(pole, base, glass, cap); g.traverse(o => { if (o.isMesh) { o.castShadow = o !== glass; o.receiveShadow = true; } });
  const light = new THREE.PointLight(0xffb866, 22, 16, 2); light.position.set(0, 4.3, 0); light.castShadow = shadows; light.shadow.bias = -0.002; light.shadow.mapSize.set(1024, 1024);
  g.add(light); g.position.set(x, 0, z); scene.add(g);
  return { group: g, light, glass, flicker };
}

// a little yellow car with Munich plates (a Beetle, more or less)
function littleCar() {
  const g = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xe6b81e, roughness: 0.32, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0c1218, roughness: 0.05, metalness: 0.4, clearcoat: 1 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), paint); body.scale.set(2.0, 0.62, 0.85); body.position.y = 0.62;
  const cabin = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), paint); cabin.scale.set(1.05, 0.62, 0.72); cabin.position.set(-0.15, 0.98, 0);
  const win = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), glass); win.scale.set(0.98, 0.5, 0.735); win.position.set(-0.15, 1.02, 0);
  const sill = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.18, 1.72), std(0x0a0a0a, 0.5)); sill.position.y = 0.36;
  g.add(body, cabin, win, sill);
  for (const [x, z] of [[1.2, 0.78], [1.2, -0.78], [-1.25, 0.78], [-1.25, -0.78]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 24), std(0x111111, 0.85)); w.rotation.x = Math.PI / 2; w.position.set(x, 0.34, z);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.26, 16), std(0xc8ccd0, 0.25, 1)); hub.rotation.x = Math.PI / 2; hub.position.copy(w.position);
    const arch = new THREE.Mesh(new THREE.SphereGeometry(0.46, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), paint); arch.position.set(x, 0.38, z * 0.92); arch.scale.set(1, 0.9, 0.55);
    g.add(w, hub, arch);
  }
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xfff4d8, emissive: 0xfff0c8, emissiveIntensity: 0.6 });
  for (const z of [0.5, -0.5]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), lampMat); l.position.set(1.95, 0.72, z); l.scale.set(0.6, 1, 1); g.add(l); }
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.12), new THREE.MeshStandardMaterial({ map: canvasTexture(256, 64, (x) => { x.fillStyle = '#f4f2ea'; x.fillRect(0, 0, 256, 64); x.strokeStyle = '#111'; x.lineWidth = 4; x.strokeRect(3, 3, 250, 58); x.fillStyle = '#111'; x.font = '700 40px Barlow Condensed, Arial'; x.textAlign = 'center'; x.fillText('M · RT 487', 128, 46); }) }));
  plate.position.set(2.02, 0.42, 0); plate.rotation.y = Math.PI / 2; g.add(plate);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// the newspaper kiosk, warm inside, papers stacked on the counter
function kiosk() {
  const g = new THREE.Group(), green = std(0x23382c, 0.55, 0.2), wood = std(0x4a2c18, 0.6);
  g.add(box(2.4, 0.15, 1.6, green, 0, 2.5, 0));
  const awning = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.06, 0.9), new THREE.MeshStandardMaterial({ map: canvasTexture(256, 64, (x) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#e8e0cc' : '#9e1f28'; x.fillRect(i * 16, 0, 16, 64); } }), roughness: 0.8 }));
  awning.position.set(0, 2.32, 1.05); awning.rotation.x = 0.35; awning.castShadow = true; g.add(awning);
  for (const x of [-1.15, 1.15]) g.add(box(0.12, 2.5, 1.5, green, x, 1.25, 0));
  g.add(box(2.4, 2.5, 0.1, wood, 0, 1.25, -0.75));
  g.add(box(2.4, 1.0, 0.5, wood, 0, 0.5, 0.55));
  const paper = new THREE.MeshStandardMaterial({ map: canvasTexture(256, 256, (x) => { x.fillStyle = '#e4dcc6'; x.fillRect(0, 0, 256, 256); x.fillStyle = '#111'; x.font = '700 30px Bodoni Moda, Georgia'; x.textAlign = 'center'; x.fillText('ABENDPOST', 128, 44); x.fillStyle = '#555'; for (let i = 0; i < 10; i++) x.fillRect(20, 70 + i * 16, i % 3 ? 216 : 100, 6); x.fillStyle = '#333'; x.fillRect(140, 70, 96, 80); }), roughness: 0.9 });
  for (let i = 0; i < 3; i++) { const p = box(0.55, 0.06 + i * 0.02, 0.4, paper, -0.7 + i * 0.7, 1.04 + i * 0.01, 0.55); p.rotation.y = (i - 1) * 0.15; g.add(p); }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.36), new THREE.MeshStandardMaterial({ map: canvasTexture(512, 92, (x) => { x.fillStyle = '#1a2a20'; x.fillRect(0, 0, 512, 92); x.fillStyle = '#e8c870'; x.font = '700 54px Barlow Condensed, Arial'; x.textAlign = 'center'; x.fillText('ZEITUNGEN · TABAK', 256, 66); }), emissive: 0xffffff, emissiveIntensity: 0.6 }));
  sign.material.emissiveMap = sign.material.map; sign.position.set(0, 2.8, 0.81); g.add(sign);
  const lamp = new THREE.PointLight(0xffb060, 3.2, 5, 2); lamp.position.set(0.5, 2.5, 0.7); g.add(lamp);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshStandardMaterial({ emissive: 0xffc070, emissiveIntensity: 6, color: 0xffffff })); bulb.position.copy(lamp.position); g.add(bulb);
  g.traverse(o => { if (o.isMesh) { o.castShadow = o.castShadow ?? true; o.receiveShadow = true; } });
  return g;
}

// the advertising column, with posters for Die Fledermaus
function adColumn() {
  const g = new THREE.Group();
  const poster = canvasTexture(1024, 512, (x) => {
    x.fillStyle = '#d8ccb0'; x.fillRect(0, 0, 1024, 512);
    const posters = [['#7a1a2a', 'DIE FLEDERMAUS', 'STAATSOPER'], ['#1a2a4a', 'POP KONZERT', 'STADTHALLE'], ['#c9a13b', 'WIENER WALZER', 'KURSALON'], ['#2a4a2a', 'SACHER', 'SEIT 1876']];
    posters.forEach(([c, a, b], i) => { x.fillStyle = c; x.fillRect(i * 256 + 14, 30, 228, 452); x.fillStyle = '#f4ead4'; x.font = '700 36px Bodoni Moda, Georgia'; x.textAlign = 'center'; x.fillText(a, i * 256 + 128, 150); x.font = '600 26px Barlow Condensed, Arial'; x.fillText(b, i * 256 + 128, 400); x.strokeStyle = '#f4ead4'; x.lineWidth = 3; x.strokeRect(i * 256 + 30, 46, 196, 420); });
  });
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 2.8, 48, 1, true), new THREE.MeshStandardMaterial({ map: poster, roughness: 0.85 })); col.position.y = 1.6;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.2, 48), std(0x1d2a24, 0.5, 0.5)); base.position.y = 0.1;
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.6, 0.18, 48), std(0x1d2a24, 0.5, 0.5)); ring.position.y = 3.1;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), std(0x1d2a24, 0.45, 0.6)); dome.position.y = 3.18; dome.scale.y = 0.6;
  g.add(col, base, ring, dome); g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

// the Karlskirche, far down the avenue, floodlit
function karlskirche() {
  const g = new THREE.Group(), stone = std(0xb8b4a0, 0.8), copper = std(0x5a8a78, 0.5, 0.4);
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 6, 32), stone); drum.position.y = 13;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(5.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), copper); dome.position.y = 16; dome.scale.y = 1.4;
  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1, 3, 16), stone); lantern.position.y = 24.8;
  const front = new THREE.Mesh(new THREE.BoxGeometry(22, 10, 4), stone); front.position.set(0, 5, 5);
  const portico = new THREE.Mesh(new THREE.ConeGeometry(6, 3, 4), stone); portico.position.set(0, 11.5, 6); portico.rotation.y = Math.PI / 4; portico.scale.set(1.4, 1, 0.4);
  g.add(drum, dome, lantern, front, portico);
  for (const x of [-8, 8]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 22, 24), stone); c.position.set(x, 11, 7.5); const top = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 8), copper); top.position.set(x, 22.6, 7.5); g.add(c, top); }
  const flood = new THREE.SpotLight(0xd8e8ff, 900, 70, 0.5, 0.6, 2); flood.position.set(0, 2, 40); flood.target.position.set(0, 12, 0); g.add(flood, flood.target);
  return g;
}

function flags(mat) {
  const geo = new THREE.PlaneGeometry(1.4, 0.9, 20, 8); geo.translate(0.7, 0, 0);
  const m = new THREE.Mesh(geo, mat); m.userData.base = geo.attributes.position.array.slice(); return m;
}

export function buildStreet(G) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b12);
  scene.fog = new THREE.FogExp2(0x0b1119, 0.028);
  if (G.env) { scene.environment = G.env; scene.environmentIntensity = 0.35; }
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 200);
  const updaters = [];

  // moonlight through the cloud, cool and low
  const moon = new THREE.DirectionalLight(0x8aa8d8, 0.55); moon.position.set(-8, 14, 6); moon.castShadow = true;
  moon.shadow.mapSize.set(G.renderer.Q.shadow, G.renderer.Q.shadow); Object.assign(moon.shadow.camera, { left: -16, right: 16, top: 12, bottom: -8, near: 1, far: 40 }); moon.shadow.bias = -0.0005;
  scene.add(moon, new THREE.HemisphereLight(0x3a4a6a, 0x0a0806, 0.35));
  const fill = new THREE.DirectionalLight(0xffd8b0, 0.7); fill.position.set(1, 3, 12); scene.add(fill);

  // the street and the square: wet cobbles, with a mirror layer for the puddles
  const groundMat = cobbles({ repeat: [10, 5] });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), groundMat); ground.rotation.x = -Math.PI / 2; ground.position.z = -6; ground.receiveShadow = true; scene.add(ground);
  const avenue = new THREE.Mesh(new THREE.PlaneGeometry(7, 50), cobbles({ repeat: [2, 14], seed: 11 })); avenue.rotation.x = -Math.PI / 2; avenue.position.set(2.75, 0.001, -30); avenue.receiveShadow = true; scene.add(avenue);
  const kerb = std(0x6a6862, 0.8);
  scene.add(box(60, 0.14, 0.3, kerb, 0, 0.07, -2.6));
  let reflector = null;
  if (G.renderer.Q.reflect > 0) {
    const nrm = texture(waterN, { srgb: false, repeat: [8, 4] });
    reflector = new Reflector(new THREE.PlaneGeometry(40, 24), {
      textureWidth: innerWidth * G.renderer.Q.reflect, textureHeight: innerHeight * G.renderer.Q.reflect, color: 0x889099,
      shader: {
        name: 'WetCobbles',
        uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, tMask: { value: groundMat.roughnessMap }, tNormal: { value: nrm }, time: { value: 0 } },
        vertexShader: 'uniform mat4 textureMatrix; varying vec4 vUv; varying vec2 vUv2; void main(){ vUv = textureMatrix * vec4(position, 1.0); vUv2 = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `uniform vec3 color; uniform sampler2D tDiffuse, tMask, tNormal; uniform float time; varying vec4 vUv; varying vec2 vUv2;
          void main(){
            vec2 n = texture2D(tNormal, vUv2 * vec2(10.0, 6.0) + vec2(time * 0.015, time * 0.01)).rg * 2.0 - 1.0;
            vec4 uv = vUv; uv.xy += n * 0.035 * uv.w;
            vec3 refl = texture2DProj(tDiffuse, uv).rgb * color;
            float rough = texture2D(tMask, vUv2 * vec2(6.67, 4.0)).r;
            float wet = smoothstep(0.55, 0.12, rough);
            gl_FragColor = vec4(refl, 0.18 + wet * 0.62);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`,
      },
    });
    reflector.material.transparent = true; reflector.material.depthWrite = false;
    reflector.rotation.x = -Math.PI / 2; reflector.position.set(0, 0.006, -1); scene.add(reflector);
  }

  // the left block: Hotel Imperial and Café Adler, with the café shopfront
  const leftF = facade({ floors: 4, bays: 6, color: '#cbbb9c', seed: 5, lit: 0.4, shop: true });
  leftF.map.repeat.set(1, 1);
  const left = box(14, 15, 4, [std(0x8a8070), std(0x8a8070), std(0x2a2a2a), std(0x2a2a2a), leftF, std(0x8a8070)], -6.6, 7.5, -4.6);
  scene.add(left);
  scene.add(box(14.2, 0.35, 0.5, std(0xd8cbb0, 0.9), -6.6, 3.4, -2.45)); // cornice over the shops
  // Hotel Imperial: canopy, gilded name, a warm revolving door
  const gold = std(0xd9b35c, 0.3, 1);
  const canopy = box(3.4, 0.18, 2.2, std(0x5a1a22, 0.6), -9.5, 3.0, -1.6); scene.add(canopy);
  for (const x of [-10.9, -8.1]) scene.add(box(0.08, 3.0, 0.08, gold, x, 1.5, -0.6));
  const hotelSign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.5), new THREE.MeshStandardMaterial({ map: canvasTexture(640, 100, (x) => { x.fillStyle = '#2a0c10'; x.fillRect(0, 0, 640, 100); x.fillStyle = '#e8c870'; x.font = 'italic 700 64px Bodoni Moda, Georgia'; x.textAlign = 'center'; x.fillText('Hotel Imperial', 320, 74); }), emissive: 0xffffff, emissiveIntensity: 0.55, emissiveMap: null }));
  hotelSign.material.emissiveMap = hotelSign.material.map; hotelSign.position.set(-9.5, 3.4, -0.48); scene.add(hotelSign);
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.6), new THREE.MeshStandardMaterial({ color: 0x2a1c10, emissive: 0xffb860, emissiveIntensity: 0.55 })); doorGlow.position.set(-9.5, 1.3, -2.58); scene.add(doorGlow);
  const hotelLight = new THREE.PointLight(0xffa850, 10, 7, 2); hotelLight.position.set(-9.5, 2.4, -1.4); scene.add(hotelLight);
  // Café Adler: big steamed windows, a door, a striped awning and its sign
  const cafeWin = new THREE.MeshStandardMaterial({ color: 0x3a2814, emissive: 0xffaa55, emissiveIntensity: 0.42, roughness: 0.15, map: canvasTexture(512, 256, (x) => { const g = x.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#ffcf8a'); g.addColorStop(1, '#a8601e'); x.fillStyle = g; x.fillRect(0, 0, 512, 256); for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(40,20,8,0.55)'; x.beginPath(); x.ellipse(60 + i * 80, 170, 22, 40, 0, 0, 7); x.fill(); x.beginPath(); x.arc(60 + i * 80, 118, 16, 0, 7); x.fill(); } x.fillStyle = 'rgba(255,240,220,0.12)'; x.fillRect(0, 0, 512, 256); }) });
  cafeWin.emissiveMap = cafeWin.map;
  for (const x of [-5.0, -2.0]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.9), cafeWin); w.position.set(x, 1.55, -2.58); scene.add(w); }
  const cafeDoor = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.4), new THREE.MeshStandardMaterial({ color: 0x3a2412, emissive: 0xff9a40, emissiveIntensity: 0.28 })); cafeDoor.position.set(-3.5, 1.2, -2.57); scene.add(cafeDoor);
  const cafeAwn = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.05, 1.3), new THREE.MeshStandardMaterial({ map: canvasTexture(256, 64, (x) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#e8e0cc' : '#2a4a3a'; x.fillRect(i * 16, 0, 16, 64); } }), roughness: 0.8 }));
  cafeAwn.position.set(-3.5, 2.95, -1.95); cafeAwn.rotation.x = 0.32; cafeAwn.castShadow = true; scene.add(cafeAwn);
  const cafeSign = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.315), new THREE.MeshStandardMaterial({ map: canvasTexture(640, 96, (x) => { x.fillStyle = '#10201a'; x.fillRect(0, 0, 640, 96); x.fillStyle = '#f4e2a8'; x.font = '700 60px Bodoni Moda, Georgia'; x.textAlign = 'center'; x.fillText('CAFÉ ADLER', 320, 70); }) }));
  cafeSign.material.emissive = new THREE.Color(0xffffff); cafeSign.material.emissiveMap = cafeSign.material.map; cafeSign.material.emissiveIntensity = 0.7;
  cafeSign.position.set(-3.5, 3.4, -2.19); scene.add(cafeSign);
  const cafeLight = new THREE.PointLight(0xff9a48, 9, 6, 2); cafeLight.position.set(-3.5, 1.6, -1.6); scene.add(cafeLight);

  // the avenue running away from us, lined with façades, to the Karlskirche
  for (let k = 0; k < 5; k++) {
    const z = -8 - k * 8;
    const fl = facade({ floors: 5, bays: 4, color: ['#bfae90', '#c9bca2', '#b4a68c'][k % 3], seed: 20 + k, lit: 0.3 });
    const l = box(8, 16 + (k % 2) * 2, 8, [fl, std(0x6a6458), std(0x2a2a2a), std(0x2a2a2a), std(0x6a6458), std(0x6a6458)], -4.4, 8 + (k % 2), z); scene.add(l);
    const fr = facade({ floors: 5, bays: 4, color: ['#c4b498', '#b8aa8e', '#cbbea4'][k % 3], seed: 40 + k, lit: 0.3 });
    const r = box(8, 15 + ((k + 1) % 2) * 2, 8, [std(0x6a6458), fr, std(0x2a2a2a), std(0x2a2a2a), std(0x6a6458), std(0x6a6458)], 9.9, 7.5, z); scene.add(r);
  }
  const church = karlskirche(); church.position.set(2.5, 0, -62); church.scale.setScalar(0.9); scene.add(church);
  // the right block, and at its far end the Karvonian Consulate, red flags in the floodlights
  const rightF = facade({ floors: 4, bays: 5, color: '#b9aa8e', seed: 9, lit: 0.25 });
  scene.add(box(10, 15, 4, [std(0x6a6458), std(0x6a6458), std(0x2a2a2a), std(0x2a2a2a), rightF, std(0x6a6458)], 11, 7.5, -4.6));
  const flagMat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8, map: canvasTexture(128, 80, (x) => { x.fillStyle = '#b01a24'; x.fillRect(0, 0, 128, 80); x.fillStyle = '#d9b35c'; x.beginPath(); x.arc(32, 26, 12, 0, 7); x.fill(); x.fillStyle = '#1a1a1a'; x.fillRect(0, 66, 128, 6); }) });
  const flagMeshes = [];
  for (const x of [8.4, 12.4]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8), gold); pole.position.set(x, 5.2, -2.3); pole.rotation.z = -0.6; scene.add(pole);
    const f = flags(flagMat); f.position.set(x + 0.6, 6.0, -2.3); f.rotation.z = -0.15; scene.add(f); flagMeshes.push(f);
  }
  const floodC = new THREE.SpotLight(0xffd8b0, 120, 14, 0.5, 0.7, 2); floodC.position.set(10.4, 0.3, 0.5); floodC.target.position.set(10.4, 6, -2.5); scene.add(floodC, floodC.target);

  // street furniture
  const lamps = [streetLamp(-6.3, -1.9, scene, true, G.renderer.Q.shadow >= 2048), streetLamp(6.2, -1.9, scene, false, false)];
  const k = kiosk(); k.position.set(3.9, 0, -1.5); scene.add(k);
  const col = adColumn(); col.position.set(1.0, 0, -1.6); scene.add(col);
  const car = littleCar(); car.position.set(7.4, 0, 1.4); car.rotation.y = 0.12; scene.add(car);

  // weather: rain, puddle rings, mist; and the light of cars passing out of sight down the avenue
  const rain = new Rain(scene, { count: 7000, box: [30, 12, 22], center: [0, 0, -6] });
  const mist = new Mist(scene, texture(smokeURL), { count: 16, area: [34, 10], center: [0, -3] });
  const headLight = new THREE.PointLight(0xfff0d0, 0, 14, 2); scene.add(headLight);

  // where Jack can walk: the pavement and the near half of the street
  const walk = [[-12, -2.1], [12, -2.1], [12, 3.2], [-12, 3.2]];

  let lastP = 0;
  const update = (dt, t) => {
    rain.update(dt, t); mist.update(dt);
    if (reflector) reflector.material.uniforms.time.value = t;
    // the near lamp flickers now and then
    const fl = lamps[0]; const f = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.1) * (Math.sin(t * 0.7) > 0.6 ? 1 : 0.1);
    fl.light.intensity = 22 * f; fl.glass.material.emissiveIntensity = 3.2 * f;
    // now and then a car passes somewhere down the avenue: its lights sweep the wet road and
    // the façades, and you hear it go by (no lamps of its own in view)
    const p = (t * 0.07) % 1;
    if (p < 0.3) { const q = p / 0.3; headLight.position.set(2.65 + Math.sin(q * 3) * 0.6, 1.2, -50 + q * 26); headLight.intensity = 34 * Math.sin(q * Math.PI); }
    else headLight.intensity = 0;
    if (lastP < 0.12 && p >= 0.12 && G.mode === 'play') Audio.sfx('carBy', { pan: 0.15, gain: 0.35, verb: 0.5 });
    lastP = p;
    // flags stirring in the wind
    for (const m of flagMeshes) { const a = m.geometry.attributes.position, b = m.userData.base; for (let i = 0; i < a.count; i++) { const x = b[i * 3]; a.array[i * 3 + 2] = Math.sin(x * 4 - t * 4) * 0.08 * x; } a.needsUpdate = true; }
  };

  // camera: low, across the street, drifting a little to follow Jack
  const camBase = new THREE.Vector3(0, 2.1, 10.5), look = new THREE.Vector3(0, 1.9, -3);
  camera.position.copy(camBase); camera.lookAt(look);
  const aim = look.clone();
  const follow = (dt) => {
    const k = Math.min(1, dt * 1.6), c = G.convoFocus && G.t < G.convoUntil ? G.convoFocus : null;
    const want = c ? new THREE.Vector3(c.x + 0.45, 1.72, c.z + 3.0) : new THREE.Vector3(THREE.MathUtils.clamp((G.jack ? G.jack.position.x : 0) * 0.8, -6, 6), camBase.y, camBase.z);
    const wantLook = c ? new THREE.Vector3(c.x, 1.5, c.z - 0.4) : new THREE.Vector3(look.x + want.x * 1.0, look.y, look.z);
    camera.position.lerp(want, k); aim.lerp(wantLook, k); camera.lookAt(aim);
  };

  return {
    scene, camera, walk, exposure: 1.05,
    update: (dt, t) => { update(dt, t); follow(dt); },
    ambience: [{ url: G.audio.rainOut, gain: 1 }, { url: G.audio.gutter, gain: 0.6 }, { url: G.audio.sirens, gain: 0.25 }],
    music: G.audio.music.street,
    step: 'step_wet',
    dispose() { scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); if (reflector) reflector.dispose(); },
  };
}
