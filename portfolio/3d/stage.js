// Сцена для 3D-моделей Arvis: рендерер, камера, світло, пауза у фоні, слабкі телефони.
// Підключення на сайті:
//   <script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
//   import { mountStage } from '../3d/stage.js';
//   import * as gears from '../3d/models/gears.js';
//   const st = await mountStage(canvas, gears, { progress: () => scrollY / maxScroll });
// Модель — це модуль з `meta` і `create(THREE, opts)`, що повертає { object, update(f), setColor?(hex), dispose?() }.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export { THREE };

export function isWeak() {
  return ((navigator.hardwareConcurrency || 4) <= 4 && Math.min(screen.width, screen.height) < 500) || (navigator.deviceMemory || 8) <= 3;
}

export async function mountStage(canvas, model, opts = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const weak = isWeak();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !weak, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    canvas.style.display = 'none';
    return null; // без WebGL сайт просто працює без 3D
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, weak ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(opts.fov ?? 32, 1, 0.1, 100);
  camera.position.set(0, 0, opts.z ?? 9);
  const key = new THREE.DirectionalLight(0xffffff, opts.light ?? 1.6);
  key.position.set(3, 4, 5);
  scene.add(key, new THREE.HemisphereLight(0xffffff, 0x444444, 0.5));

  const inst = model.create(THREE, { weak, renderer, scene, camera, ...(opts.model || {}) });
  if (model.meta && model.meta.scale) inst.object.scale.setScalar(model.meta.scale);
  scene.add(inst.object);

  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth - .5; pointer.y = e.clientY / innerHeight - .5; }, { passive: true });

  function size() {
    const box = opts.fill === 'parent' ? canvas.parentElement.getBoundingClientRect() : { width: innerWidth, height: innerHeight };
    renderer.setSize(Math.max(1, box.width), Math.max(1, box.height), false);
    camera.aspect = box.width / Math.max(1, box.height);
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', size); size();

  let running = true, last = performance.now(), t = 0, onScreen = true;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => { onScreen = es[0].isIntersecting; if (onScreen) kick(); }) : null;
  if (io && opts.fill === 'parent') io.observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });

  const frameInfo = { t: 0, dt: 0, p: 0, mx: 0, my: 0, weak, reduce, camera, viewW: 0, viewH: 0, instant: !!opts.instant };
  function frame(now) {
    if (!running || document.hidden || !onScreen) { looping = false; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    t += reduce ? 0 : dt;
    frameInfo.t = t; frameInfo.dt = reduce ? 0 : dt;
    frameInfo.p = opts.progress ? opts.progress() : 0;
    frameInfo.mx = pointer.x; frameInfo.my = pointer.y;
    frameInfo.viewH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    frameInfo.viewW = frameInfo.viewH * camera.aspect;
    opts.beforeFrame && opts.beforeFrame(frameInfo, inst);
    inst.update(frameInfo);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  let looping = false;
  function kick() { if (looping) return; looping = true; last = performance.now(); requestAnimationFrame(frame); }
  kick();

  return {
    THREE, scene, camera, renderer, model: inst, resize: size,
    setColor: hex => inst.setColor && inst.setColor(hex),
    stop() { running = false; io && io.disconnect(); inst.dispose && inst.dispose(); renderer.dispose(); },
  };
}

// Допоміжне: плавне наближення значення (щоб усе рухалось м'яко, без ривків).
export function damp(cur, target, lambda, dt) { return cur + (target - cur) * (1 - Math.exp(-lambda * dt)); }
export function smooth(a, b, x) { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); }
