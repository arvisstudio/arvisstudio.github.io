// Скляний куб води: тепла крапля чорнила падає, розпускається вихровим кільцем і стягується в ескіз квітки тушшю.
// p (0..1): 0–0.18 крапля падає → 0.18–0.6 вихрове кільце чорнила опускається → 0.6–0.9 частинки малюють квітку → кораловий мазок обводить стебло.
export const meta = {
  id: 'sklyaniy-kub-vodi-na-2', name: 'Чорнило у воді', for: 'тату-студія, каліграфія, галерея, флорист, косметика, парфумерія, дизайн-студія',
  idea: 'У скляний куб з темною водою падає крапля теплого чорнила й розпускається вихровим кільцем; гортаєш далі — тисячі крапок стягуються в ескіз квітки, а кораловий мазок пензля обводить стебло.',
  colors: ['#c9733f', '#ff4d3d', '#9fdce4'], color: '#c9733f',
  scale: 0.95,
  bg: '#0f1517',
};

const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const smooth = k => k * k * (3 - 2 * k);
const num = (v, d) => Number.isFinite(v) ? v : d;

// рівномірна вибірка точок уздовж плоскої кривої за довжиною дуги — щоб пунктир був рівним
function arcSampler(fn, N = 1200) {
  const xs = new Float32Array(N + 1), ys = new Float32Array(N + 1), L = new Float32Array(N + 1);
  for (let i = 0; i <= N; i++) {
    const [x, y] = fn(i / N); xs[i] = x; ys[i] = y;
    if (i) L[i] = L[i - 1] + Math.hypot(x - xs[i - 1], y - ys[i - 1]);
  }
  return (u, out) => {
    const tg = u * L[N]; let lo = 0, hi = N;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] < tg) lo = m; else hi = m; }
    const w = (tg - L[lo]) / Math.max(1e-6, L[hi] - L[lo]);
    out[0] = xs[lo] + (xs[hi] - xs[lo]) * w; out[1] = ys[lo] + (ys[hi] - ys[lo]) * w;
    return out;
  };
}

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const TAU = Math.PI * 2, R = Math.random;
  const H = 1.15, TOP = 0.9, IMPACT = 0.18, MORPH0 = 0.6, MORPH1 = 0.9;
  const root = new THREE.Group();
  const disposables = [];
  const keep = (...a) => { disposables.push(...a); return a[0]; };

  // --- Скло ---
  const boxGeo = keep(new THREE.BoxGeometry(2 * H, 2 * H, 2 * H));
  const glass = new THREE.Mesh(boxGeo, keep(new THREE.MeshPhysicalMaterial({
    color: '#dff3f5', roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04,
    envMapIntensity: 2, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.FrontSide,
  })));
  glass.renderOrder = 6;
  const edges = new THREE.LineSegments(keep(new THREE.EdgesGeometry(boxGeo)),
    keep(new THREE.LineBasicMaterial({ color: '#c3e3e7', transparent: true, opacity: 0.55 })));
  edges.renderOrder = 7;

  // --- Товща води: градієнт від бірюзи під поверхнею до глибокої темряви на дні ---
  const IW = 2 * H - 0.05, BOT = -H + 0.03, wh = TOP - BOT;
  const waterGeo = keep(new THREE.BoxGeometry(IW, wh, IW, 1, 6, 1));
  waterGeo.translate(0, BOT + wh / 2, 0);
  {
    const wp = waterGeo.attributes.position, wc = new Float32Array(wp.count * 3);
    const cTop = new THREE.Color('#2f97a3'), cBot = new THREE.Color('#06262d'), cc = new THREE.Color();
    for (let i = 0; i < wp.count; i++) {
      const k = clamp((wp.getY(i) - BOT) / wh);
      cc.copy(cBot).lerp(cTop, Math.pow(k, 1.6)); wc.set([cc.r, cc.g, cc.b], i * 3);
    }
    waterGeo.setAttribute('color', new THREE.BufferAttribute(wc, 3));
  }
  const water = new THREE.Mesh(waterGeo, keep(new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.BackSide,
  })));
  water.renderOrder = 0;
  const front = new THREE.Mesh(waterGeo, keep(new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.FrontSide,
  })));
  front.renderOrder = 5;

  // поверхня води: темна, прозора, з відблиском френеля на брижах
  const SEG = weak ? 32 : 56;
  const surfGeo = keep(new THREE.PlaneGeometry(IW, IW, SEG, SEG));
  surfGeo.rotateX(-Math.PI / 2);
  const sPos = surfGeo.attributes.position, sBase = Float32Array.from(sPos.array);
  const surfMat = keep(new THREE.MeshStandardMaterial({
    color: '#0b3036', roughness: 0.06, metalness: 0.1, envMapIntensity: 1.8,
    transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide,
  }));
  surfMat.onBeforeCompile = sh => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', `
      float fres = pow(1.0 - clamp(abs(dot(normalize(vViewPosition), normal)), 0.0, 1.0), 2.6);
      outgoingLight += vec3(0.62, 0.86, 0.9) * fres * 0.6;
      diffuseColor.a = clamp(diffuseColor.a + fres * 0.6, 0.0, 1.0);
      #include <opaque_fragment>`);
  };
  surfMat.customProgramCacheKey = () => 'ink-water-fresnel';
  const surf = new THREE.Mesh(surfGeo, surfMat);
  surf.position.y = TOP; surf.renderOrder = 3;
  const wl = IW / 2;
  const waterLine = new THREE.LineLoop(keep(new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-wl, TOP, -wl), new THREE.Vector3(wl, TOP, -wl), new THREE.Vector3(wl, TOP, wl), new THREE.Vector3(-wl, TOP, wl),
  ])), keep(new THREE.LineBasicMaterial({ color: '#9fdce4', transparent: true, opacity: 0.4 })));
  waterLine.renderOrder = 4;
  root.add(water, surf, waterLine, front, glass, edges);

  // --- Крапля-сльоза ---
  const prof = [];
  for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI; prof.push(new THREE.Vector2(Math.max(1e-4, Math.sin(a) * Math.sin(a / 2) * 0.55), Math.cos(a))); }
  const dropMat = keep(new THREE.MeshPhysicalMaterial({ color, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.4 }));
  const drop = new THREE.Mesh(keep(new THREE.LatheGeometry(prof, weak ? 18 : 32)), dropMat);
  root.add(drop);

  // --- Чорнило: частинки ---
  const ink = new THREE.Group(); ink.rotation.order = 'YXZ'; root.add(ink);
  const n = weak ? 3500 : 7000;
  const a0 = new Float32Array(n), ph = new Float32Array(n), cr = new Float32Array(n), gen = new Uint8Array(n),
    tu = new Float32Array(n), sd = new Float32Array(n), fl = new Float32Array(n * 3);
  const col = new Float32Array(n * 4); // rgb + власна прозорість кожної крапки
  const bR = new Float32Array(n), aR = new Float32Array(n), bF = new Float32Array(n), aF = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    a0[i] = R() * TAU; ph[i] = R() * TAU; sd[i] = R();
    gen[i] = R() < 0.76 ? 0 : 1; // 0 — головне кільце, 1 — менше кільце вище
    tu[i] = R() < 0.16 ? 0.04 + R() * 0.96 : 0; // тонкі нитки від точки падіння до кільця
    const halo = R() > 0.84;
    cr[i] = halo ? 1 + R() * 0.9 : Math.pow(R(), 1.8); // густе ядро + рідкий ореол
    if (tu[i] > 0) { bR[i] = 0.85 + R() * 0.3; aR[i] = 0.18 + R() * 0.35; }
    else if (halo) { bR[i] = 1.05 + R() * 0.15; aR[i] = 0.12 + R() * 0.22; }
    else { bR[i] = 0.55 + cr[i] * 0.45 + R() * 0.08; aR[i] = 0.95 - cr[i] * 0.45 - R() * 0.15; } // ядро темніше й щільніше
    bF[i] = 0.82 + R() * 0.2; aF[i] = 0.78 + R() * 0.22;
  }

  // лінія стебла — спільна для частинок і коралового мазка
  const CY = -0.15;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.1, -0.95, 0.05), new THREE.Vector3(0.17, -0.74, 0.06), new THREE.Vector3(0.08, -0.5, 0.07),
    new THREE.Vector3(0.0, CY - 0.14, 0.09), new THREE.Vector3(0.1, CY - 0.03, 0.11), new THREE.Vector3(0.04, CY + 0.07, 0.12),
    new THREE.Vector3(-0.05, CY + 0.04, 0.12),
  ]);

  // ескіз квітки: упевнений штрих тушшю — більшість крапок на контурі пелюсток
  const jit = s => (R() - 0.5) * s;
  const tmp = new THREE.Vector3(), leafA = new THREE.Vector3(), leafB = new THREE.Vector3(), o2 = [0, 0];
  curve.getPointAt(0.3, leafA); curve.getPointAt(0.1, leafB);
  const PR = 0.8, IR = 0.38, J = 0.005;
  const outer = arcSampler(u => { const th = u * TAU, r = PR * Math.pow(Math.abs(Math.cos(2.5 * th)), 0.65) * (1 + 0.035 * Math.sin(th * 7));
    return [Math.cos(th + 0.31) * r, Math.sin(th + 0.31) * r]; });
  const inner = arcSampler(u => { const th = u * TAU, r = IR * Math.pow(Math.abs(Math.cos(2.5 * th)), 0.7);
    return [Math.cos(th) * r, Math.sin(th) * r]; });
  const leaf = arcSampler(u => { const up = u < 0.5, v = up ? u * 2 : 2 - u * 2; // контур: верхня дуга туди, нижня назад
    return [v, (up ? 1 : -1) * Math.sin(Math.PI * v) * (1 - 0.25 * v)]; });
  for (let i = 0; i < n; i++) {
    const k = R(); let x, y, z;
    if (k < 0.58) { // зовнішні пелюстки
      outer(R(), o2); x = o2[0] + jit(J); y = CY + o2[1] + jit(J); z = jit(0.008);
    } else if (k < 0.76) { // внутрішні пелюстки
      inner(R(), o2); x = o2[0] + jit(J); y = CY + o2[1] + jit(J); z = 0.04 + jit(0.008);
    } else if (k < 0.8) { // серцевина-спіраль
      const u = R(), th = u * TAU * 2, r = 0.02 + 0.1 * u;
      x = Math.cos(th) * r + jit(0.004); y = CY + Math.sin(th) * r + jit(0.004); z = 0.07;
    } else if (k < 0.87) { // стебло — по кривій коралового мазка
      curve.getPointAt(R() * 0.62, tmp);
      x = tmp.x + jit(0.005); y = tmp.y + jit(0.005); z = tmp.z - 0.012;
    } else { // два листки: контур і коротка жилка
      const big = R() < 0.62, b = big ? leafA : leafB, ang = big ? 0.55 : Math.PI - 0.5;
      const L = big ? 0.58 : 0.4, W = big ? 0.14 : 0.1;
      let lx, ly;
      if (R() < 0.85) { leaf(R(), o2); lx = o2[0] * L; ly = o2[1] * W; } else { lx = R() * L * 0.75; ly = 0; }
      const ca = Math.cos(ang), sa = Math.sin(ang);
      x = b.x + lx * ca - ly * sa + jit(J); y = b.y + lx * sa + ly * ca + jit(J); z = b.z - 0.02;
    }
    fl.set([x, y, z], i * 3);
  }

  const geo = keep(new THREE.BufferGeometry());
  const pos = new Float32Array(n * 3);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const colAttr = new THREE.BufferAttribute(col, 4);
  geo.setAttribute('color', colAttr);
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g2 = c.getContext('2d'), gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
  const tex = keep(new THREE.CanvasTexture(c));
  const pMat = keep(new THREE.PointsMaterial({ color, size: weak ? 0.034 : 0.027, map: tex, vertexColors: true, transparent: true, depthWrite: false }));
  const pts = new THREE.Points(geo, pMat); pts.renderOrder = 1; pts.frustumCulled = false;
  ink.add(pts);

  // --- Кораловий мазок: пласка стрічка пензля, повернута до камери ---
  const TS = weak ? 90 : 160;
  const rib = new Float32Array((TS + 1) * 6), ribN = new Float32Array((TS + 1) * 6), ribIdx = [];
  {
    const pc = new THREE.Vector3(), tg = new THREE.Vector3();
    for (let j = 0; j <= TS; j++) {
      const u = j / TS; curve.getPointAt(u, pc); curve.getTangentAt(u, tg);
      const sl = Math.hypot(tg.x, tg.y) || 1, sx = -tg.y / sl, sy = tg.x / sl;
      // натиск пензля: тонкий початок, повний посередині, гострий хвостик у завитку
      const w = 0.017 * (0.12 + 0.88 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.08)), 0.55)) * (1 - 0.3 * u) * (0.9 + 0.1 * Math.sin(u * 47));
      rib.set([pc.x + sx * w, pc.y + sy * w, pc.z + 0.012, pc.x - sx * w, pc.y - sy * w, pc.z + 0.012], j * 6);
      ribN.set([0, 0, 1, 0, 0, 1], j * 6);
      if (j < TS) { const a = j * 2; ribIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
  }
  const ribGeo = keep(new THREE.BufferGeometry());
  ribGeo.setAttribute('position', new THREE.BufferAttribute(rib, 3));
  ribGeo.setAttribute('normal', new THREE.BufferAttribute(ribN, 3));
  ribGeo.setIndex(ribIdx);
  const stroke = new THREE.Mesh(ribGeo, keep(new THREE.MeshStandardMaterial({
    color: '#ff4d3d', roughness: 0.9, metalness: 0, envMapIntensity: 0.6, side: THREE.DoubleSide,
  })));
  stroke.renderOrder = 2; stroke.frustumCulled = false;
  ink.add(stroke);
  const strokeTotal = ribIdx.length, strokeStep = 6;

  root.rotation.set(0.32, 0.6, 0);
  const want = new THREE.Color(color);
  let shown = 0;

  return {
    object: root,
    update(fr = {}) {
      const t = num(fr.t, 0), dt = num(fr.dt, 0), mx = num(fr.mx, 0), my = num(fr.my, 0);
      const P = clamp(num(fr.p, 0));
      shown = fr.instant || !Number.isFinite(shown) ? P : shown + (P - shown) * Math.min(1, dt * 3);
      const s = shown;

      root.rotation.y = 0.6 + Math.sin(t * 0.3) * 0.06 + mx * 0.35;
      root.rotation.x = 0.32 + my * 0.18;

      // крапля
      const fall = clamp(s / IMPACT), fe = fall * fall;
      const sink = clamp((s - IMPACT) / 0.035);
      drop.visible = sink < 1;
      drop.position.set(0, 1.75 + (TOP + 0.05 - 1.75) * fe + Math.sin(t * 1.6) * 0.03 * (1 - fall), 0);
      const ds = 0.2 * (1 - sink);
      drop.scale.set(ds * (1 - fe * 0.15), ds * (1 + fe * 0.45), ds * (1 - fe * 0.15));
      drop.rotation.z = Math.sin(t * 1.2) * 0.08 * (1 - fall);

      // брижі: постійні хвилі + помітні кола після удару, що згасають до легкого тремтіння
      const age = s - IMPACT, rip = age > 0 ? clamp(age / 0.03) * (0.3 + 0.7 * (1 - clamp(age / 0.45))) : 0;
      const sp = sPos.array;
      for (let i = 0; i < sp.length; i += 3) {
        const x = sBase[i], z = sBase[i + 2], d = Math.sqrt(x * x + z * z);
        sp[i + 1] = 0.018 * Math.sin(x * 3.2 + t * 0.9) * Math.cos(z * 2.6 - t * 0.7)
          + 0.008 * Math.sin((x + z) * 7 - t * 1.7)
          + rip * 0.14 * Math.sin(d * 13 - age * 60 - t * 2.5) * Math.exp(-d * 1.3);
      }
      sPos.needsUpdate = true; surfGeo.computeVertexNormals();

      // чорнило: вихрове кільце з густим ядром, ореолом і нитками
      pts.visible = s > IMPACT - 0.002;
      const k = clamp((s - IMPACT) / (MORPH0 - IMPACT)), kk = 1 - (1 - k) * (1 - k);
      const f = clamp((s - MORPH0) / (MORPH1 - MORPH0));
      for (let i = 0; i < n; i++) {
        const g = gen[i], j = i * 3, q = i * 4;
        const depth = kk * (g ? 0.78 : 1.45), Rg = 0.05 + kk * (g ? 0.3 : 0.58), cmax = 0.025 + kk * (g ? 0.06 : 0.1);
        const az = a0[i] + kk * (g ? 2.2 : 1.4) + t * 0.12;
        const phi = ph[i] + kk * 9 + t * (g ? 1.1 : 0.8); // вихор котиться навколо кільця
        let rad, y;
        if (tu[i] > 0) {
          const u = tu[i];
          rad = Rg * Math.pow(u, 1.6) + Math.sin(u * 9 + a0[i] * 3 + t * 0.6) * 0.012 * kk;
          y = TOP - depth * u;
        } else {
          const core = cr[i] * cmax;
          rad = Rg + Math.cos(phi) * core + Math.sin(a0[i] * 5 + ph[i] * 3 + t * 0.3) * 0.012 * kk;
          y = TOP - depth + Math.sin(phi) * core * 1.15;
        }
        let x = Math.cos(az) * rad, z = Math.sin(az) * rad, e = 0;
        if (f > 0) { // стягування в ескіз: кожна крапка рушає трохи пізніше
          e = smooth(clamp((f - sd[i] * 0.35) / 0.65)); const sw = Math.sin(Math.PI * e) * 0.2;
          x += (fl[j] - x) * e + Math.cos(az + 1.6) * sw;
          y += (fl[j + 1] - y) * e;
          z += (fl[j + 2] - z) * e + Math.sin(az + 1.6) * sw;
          if (e >= 1) { x += Math.sin(t * 1.3 + sd[i] * 30) * 0.0012; y += Math.cos(t * 1.1 + sd[i] * 20) * 0.0012; }
        }
        pos[j] = x; pos[j + 1] = y; pos[j + 2] = z;
        const b = bR[i] + (bF[i] - bR[i]) * e;
        col[q] = b; col[q + 1] = b; col[q + 2] = b; col[q + 3] = aR[i] + (aF[i] - aR[i]) * e;
      }
      geo.attributes.position.needsUpdate = true; colAttr.needsUpdate = true;

      // квітка розвертається до глядача; лишається під водою
      const ff = smooth(f);
      ink.rotation.y = -root.rotation.y * ff;
      ink.rotation.x = -root.rotation.x * ff * 0.85;
      ink.scale.setScalar(1 + 0.1 * ff);

      // кораловий мазок обводить стебло знизу вгору
      const sf = clamp((s - 0.72) / 0.24);
      stroke.visible = sf > 0;
      ribGeo.setDrawRange(0, Math.floor(smooth(sf) * strokeTotal / strokeStep) * strokeStep);

      const lk = fr.instant ? 1 : 1 - Math.pow(0.02, dt);
      pMat.color.lerp(want, lk); dropMat.color.copy(pMat.color);
    },
    setColor(hex) { want.set(hex); },
    dispose() { disposables.forEach(d => d.dispose()); },
  };
}
