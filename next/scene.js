/* Arvis 2 — 3D: ~110 кубиков с чёрным контуром (как на плакате).
   Главы страницы (data-form) задают, во что они собраны: логотип → окно сайта → телефон с ботом → игровой уровень → логотип.
   Листаешь — кубики разлетаются и собираются в следующую фигуру. Свободные кубики летают вокруг как конфетти.
   Лёгкая сцена: один тип геометрии, две «пачки» (InstancedMesh), без теней и постобработки. */
import * as THREE from "three";

const canvas = document.getElementById("scene");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const phone = () => innerWidth < 900;
const weak = phone() || (navigator.hardwareConcurrency || 4) <= 4;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !weak, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  document.documentElement.classList.add("no-3d");
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, weak ? 1.5 : 2));
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(0, 0, 20);
scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const sun = new THREE.DirectionalLight(0xffffff, 1.5);
sun.position.set(5, 7, 9);
scene.add(sun);

const PAL = { teal: new THREE.Color(0x12c2b0), coral: new THREE.Color(0xff5a3c), sun: new THREE.Color(0xffcf3f),
  ink: new THREE.Color(0x23262f), paper: new THREE.Color(0xfffaf0) };
const CONF = ["teal", "coral", "sun", "paper", "teal", "coral"];

// «плакатная» заливка: 3 ступени света вместо плавного
const grad = new THREE.DataTexture(new Uint8Array([110, 190, 255]), 3, 1, THREE.RedFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter;
grad.needsUpdate = true;

const N = 110;
const geo = new THREE.BoxGeometry(1, 1, 1);
const body = new THREE.InstancedMesh(geo, new THREE.MeshToonMaterial({ gradientMap: grad }), N);
const hull = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0x12141a, side: THREE.BackSide }), N);  // контур
body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
hull.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
const group = new THREE.Group();
group.add(hull, body);
scene.add(group);

/* ---------- фигуры ---------- */
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const it = (x, y, z, sx, sy, sz, c, extra = {}) => ({ p: [x, y, z], s: [sx, sy, sz], r: [0, 0, extra.rz || 0], c, ...extra });

function confetti(list, s) {   // свободные кубики — облаком вокруг фигуры
  seed = s;
  while (list.length < N) {
    const a = rnd() * Math.PI * 2, rad = 4.6 + rnd() * 2.6, h = (rnd() - 0.5) * 7;
    const k = 0.16 + rnd() * 0.22;
    list.push({ p: [Math.cos(a) * rad, h, Math.sin(a) * rad * 0.6 - 1], s: [k, k, k], r: [rnd() * 3, rnd() * 3, rnd() * 3], c: CONF[list.length % CONF.length], conf: true });
  }
  return list;
}

function logo() {
  const out = [], K = 7.2 / 120, X = (x) => (x - 60) * K, Y = (y) => -(y - 60) * K - 0.1;
  for (const [x1, y1, x2, y2] of [[14, 98, 44, 22], [44, 22, 74, 98]]) {   // две ножки «Λ»
    const ang = Math.atan2(Y(y2) - Y(y1), X(x2) - X(x1));
    for (let i = 0; i < 9; i++) {
      const f = (i + 0.5) / 9;
      out.push(it(X(x1 + (x2 - x1) * f), Y(y1 + (y2 - y1) * f), 0, 0.72, 0.8, 0.8, i % 4 === 3 ? "sun" : "teal", { rz: ang }));
    }
  }
  for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++)   // курсор
    out.push(it(X(88 + 4.5 + c * 9), Y(72 + 4.33 + r * 8.67), 0, 0.54, 0.52, 0.8, "coral", { blink: true }));
  return confetti(out, 11);
}

function site() {
  const out = [];
  out.push(it(0, 0, -0.2, 6.6, 4.6, 0.25, "paper"));                       // лист окна
  for (let i = 0; i < 8; i++) out.push(it(-2.89 + i * 0.825, 2.05, 0.05, 0.84, 0.5, 0.4, "teal"));   // верхняя полоса
  ["coral", "sun", "paper"].forEach((c, i) => out.push(it(-2.95 + i * 0.36, 2.05, 0.3, 0.2, 0.2, 0.2, c)));
  out.push(it(-1.45, 0.65, 0.1, 3.1, 1.75, 0.35, "coral"));               // большой блок героя
  out.push(it(1.65, 1.2, 0.1, 2.4, 0.26, 0.2, "ink"));
  out.push(it(1.4, 0.75, 0.1, 1.9, 0.18, 0.2, "ink"));
  out.push(it(1.55, 0.38, 0.1, 2.2, 0.18, 0.2, "ink"));
  out.push(it(1.05, -0.12, 0.2, 1.3, 0.42, 0.35, "sun"));                 // кнопка
  [["teal", -2.1], ["sun", 0], ["coral", 2.1]].forEach(([c, x]) => out.push(it(x, -1.45, 0.1, 1.9, 1.05, 0.35, c)));   // карточки
  return confetti(out, 23);
}

function bot() {
  const out = [];
  out.push(it(0, 0, -0.25, 3.2, 5.9, 0.4, "ink"));                        // корпус
  out.push(it(0, -0.05, 0, 2.75, 5.1, 0.12, "paper"));                    // экран
  out.push(it(0, 2.25, 0.12, 2.75, 0.55, 0.2, "teal"));                   // шапка чата
  out.push(it(-0.95, 2.25, 0.3, 0.38, 0.38, 0.3, "sun"));                 // аватар
  out.push(it(0.75, 1.3, 0.15, 1.05, 0.42, 0.25, "coral"));               // «/start»
  out.push(it(-0.35, 0.45, 0.15, 1.85, 0.75, 0.25, "teal"));              // ответ бота
  out.push(it(-0.73, -0.25, 0.2, 0.9, 0.38, 0.25, "sun"));                // кнопки
  out.push(it(0.27, -0.25, 0.2, 0.9, 0.38, 0.25, "sun"));
  out.push(it(0.6, -1.05, 0.15, 1.3, 0.42, 0.25, "coral"));
  out.push(it(-0.4, -1.85, 0.15, 1.75, 0.6, 0.25, "teal"));
  out.push(it(0, -2.3, 0.3, 0.7, 0.12, 0.2, "ink"));
  return confetti(out, 37);
}

function game() {
  const out = [], S = 0.92;
  for (let z = 0; z < 2; z++) for (let x = 0; x < 5; x++) out.push(it(-1.84 + x * S, -1.6, -z * S, S, S, S, (x + z) % 2 ? "sun" : "teal"));
  for (let z = 0; z < 2; z++) for (let x = 0; x < 2; x++) out.push(it(0.92 + x * S, -0.68, -z * S, S, S, S, (x + z) % 2 ? "teal" : "sun"));
  out.push(it(1.84, 0.24, 0, S, S, S, "teal"));
  out.push(it(-1.4, -0.82, 0, 0.62, 0.62, 0.62, "coral"));                // герой
  out.push(it(-1.4, -0.4, 0.26, 0.14, 0.14, 0.14, "ink"));                // глаз
  out.push(it(1.84, 1.45, 0, 0.5, 0.5, 0.18, "sun", { rz: Math.PI / 4, spin: true }));   // монета
  out.push(it(-0.4, 1.35, -0.4, 0.62, 0.62, 0.62, "sun"));                // «?»-блоки
  out.push(it(0.25, 1.35, -0.4, 0.62, 0.62, 0.62, "coral"));
  return confetti(out, 53);
}

const FORMS = { logo: logo(), site: site(), bot: bot(), game: game() };
seed = 99;
const DIR = Array.from({ length: N }, () => new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() * 0.6).normalize());
const DELAY = Array.from({ length: N }, (_, i) => ((i * 7) % 17) / 17 * 0.35);

/* ---------- прокрутка → какая фигура и насколько собрана ---------- */
const chapters = Array.from(document.querySelectorAll(".chapter"));
let target = 0, cur = 0;
function readScroll() {
  const mid = scrollY + innerHeight / 2;
  const C = chapters.map((c) => c.offsetTop + c.offsetHeight / 2);
  if (mid <= C[0]) target = 0;
  else if (mid >= C[C.length - 1]) target = C.length - 1;
  else for (let k = 0; k < C.length - 1; k++) if (mid >= C[k] && mid < C[k + 1]) { target = k + (mid - C[k]) / (C[k + 1] - C[k]); break; }
}
addEventListener("scroll", readScroll, { passive: true });

let visible = true;
const io = new IntersectionObserver((es) => { es.forEach((e) => { e.target._in = e.isIntersecting; }); visible = chapters.some((c) => c._in); });
chapters.forEach((c) => io.observe(c));

let mx = 0, my = 0;
addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

function layout() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const viewH = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z, viewW = viewH * camera.aspect;
  if (phone()) {
    const k = Math.min((viewW * 0.7) / 8, (viewH * 0.26) / 7.2);   // зона между панелью кода и карточкой
    group.scale.setScalar(k);
    group.position.set(0, viewH * 0.13, 0);
  } else {
    const k = Math.min((viewW * 0.42) / 8.5, (viewH * 0.6) / 7.5);   // справа от карточки, под панелью кода
    group.scale.setScalar(k);
    group.position.set(viewW * 0.2, -viewH * 0.1, 0);
  }
}
addEventListener("resize", layout);
layout();
readScroll();
cur = target;

/* ---------- кадр ---------- */
const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();
const ease = (x) => x * x * (3 - 2 * x);
const clamp = (x) => Math.max(0, Math.min(1, x));
const names = chapters.map((c) => c.dataset.form);

const Q = new URLSearchParams(location.search);
const still = Q.has("still");          // для скриншотов: фигура сразу собрана
const perf = Q.has("perf") ? (window.__perf = { frames: 0, ms: 0 }) : null;
let last = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (!visible || document.hidden) { last = now; return; }
  const t0 = perf ? performance.now() : 0;
  const t = now / 1000, dt = Math.min(0.1, (now - (last || now)) / 1000);
  last = now;
  cur += (target - cur) * (reduce || still ? 1 : 1 - Math.exp(-dt * 5.5));   // по времени, а не по кадрам: одинаково на 60 и 120 Гц
  const k = Math.min(Math.floor(cur), names.length - 2), f = cur - k;
  const A = FORMS[names[k]], B = FORMS[names[k + 1]];
  const e = ease(clamp((f - 0.15) / 0.7));
  const blinkOn = Math.floor(t / 0.55) % 2 === 0;
  for (let i = 0; i < N; i++) {
    const a = A[i], b = B[i];
    const l = ease(clamp((e - DELAY[i]) / 0.65));
    const mid = reduce ? 0 : Math.sin(l * Math.PI);
    const fl = reduce ? 0 : (a.conf || b.conf ? 0.22 : 0.04);
    pos.set(a.p[0] + (b.p[0] - a.p[0]) * l + DIR[i].x * mid * 2.4,
      a.p[1] + (b.p[1] - a.p[1]) * l + DIR[i].y * mid * 2.4 + Math.sin(t * 1.3 + i) * fl,
      a.p[2] + (b.p[2] - a.p[2]) * l + DIR[i].z * mid * 2.4);
    let s = 1;
    if ((l < 0.5 ? a : b).blink && !blinkOn && (l < 0.02 || l > 0.98)) s = 0.12;
    scl.set((a.s[0] + (b.s[0] - a.s[0]) * l) * s, (a.s[1] + (b.s[1] - a.s[1]) * l) * s, (a.s[2] + (b.s[2] - a.s[2]) * l) * s);
    const spin = (l < 0.5 ? a : b).spin && !reduce ? t * 2 : 0;
    const cs = (a.conf || b.conf) && !reduce ? t * 0.4 + i : 0;
    e3.set(a.r[0] + (b.r[0] - a.r[0]) * l + mid * 1.6 + cs * 0.3, a.r[1] + (b.r[1] - a.r[1]) * l + spin + cs * 0.2,
      a.r[2] + (b.r[2] - a.r[2]) * l + mid * (i % 2 ? 2.2 : -2.2));
    q.setFromEuler(e3);
    m4.compose(pos, q, scl);
    body.setMatrixAt(i, m4);
    scl.addScalar(scl.x > 0.01 ? 0.07 : 0);
    m4.compose(pos, q, scl);
    hull.setMatrixAt(i, m4);
    col.copy(PAL[a.c]).lerp(PAL[b.c], l);
    body.setColorAt(i, col);
  }
  body.instanceMatrix.needsUpdate = hull.instanceMatrix.needsUpdate = true;
  body.instanceColor.needsUpdate = true;
  group.rotation.y = reduce ? -0.25 : -0.32 + Math.sin(t * 0.35) * 0.22 + mx * 0.3;
  group.rotation.x = reduce ? 0.12 : 0.14 + Math.sin(t * 0.28) * 0.05 + my * 0.12;
  renderer.render(scene, camera);
  if (perf) { perf.frames++; perf.ms += performance.now() - t0; }
}
for (let i = 0; i < N; i++) body.setColorAt(i, PAL.teal);
requestAnimationFrame(frame);
