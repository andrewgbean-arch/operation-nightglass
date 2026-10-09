// Rain that falls in streaks through the lamplight, rings on the puddles, and mist.
import * as THREE from 'three';

export class Rain {
  constructor(scene, { count = 6000, box = [30, 14, 22], center = [0, 0, -4], color = 0xa8c0d8, opacity = 0.35, wind = 0.15 } = {}) {
    const pos = new Float32Array(count * 6), seed = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * box[0], y = Math.random() * box[1], z = (Math.random() - 0.5) * box[2];
      pos.set([x, y, z, x, y, z], i * 6); seed.set([Math.random(), Math.random()], i * 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const s2 = new Float32Array(count * 4); for (let i = 0; i < count; i++) s2.set([seed[i * 2], 0, seed[i * 2], 1], i * 4);
    g.setAttribute('seed', new THREE.BufferAttribute(s2, 2));
    this.mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, height: { value: box[1] }, color: { value: new THREE.Color(color) }, opacity: { value: opacity }, wind: { value: wind }, center: { value: new THREE.Vector3(...center) } },
      vertexShader: `uniform float time, height, wind; uniform vec3 center; attribute vec2 seed; varying float vA;
        void main(){ vec3 p = position; float sp = 9.0 + seed.x * 4.0; float y = mod(p.y - time * sp, height);
          p.y = y - seed.y * 0.32; p.x += wind * p.y; vA = smoothstep(0.0, 1.5, y) * (0.4 + seed.x * 0.6);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p + center, 1.0); }`,
      fragmentShader: `uniform vec3 color; uniform float opacity; varying float vA; void main(){ gl_FragColor = vec4(color, opacity * vA); }`,
    });
    this.lines = new THREE.LineSegments(g, this.mat); this.lines.frustumCulled = false; scene.add(this.lines);
    // rings where drops hit the ground
    const n = 200, ring = new THREE.RingGeometry(0.82, 1, 32); ring.rotateX(-Math.PI / 2);
    this.rings = new THREE.InstancedMesh(ring, new THREE.MeshBasicMaterial({ color: 0xc8d8ea, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending }), n);
    this.rings.frustumCulled = false; this.ringData = [];
    for (let i = 0; i < n; i++) this.ringData.push({ x: center[0] + (Math.random() - 0.5) * box[0], z: center[2] + (Math.random() - 0.5) * box[2] * 0.7 + 3, t: Math.random() });
    scene.add(this.rings); this.box = box; this.center = center;
    this.m = new THREE.Matrix4();
  }
  update(dt, t) {
    this.mat.uniforms.time.value = t;
    for (let i = 0; i < this.ringData.length; i++) {
      const r = this.ringData[i]; r.t += dt * 1.8;
      if (r.t > 1) { r.t = 0; r.x = this.center[0] + (Math.random() - 0.5) * this.box[0]; r.z = this.center[2] + (Math.random() - 0.5) * this.box[2] * 0.7 + 3; }
      const s = 0.02 + r.t * 0.11; this.m.makeScale(s, 1, s).setPosition(r.x, 0.012, r.z); this.rings.setMatrixAt(i, this.m);
    }
    this.rings.instanceMatrix.needsUpdate = true;
  }
}

// Drifting mist: big soft sprites low over the street.
export class Mist {
  constructor(scene, tex, { count = 18, area = [30, 12], y = 0.6, color = 0x8a9ab0, opacity = 0.09, center = [0, -4] } = {}) {
    this.sprites = [];
    for (let i = 0; i < count; i++) {
      const m = new THREE.SpriteMaterial({ map: tex, color, transparent: true, opacity, depthWrite: false });
      const s = new THREE.Sprite(m); const sc = 5 + Math.random() * 6; s.scale.set(sc, sc * 0.5, 1);
      s.position.set(center[0] + (Math.random() - 0.5) * area[0], y + Math.random() * 1.4, center[1] + (Math.random() - 0.5) * area[1]);
      s.userData.v = 0.15 + Math.random() * 0.25; scene.add(s); this.sprites.push(s);
    }
    this.area = area; this.center = center;
  }
  update(dt) {
    for (const s of this.sprites) { s.position.x += s.userData.v * dt; if (s.position.x > this.center[0] + this.area[0] / 2) s.position.x -= this.area[0]; s.material.rotation += dt * 0.02; }
  }
}
