// Loading: the character models, textures and the night sky, all bundled into the page.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { UltraHDRLoader } from 'three/examples/jsm/loaders/UltraHDRLoader.js';

const gltf = new GLTFLoader();
const texLoader = new THREE.TextureLoader();
const cache = new Map();

// A model is either bundled bytes (single-file build) or a URL next to the page (split build).
// Bytes of a bundled file: inline data is decoded here (some hosts refuse fetch() of data: URLs),
// a file published beside the page is fetched.
export async function bytes(url) {
  if (url.startsWith('data:')) {
    const b = atob(url.slice(url.indexOf(',') + 1)), out = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
    return out.buffer;
  }
  if (url.endsWith('.b64.txt')) return bytes('data:,' + (await (await fetch(url)).text()).trim());
  return (await fetch(url)).arrayBuffer();
}

export async function parseGLB(src) {
  const buf = typeof src === 'string' ? await bytes(src) : src.buffer.slice(src.byteOffset, src.byteOffset + src.byteLength);
  return new Promise((res, rej) => gltf.parse(buf, '', res, rej));
}

export function texture(url, { srgb = true, repeat = [1, 1], aniso = 8 } = {}) {
  const key = url + repeat.join(',') + srgb;
  if (cache.has(key)) return cache.get(key);
  const t = texLoader.load(url);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = aniso;
  cache.set(key, t);
  return t;
}

export async function environment(renderer, url) {
  const loader = new UltraHDRLoader(); loader.setDataType(THREE.HalfFloatType);
  const hdr = await loader.loadAsync(url);
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(hdr).texture;
  pmrem.dispose();
  return { env, sky: hdr };
}

// A canvas painted in code, used as a texture.
export function canvasTexture(w, h, draw, { srgb = true, repeat = [1, 1] } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.anisotropy = 8;
  return t;
}
