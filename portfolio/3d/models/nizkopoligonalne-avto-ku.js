// Автомийка: низькополігональне авто на конвеєрі під жовтою аркою.
// p (0..1): брудне авто → в'їжджає під арку → падає шапка піни → щітки → вода → сушка → чистий глянцевий кузов з відблиском.
export const meta = {
  id: 'nizkopoligonalne-avto-ku', name: 'Автомийка', for: 'автомийка, детейлінг, хімчистка авто, СТО, шиномонтаж',
  idea: 'Бірюзове авто в плямах бруду їде конвеєром під жовту арку: на нього падає шапка піни, крутяться щітки, ллється вода, дме сушка — і назовні виїжджає чистий блискучий кузов.',
  colors: ['#1fb3a6', '#f2c230', '#2f6fa3', '#2a2f35'], color: '#1fb3a6', scale: 0.88,
  bg: '#16232b',
};

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const cl = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const ss = (a, b, v) => { const x = cl((v - a) / (b - a)); return x * x * (3 - 2 * x); };
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const geos = [], mats = [];
  const G = g => (geos.push(g), g), M = m => (mats.push(m), m);

  const root = new THREE.Group(), world = new THREE.Group();
  root.add(world); world.position.y = -0.82;

  // ── матеріали
  const paint = M(new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1, flatShading: true }));
  const glass = M(new THREE.MeshStandardMaterial({ color: 0x14212a, roughness: 0.12, metalness: 0.6, flatShading: true }));
  const dark = M(new THREE.MeshStandardMaterial({ color: 0x2a2f35, roughness: 0.7, metalness: 0.2, flatShading: true }));
  const steel = M(new THREE.MeshStandardMaterial({ color: 0xc3c8ce, roughness: 0.3, metalness: 0.9, flatShading: true }));
  const yellow = M(new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.45, metalness: 0.05, flatShading: true }));
  const brushM = M(new THREE.MeshStandardMaterial({ color: 0x2f6fa3, roughness: 0.95, flatShading: true }));

  // ── профіль кузова (вид збоку, перед — у бік +x) і верхня лінія для піни/бруду
  const prof = [[-0.92, 0.14], [0.92, 0.14], [0.94, 0.40], [0.56, 0.50], [0.30, 0.82], [-0.36, 0.82], [-0.64, 0.52], [-0.93, 0.47]];
  const topLine = [[-0.93, 0.47], [-0.64, 0.52], [-0.36, 0.82], [0.30, 0.82], [0.56, 0.50], [0.94, 0.40]];
  const top = x => {
    for (let i = 0; i < topLine.length - 1; i++) {
      const [x0, y0] = topLine[i], [x1, y1] = topLine[i + 1];
      if (x >= x0 && x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
    return 0.14;
  };
  const shapeOf = pts => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); s.closePath(); return s; };

  // ── авто
  const car = new THREE.Group(); world.add(car);
  const bodyGeo = G(new THREE.ExtrudeGeometry(shapeOf(prof), { depth: 0.76, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 1 }));
  bodyGeo.translate(0, 0, -0.38);
  car.add(new THREE.Mesh(bodyGeo, paint));
  // бокові вікна (дві секції зі стійкою)
  [[[0.50, 0.53], [0.29, 0.79], [-0.02, 0.79], [-0.02, 0.53]], [[-0.08, 0.53], [-0.08, 0.79], [-0.33, 0.79], [-0.58, 0.54]]].forEach(w => {
    const g = G(new THREE.ExtrudeGeometry(shapeOf(w), { depth: 0.87, bevelEnabled: false })); g.translate(0, 0, -0.435);
    car.add(new THREE.Mesh(g, glass));
  });
  // лобове й заднє скло — пластини на скошених гранях
  const slab = (a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), nx = dy / len, ny = -dx / len;
    const m = new THREE.Mesh(G(new THREE.BoxGeometry(len * 0.82, 0.02, 0.66)), glass);
    m.position.set((a[0] + b[0]) / 2 + nx * 0.035, (a[1] + b[1]) / 2 + ny * 0.035, 0);
    m.rotation.z = Math.atan2(dy, dx); car.add(m);
  };
  slab([0.56, 0.50], [0.30, 0.82]); slab([-0.36, 0.82], [-0.64, 0.52]);
  // бампери, фари, ліхтарі
  [-0.94, 0.95].forEach(x => { const b = new THREE.Mesh(G(new THREE.BoxGeometry(0.1, 0.09, 0.88)), dark); b.position.set(x, 0.17, 0); car.add(b); });
  const headM = M(new THREE.MeshStandardMaterial({ color: 0xfff1c2, emissive: 0xffe08a, emissiveIntensity: 0.35, roughness: 0.2 }));
  const tailM = M(new THREE.MeshStandardMaterial({ color: 0xd8342c, emissive: 0x801010, emissiveIntensity: 0.3, roughness: 0.3 }));
  const lampG = G(new THREE.BoxGeometry(0.04, 0.07, 0.15));
  [-0.27, 0.27].forEach(z => {
    const h = new THREE.Mesh(lampG, headM); h.position.set(0.965, 0.33, z); car.add(h);
    const t = new THREE.Mesh(lampG, tailM); t.position.set(-0.955, 0.40, z); car.add(t);
  });
  // колеса — грубі восьмикутники
  const wheels = [], tyreG = G(new THREE.CylinderGeometry(0.17, 0.17, 0.15, 9)), hubG = G(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 6));
  [[-0.56, -0.4], [-0.56, 0.4], [0.58, -0.4], [0.58, 0.4]].forEach(([x, z]) => {
    const w = new THREE.Group(), tyre = new THREE.Mesh(tyreG, dark), hub = new THREE.Mesh(hubG, steel);
    tyre.rotation.x = hub.rotation.x = Math.PI / 2;
    w.add(tyre, hub); w.position.set(x, 0.17, z); car.add(w); wheels.push(w);
  });
  car.position.y = 0.06;

  // ── поверхня кузова: випадкова точка збоку або згори (для бруду й крапель)
  const surf = () => {
    if (rnd() < 0.6) {
      const x = -0.86 + rnd() * 1.72, t = top(x), y = 0.2 + (t - 0.26) * Math.pow(rnd(), 1.6);
      return { x, y, z: rnd() < 0.5 ? -0.437 : 0.437, side: true };
    }
    const x = -0.88 + rnd() * 1.78;
    return { x, y: top(x) + 0.035, z: (rnd() - 0.5) * 0.72, side: false };
  };
  const m4 = new THREE.Matrix4(), v3 = new THREE.Vector3(), sc = new THREE.Vector3(), q = new THREE.Quaternion(), q0 = new THREE.Quaternion(), eu = new THREE.Euler();
  // нульовий масштаб дає NaN у нормалях інстансу (ділення на 0 у шейдері) — ховаємо мікромасштабом
  const E = 1e-4, nz = v => (v > E || v < -E) ? v : E;
  const put = (mesh, i, x, y, z, sx, sy, sz, qq = q0) => { v3.set(x, y, z); sc.set(nz(sx), nz(sy), nz(sz)); m4.compose(v3, qq, sc); mesh.setMatrixAt(i, m4); };
  // межі інстансів рахуються один раз на першому кадрі — без відсікання, інакше частини зникають
  const inst = m => { m.frustumCulled = false; return m; };

  // бруд — сплющені багатогранники
  const ND = weak ? 60 : 110;
  const dirt = inst(new THREE.InstancedMesh(G(new THREE.IcosahedronGeometry(1, 0)), M(new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true })), ND));
  const dirtD = [], dc = new THREE.Color();
  for (let i = 0; i < ND; i++) {
    const s = surf(), r = 0.04 + rnd() * 0.07;
    s.q = new THREE.Quaternion().setFromEuler(s.side ? eu.set(0, 0, rnd() * 3) : eu.set(0, rnd() * 3, 0));
    s.sc = s.side ? [r, r * 0.7, 0.02] : [r, 0.02, r * 0.8]; s.th = rnd();
    dirtD.push(s); dirt.setColorAt(i, dc.setHSL(0.08 + rnd() * 0.03, 0.35, 0.16 + rnd() * 0.12));
  }
  car.add(dirt);

  // краплі на кузові після мийки
  const NB = weak ? 45 : 90;
  const waterM = M(new THREE.MeshStandardMaterial({ color: 0xbfe6ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85 }));
  const beads = inst(new THREE.InstancedMesh(G(new THREE.IcosahedronGeometry(1, 1)), waterM, NB)), beadD = [];
  for (let i = 0; i < NB; i++) { const s = surf(); s.r = 0.012 + rnd() * 0.016; s.th = rnd(); beadD.push(s); }
  car.add(beads);

  // шапка піни: великі сплющені «подушки» вздовж даху + дрібніші грудки зверху + патьоки на боках.
  // Грані перекриваються й зливаються в одну м'яку шапку, а не в купу однакових кульок.
  const NF = weak ? 90 : 170, NBIG = weak ? 7 : 11;
  const foam = inst(new THREE.InstancedMesh(G(new THREE.IcosahedronGeometry(1, weak ? 0 : 1)),
    M(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, flatShading: true })), NF));
  const foamD = [];
  for (let i = 0; i < NF; i++) {
    let x, y, z, r, ax, ay, az, side = false;
    if (i < NBIG) {
      // подушки, що лягають суцільним шаром по верхній лінії кузова
      x = -0.82 + 1.66 * i / (NBIG - 1) + (rnd() - 0.5) * 0.08; z = (rnd() - 0.5) * 0.12;
      r = 0.17 + rnd() * 0.07; ax = 1.15 + rnd() * 0.3; ay = 0.38 + rnd() * 0.12; az = 1.9 + rnd() * 0.25;
      y = top(x) + r * ay * 0.45;
    } else if (rnd() < 0.2) {
      // патьоки по боках
      side = true; x = (rnd() - 0.5) * 1.7; z = (rnd() < 0.5 ? -1 : 1) * (0.42 + rnd() * 0.03);
      r = 0.04 + rnd() * 0.06; ax = 1 + rnd() * 0.4; ay = 0.9 + rnd() * 0.5; az = 0.45;
      y = top(x) - 0.04 - rnd() * 0.18;
    } else {
      // грудки зверху: що вище, то дрібніші
      x = (rnd() + rnd() - 1) * 0.9; z = (rnd() - 0.5) * 0.7;
      const heap = 0.22 * (1 - (x / 0.95) ** 2) * (1 - (z / 0.42) ** 2), h = rnd();
      r = (0.05 + Math.pow(rnd(), 2) * 0.12) * (1 - h * 0.45);
      ax = 1 + rnd() * 0.35; ay = 0.5 + rnd() * 0.25; az = 1 + rnd() * 0.35;
      y = top(x) + 0.07 + heap * h;
    }
    foamD.push({
      tx: x, ty: y, tz: z, sx: x * 0.2, sy: 1.25 + rnd() * 0.25, sz: z * 0.4, r, ax, ay, az, side,
      q: new THREE.Quaternion().setFromEuler(eu.set((rnd() - 0.5) * 0.3, rnd() * 6.28, (rnd() - 0.5) * 0.3)),
      d: i < NBIG ? rnd() * 0.25 : 0.2 + rnd() * 0.8, w: rnd(),
    });
    foam.setColorAt(i, dc.setHSL(0.55, 0.35, 0.9 + rnd() * 0.1));
  }
  car.add(foam);

  // ── конвеєр: основа, бортики й ламелі, що їдуть разом з авто
  const base = new THREE.Mesh(G(new THREE.BoxGeometry(4.2, 0.06, 1.1)), dark); base.position.y = 0.03; world.add(base);
  [-0.57, 0.57].forEach(z => { const r = new THREE.Mesh(G(new THREE.BoxGeometry(4.2, 0.07, 0.04)), steel); r.position.set(0, 0.07, z); world.add(r); });
  const NS = weak ? 18 : 28, LEN = 4.1;
  const slats = inst(new THREE.InstancedMesh(G(new THREE.BoxGeometry(0.09, 0.02, 1.0)), steel, NS));
  world.add(slats);

  // ── арка мийки: консольна Г-подібна рама — одна стійка ззаду, балка нависає над авто.
  // Ближньої до глядача стійки немає, тож авто під аркою видно цілком.
  // (після rotateY(π/2) x профілю стає −z світу: x=+1.3 — дальній бік)
  const archG = G(new THREE.ExtrudeGeometry(shapeOf([[1.18, 0], [1.42, 0], [1.42, 1.78], [-1.02, 1.78], [-1.02, 1.36], [-0.84, 1.36], [-0.84, 1.52], [1.18, 1.52]]),
    { depth: 0.32, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1 }));
  archG.translate(0, 0, -0.16); archG.rotateY(Math.PI / 2);
  world.add(new THREE.Mesh(archG, yellow));
  const foot = new THREE.Mesh(G(new THREE.BoxGeometry(0.5, 0.08, 0.36)), dark); foot.position.set(0, 0.04, -1.3); world.add(foot);
  const bar = new THREE.Mesh(G(new THREE.BoxGeometry(0.12, 0.05, 2.0)), dark); bar.position.set(0, 1.46, -0.1); world.add(bar);
  // смуги на арці
  const stripeG = G(new THREE.BoxGeometry(0.42, 0.05, 0.05));
  [-0.95, -0.5, -0.05, 0.4].forEach(z => { const s = new THREE.Mesh(stripeG, dark); s.position.set(0, 1.66, z); s.rotation.x = 0.6; world.add(s); });

  // щітки: циліндр з «зірчастим» профілем — ворс
  const brushGeo = (r, h) => {
    const g = G(new THREE.CylinderGeometry(r, r, h, 24, 6)), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), z = P.getZ(i), a = Math.atan2(z, x), k = Math.round(a / (Math.PI * 2 / 24));
      const f = (k & 1) ? 0.72 : 1, y = P.getY(i), wob = 1 + 0.06 * Math.sin(y * 18 + a * 3);
      P.setX(i, x * f * wob); P.setZ(i, z * f * wob);
    }
    g.computeVertexNormals(); return g;
  };
  const axleG = G(new THREE.CylinderGeometry(0.025, 0.025, 1, 6));
  const sideBrushes = [-1, 1].map(sg => {
    const grp = new THREE.Group(), b = new THREE.Mesh(brushGeo(0.2, 0.95), brushM), ax = new THREE.Mesh(axleG, steel);
    b.position.y = 0.66; ax.scale.y = 0.4; ax.position.y = 1.31;
    grp.add(b, ax); grp.userData = { sg, b }; world.add(grp); return grp;
  });
  const topBrush = new THREE.Group(), tb = new THREE.Mesh(brushGeo(0.17, 0.9), brushM), tax = new THREE.Mesh(axleG, steel);
  tb.rotation.x = Math.PI / 2; tax.rotation.x = Math.PI / 2; tax.scale.y = 1.95; tax.position.z = -0.12;
  topBrush.add(tb, tax); world.add(topBrush);

  // струмені води з форсунок
  const NW = weak ? 120 : 240;
  const drops = inst(new THREE.InstancedMesh(G(new THREE.IcosahedronGeometry(1, 0)), waterM, NW)), dropD = [];
  for (let i = 0; i < NW; i++) dropD.push({ x: (rnd() - 0.5) * 0.24, z: -0.1 + (rnd() - 0.5) * 1.7, ph: rnd(), sp: 0.9 + rnd() * 0.6, r: 0.012 + rnd() * 0.01 });
  world.add(drops);

  // потік повітря сушки — тонкі косі риски
  const NA = weak ? 30 : 60;
  const air = inst(new THREE.InstancedMesh(G(new THREE.BoxGeometry(0.008, 0.2, 0.008)), M(new THREE.MeshBasicMaterial({ color: 0xe8f4f8, transparent: true, opacity: 0.55, depthWrite: false })), NA)), airD = [];
  for (let i = 0; i < NA; i++) airD.push({ x: (rnd() - 0.5) * 0.3, z: -0.1 + (rnd() - 0.5) * 1.7, ph: rnd(), sp: 1.6 + rnd() * 0.8 });
  world.add(air);
  const qAir = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -0.55));

  // відблиск на чистому кузові — чотирипроменеві зірочки
  const starPts = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i & 1 ? 0.16 : 1; starPts.push([Math.cos(a) * r, Math.sin(a) * r]); }
  const starG = G(new THREE.ShapeGeometry(shapeOf(starPts))), starM = M(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false }));
  const stars = [[0.3, 0.9, 0.44], [0.93, 0.43, 0.45], [-0.62, 0.58, 0.45]].map(p => { const s = new THREE.Mesh(starG, starM); s.position.set(...p); car.add(s); return s; });

  const want = new THREE.Color(color), cur = new THREE.Color(color), dust = new THREE.Color(0x7d7563);
  const qInv = new THREE.Quaternion();
  let shown = 0, spinS = 0, spinT = 0;

  let failed = false;
  // одразу розставляємо стан p=0, щоб інстанси не стояли одиничними кулями в центрі до першого кадру
  try { step({ p: 0, instant: true }); } catch (e) { console.error('avto: init', e); }
  return {
    object: root,
    // помилка в анімації не повинна зупиняти рендер: ловимо, лишаємо останній стан
    update(f = {}) {
      if (failed) return;
      try { step(f || {}); } catch (e) { failed = true; console.error('avto: update', e); }
    },
    setColor(hex) { want.set(hex); },
    dispose() { geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose()); [dirt, beads, foam, slats, drops, air].forEach(m => m.dispose && m.dispose()); },
  };

  function step(f) {
    {
      // захист від неповного кадру: будь-яке NaN/undefined → безпечне значення
      const num = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : (isFinite(+v) && v !== null && v !== '' ? +v : d);
      const t = num(f.t, 0), dt = Math.max(0, num(f.dt, 0)), mx = num(f.mx, 0), my = num(f.my, 0), instant = !!f.instant;
      const pp = cl(num(f.p, 0));
      shown = instant ? pp : shown + (pp - shown) * Math.min(1, dt * 3);
      const s = shown;

      // рух авто: стоїть перед аркою → заїжджає під неї → виїжджає чистим
      const carX = -1.3 + 1.3 * ss(0.04, 0.3, s) + 1.15 * ss(0.76, 0.98, s);
      car.position.x = carX;
      wheels.forEach(w => { w.rotation.z = -carX / 0.17; });

      // ламелі конвеєра їдуть разом з авто
      for (let i = 0; i < NS; i++) {
        let x = ((i / NS) * LEN + carX) % LEN; if (x < 0) x += LEN;
        put(slats, i, x - LEN / 2, 0.065, 0, 1, 1, 1);
      }
      slats.instanceMatrix.needsUpdate = true;

      // бруд сходить під щітками й водою
      const wash = cl((s - 0.47) / 0.27);
      for (let i = 0; i < ND; i++) {
        const d = dirtD[i], k = 1 - cl(wash * 1.5 - d.th * 0.5);
        put(dirt, i, d.x, d.y, d.z, d.sc[0] * k, d.sc[1] * k, d.sc[2] * k, d.q);
      }
      dirt.instanceMatrix.needsUpdate = true;

      // піна: падає (0.30–0.45), потім стікає й тане (0.50–0.75)
      const fall = cl((s - 0.3) / 0.15), melt = cl((s - 0.5) / 0.25);
      for (let i = 0; i < NF; i++) {
        const o = foamD[i], k = cl((fall - o.d * 0.6) / 0.4), e = k * k, m = cl(melt * 1.6 - o.w * 0.6);
        const r = o.r * Math.min(1, k * 4) * (1 - m * m);
        // у польоті витягнута крапля, на кузові — сплющена; тане — розпливається й сідає
        const st = 1 + 0.7 * (1 - k), spread = 1 + 0.5 * m;
        const x = o.sx + (o.tx - o.sx) * k, z = o.sz + (o.tz - o.sz) * k;
        const y = o.sy + (o.ty - o.sy) * e - m * (o.side ? 0.3 : 0.12);
        put(foam, i, x, y, z, r * o.ax * spread / st, r * o.ay * st * (1 - 0.6 * m), r * o.az * spread / st, o.q);
      }
      foam.instanceMatrix.needsUpdate = true;

      // щітки: з'їжджаються й крутяться (0.45–0.72)
      const bIn = ss(0.44, 0.5, s) * (1 - ss(0.66, 0.72, s));
      spinS = instant ? t * 10 * bIn : spinS + dt * 10 * bIn;
      sideBrushes.forEach(g => { g.position.z = g.userData.sg * (0.92 - 0.3 * bIn); g.userData.b.rotation.y = spinS * g.userData.sg; });
      topBrush.position.y = 1.3 + (car.position.y + top(-carX) + 0.21 - 1.3) * bIn;
      spinT = instant ? t * 8 * bIn : spinT + dt * 8 * bIn;
      tb.rotation.y = spinT;
      car.rotation.x = Math.sin(t * 23) * 0.01 * bIn;

      // вода з форсунок (0.56–0.77): падає і розбивається об кузов
      const wv = ss(0.55, 0.6, s) * (1 - ss(0.72, 0.77, s));
      for (let i = 0; i < NW; i++) {
        const d = dropD[i], fr = (t * d.sp + d.ph) % 1, lx = d.x - carX;
        const floor = Math.abs(lx) < 0.93 && Math.abs(d.z) < 0.42 ? car.position.y + top(lx) + 0.04 : 0.08;
        let y = 1.44 - fr * 1.5, sq = 3;
        if (y < floor) { y = floor; sq = 0.5; }
        const r = d.r * wv;
        put(drops, i, d.x, y, d.z, r * (sq < 1 ? 2 : 1), r * sq, r * (sq < 1 ? 2 : 1));
      }
      drops.instanceMatrix.needsUpdate = true;

      // краплі на кузові: з'являються з водою, здуваються сушкою
      const wet = ss(0.6, 0.7, s), dry = cl((s - 0.76) / 0.12);
      for (let i = 0; i < NB; i++) {
        const b = beadD[i], k = wet * (1 - cl(dry * 1.5 - b.th * 0.5)), r = b.r * k;
        put(beads, i, b.x - dry * b.th * 0.15, b.y, b.z, r, b.side ? r * 1.3 : r * 0.6, r);
      }
      beads.instanceMatrix.needsUpdate = true;

      // повітря сушки (0.74–0.9)
      const av = ss(0.73, 0.78, s) * (1 - ss(0.86, 0.91, s));
      for (let i = 0; i < NA; i++) {
        const a = airD[i], fr = (t * a.sp + a.ph) % 1;
        put(air, i, a.x - fr * 0.55, 1.42 - fr * 1.2, a.z, av, av * (1 - fr * 0.5), av, qAir);
      }
      air.instanceMatrix.needsUpdate = true;
      air.visible = av > 0.01;

      // фарба: матова в пилу → мокра → глянцева
      cur.lerp(want, instant ? 1 : 1 - Math.pow(0.02, dt));

      // на краях історії (p≈0 і p≈1) неактивні шари вимикаємо цілком — без вироджених інстансів у кадрі
      dirt.visible = wash < 0.999;
      foam.visible = fall > 0.001 && melt < 0.999;
      drops.visible = wv > 0.001;
      beads.visible = wet > 0.001 && dry < 0.999;
      const clean = ss(0.47, 0.74, s), gloss = Math.max(ss(0.58, 0.68, s) * 0.7, ss(0.8, 0.95, s));
      paint.color.copy(cur).lerp(dust, 0.45 * (1 - clean));
      // глянець — менша шорсткість і трохи металу (відблиски оточення)
      paint.roughness = 0.8 - 0.62 * gloss;
      paint.metalness = 0.1 + 0.35 * gloss;

      // кадр: майже збоку (легкий ракурс на передок), трохи згори + курсор
      root.rotation.y = -0.32 + s * 0.16 + mx * 0.25;
      root.rotation.x = 0.32 + my * 0.12;

      // відблиски — завжди обличчям до глядача
      const sp = ss(0.88, 0.97, s);
      root.updateMatrixWorld();
      qInv.copy(root.quaternion).invert();
      stars.forEach((st, i) => {
        const pulse = 0.75 + 0.25 * Math.sin(t * 3 + i * 2.1);
        st.quaternion.copy(qInv);
        st.scale.setScalar(Math.max(0.0001, sp * 0.13 * pulse * (i === 0 ? 1.3 : 1)));
        st.rotateZ(t * 0.6 + i);
        st.visible = sp > 0.01;
      });
    }
  }
}
