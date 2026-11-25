/* Arvis — спільний рушій портфоліо: одна безперервна історія замість «слайдів».
   Скрол нативний (не перехоплюємо). Раз на кадр читаємо прогрес, згладжуємо lerp і роздаємо секціям CSS-змінну --p.
   Один цикл кадрів на все: пауза у прихованій вкладці, вікно 0×0 не малюємо, втрата WebGL-контексту → сайт працює без 3D.
   DPR ≤ 1,5, повільні кадри → менше пікселів, потім 30 к/с. prefers-reduced-motion → статичні кадри.
   Ліцензія — як у сайту студії; three.js передається ззовні (MIT). */

export const still = /still/.test(location.search);
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const coarse = matchMedia('(pointer: coarse)').matches;
export const weak = (navigator.hardwareConcurrency || 4) <= 4 || (navigator.deviceMemory || 8) <= 4;
export const calm = still || reduce;   // без плавного доганяння: стан одразу дорівнює прокрутці

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (x, a, b) => clamp((x - a) / (b - a));
export const smooth = (a, b, x) => { const t = seg(x, a, b); return t * t * (3 - 2 * t); };
export const ease = (k, dt) => (calm || !dt ? 1 : 1 - Math.pow(1 - k, dt * 60));   // lerp-крок, однаковий на 60 і 120 Гц

// ---------- кольори ----------
const hex2rgb = (h) => { const n = parseInt(h.replace('#', ''), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
export const mixHex = (a, b, t) => {
  const A = hex2rgb(a), B = hex2rgb(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], t)).toString(16).padStart(2, '0')).join('');
};

// ---------- стан прокрутки ----------
export const S = { p: 0, raw: 0, v: 0, speed: 0, y: scrollY, vh: innerHeight, secs: [] };
let lastY = scrollY;

/** Секції з data-sec отримують --p (0 → секція входить знизу, 1 → пішла вгору) і --c (0 → верх секції в центрі екрана, 1 → низ). */
export function track(selector = '[data-sec]') {
  S.secs = [...document.querySelectorAll(selector)].map((el) => ({ el, id: el.dataset.sec, p: 0, c: 0, raw: 0, craw: 0 }));
  return S.secs;
}
export const sec = (id) => S.secs.find((s) => s.id === id) || { p: 0, c: 0 };

function readScroll(dt) {
  const vh = innerHeight || 1, max = Math.max(1, document.documentElement.scrollHeight - vh);
  S.vh = vh; S.y = scrollY;
  S.raw = clamp(scrollY / max);
  const k = ease(0.12, dt);
  S.p = lerp(S.p, S.raw, k);
  // швидкість прокрутки в px/с, згладжена
  const v = dt ? (scrollY - lastY) / dt : 0; lastY = scrollY;
  S.v = lerp(S.v, clamp(v, -3000, 3000), calm ? 1 : ease(0.1, dt));
  S.speed = Math.abs(S.v);
  for (const s of S.secs) {
    const r = s.el.getBoundingClientRect();
    s.raw = clamp((vh - r.top) / (vh + r.height));
    s.craw = clamp((vh / 2 - r.top) / Math.max(1, r.height));
    s.p = lerp(s.p, s.raw, k); s.c = lerp(s.c, s.craw, k);
    // пишемо в стилі лише те, що змінилось (кожен запис — перерахунок стилів)
    if (r.bottom > -vh && r.top < vh * 2) { setVar(s.el, '--p', s.p.toFixed(3)); setVar(s.el, '--c', s.c.toFixed(3)); }
  }
}
const varCache = new WeakMap();
export function setVar(el, name, value) {
  let m = varCache.get(el); if (!m) varCache.set(el, (m = {}));
  if (m[name] !== value) { m[name] = value; el.style.setProperty(name, value); }
}

let lastBg = '', lastInk = '';
/** Фон і текст сторінки перетікають: колір наступної секції проступає в останніх 15% поточної. data-bg / data-ink на секціях. */
export function blendColors(root = document.documentElement) {
  const list = S.secs.filter((s) => s.el.dataset.bg);
  if (!list.length) return;
  let i = list.findIndex((s) => s.craw < 1);
  if (i < 0) i = list.length - 1;
  const cur = list[i], next = list[Math.min(list.length - 1, i + 1)];
  const t = next === cur ? 0 : smooth(0.85, 1, cur.craw);
  const bg = mixHex(cur.el.dataset.bg, next.el.dataset.bg, t);
  const ink = mixHex(cur.el.dataset.ink || '#12141a', next.el.dataset.ink || '#12141a', t);
  if (bg === lastBg && ink === lastInk) return;
  lastBg = bg; lastInk = ink;
  root.style.setProperty('--bg', bg); root.style.setProperty('--ink', ink);
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = bg;
}

// ---------- поява блоків ----------
export function reveal(selector = '.rise') {
  const els = document.querySelectorAll(selector);
  if (calm || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
}

// ---------- 3D-сцена з запобіжниками ----------
export function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

/** Повертає { renderer, ok } або null, якщо WebGL нема (сайт тоді працює без 3D). */
export function createStage(THREE, canvas, { dprMax = 1.5, antialias = !weak, onLost = null } = {}) {
  if (!THREE || !hasWebGL()) { canvas.style.display = 'none'; return null; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias, powerPreference: 'high-performance' }); } catch (e) { canvas.style.display = 'none'; return null; }
  const stage = { renderer, ok: true, pr: Math.min(devicePixelRatio || 1, weak ? 1.25 : dprMax), w: 0, h: 0, onResize: null, visible: true };
  renderer.setPixelRatio(stage.pr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  stage.kill = () => {
    if (!stage.ok) return;
    stage.ok = false; canvas.style.display = 'none';
    if (onLost) try { onLost(); } catch (e) { /* нічого */ }
  };
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stage.kill(); });
  addEventListener('pagehide', (e) => { if (!e.persisted) try { renderer.dispose(); } catch (err) { /* нічого */ } });
  // розмір: тільки коли вікно справді має розмір
  stage.fit = () => {
    const w = innerWidth, h = innerHeight;
    if (!(w > 0 && h > 0)) return false;
    if (w !== stage.w || h !== stage.h) { stage.w = w; stage.h = h; renderer.setSize(w, h, false); if (stage.onResize) stage.onResize(w, h); }
    return true;
  };
  stage.show = (on) => { if (on !== stage.visible) { stage.visible = on; canvas.style.visibility = on ? 'visible' : 'hidden'; } };
  stages.push(stage);
  return stage;
}

/** Студійне оточення для відблисків: сіра кімната з яскравими «софтбоксами». */
export function studioEnv(THREE, renderer, base = 0x3b3a38, panels = []) {
  const pmrem = new THREE.PMREMGenerator(renderer), env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: base, side: THREE.BackSide })));
  for (const [w, h, c, k, x, y, z] of panels) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  }
  const tex = pmrem.fromScene(env, 0.04).texture; pmrem.dispose();
  return tex;
}

// ---------- один цикл кадрів ----------
const stages = [];
let gap = weak ? 1000 / 31 : 0, paused = false;
addEventListener('pagehide', () => { paused = true; });
addEventListener('pageshow', (e) => { if (e.persisted) paused = false; });

/** update(dt, time) — уся анімація сайту. Помилка в 3D не зупиняє решту: сцена ховається. */
export function run(update) {
  let time = 0;
  const step = (dt) => {
    if (!(innerWidth > 0 && innerHeight > 0)) return;   // вікно ще без розміру (прихована вкладка) — чекаємо
    readScroll(dt);
    time += dt;
    for (const st of stages) if (st.ok) st.fit();
    try { update(dt, time); } catch (e) { for (const st of stages) st.kill(); if (!step.warned) { step.warned = true; console.warn('Arvis: 3D вимкнено', e); } }
  };
  if (calm) {
    const once = () => step(0);
    once(); addEventListener('scroll', once, { passive: true }); addEventListener('resize', once);
    if (document.fonts) document.fonts.ready.then(once);
    setTimeout(once, 400);
    return;
  }
  let last = performance.now(), acc = 0, n = 0;
  (function tick(now) {
    requestAnimationFrame(tick);
    if (document.hidden || paused) { last = now; return; }
    if (now - last < gap) return;
    const raw = (now - last) / 1000; last = now;
    // якість під пристрій: якщо 45 кадрів у середньому повільніші за 40 к/с — менше пікселів, потім 30 к/с
    acc += raw; n++;
    if (n === 45) {
      if (acc / n > 1 / 40) {
        const st = stages.find((s) => s.ok && s.pr > 1.01);
        if (st) { st.pr = Math.max(1, st.pr - 0.25); st.renderer.setPixelRatio(st.pr); st.w = 0; }
        else gap = 1000 / 31;
      }
      acc = 0; n = 0;
    }
    step(Math.min(0.05, raw));
  })(last);
}

// ---------- дрібниці ----------
/** Закріплена кнопка дії: з'являється після першого екрана, ховається, коли видно форму (щоб не дублювати). */
export function stickyCTA(btn, hero, target) {
  if (!btn) return;
  const state = { heroOut: false, formIn: false };
  const set = () => btn.classList.toggle('on', state.heroOut && !state.formIn);
  if (!('IntersectionObserver' in window)) { btn.classList.add('on'); return; }
  new IntersectionObserver(([e]) => { state.heroOut = !e.isIntersecting; set(); }, { threshold: 0.35 }).observe(hero);
  if (target) new IntersectionObserver(([e]) => { state.formIn = e.isIntersecting; set(); }, { threshold: 0.2 }).observe(target);
}

/** Маленький кораловий курсор Arvis у підвалі — спільний підпис портфоліо. */
export function arvisCursor(footer) {
  if (!footer || footer.querySelector('.arvis-sign')) return;
  const a = document.createElement('a');
  a.className = 'arvis-sign'; a.href = 'https://arvisstudio.github.io/portfolio/';
  a.setAttribute('aria-label', 'Інші сайти студії Arvis');
  a.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 2l15 9.5-6.6 1.4L16 21l-3 1.4-3.6-8.1L4 18.6z" fill="#ff5a3c" stroke="#12141a" stroke-width="1.4" stroke-linejoin="round"/></svg><span>arvis</span>';
  a.style.cssText = 'display:inline-flex;align-items:center;gap:6px;min-height:44px;margin-left:14px;font:700 15px/1 system-ui,sans-serif;text-decoration:none;color:inherit;vertical-align:middle';
  footer.appendChild(a);
}

// вібрація — лише доповнення: тільки після справжнього дотику (інакше браузер сварится в консолі)
export const haptic = (ms = 10) => { const ua = navigator.userActivation; if (!reduce && navigator.vibrate && (!ua || ua.hasBeenActive)) try { navigator.vibrate(ms); } catch (e) { /* нічого */ } };

/** Точки контуру тексту (для частинок, що складаються в слова). Повертає [[x,y], …] у пікселях прямокутника rect. */
export function textPoints(lines, { width, height, font, step = 3, every = 1, align = 'left' }) {
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(width)); c.height = Math.max(1, Math.round(height));
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.textBaseline = 'middle'; g.font = font; g.textAlign = align;
  const lh = height / lines.length;
  lines.forEach((l, i) => g.fillText(l, align === 'center' ? width / 2 : 0, (i + 0.5) * lh));
  const d = g.getImageData(0, 0, c.width, c.height).data, out = [];
  let k = 0;
  for (let y = 0; y < c.height; y += step) for (let x = 0; x < c.width; x += step) {
    const a = d[(y * c.width + x) * 4 + 3];
    if (a > 128) {
      // контур: сусід праворуч або знизу — порожній
      const r = d[(y * c.width + Math.min(c.width - 1, x + step)) * 4 + 3], b = d[(Math.min(c.height - 1, y + step) * c.width + x) * 4 + 3];
      if ((r < 128 || b < 128) && (k++ % every === 0)) out.push([x, y]);
    }
  }
  return out;
}
