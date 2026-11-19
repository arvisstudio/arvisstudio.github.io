// Ізометрична квартира без стелі (кімната, кухня, санвузол). p (0..1):
// бетон і цегла → ростуть перегородки → біжать проводка й труби, зʼявляються підрозетники →
// шпаклівка й фарба, розетки → плитка в санвузлі → ламінат і плінтуси → тепле світло → меблі падають на місце.
export const meta = {
  id: 'izometrichna-3d-kvartira', name: 'Квартира, що будується',
  for: 'ремонт квартир, будівельна компанія, дизайн інтерʼєру, забудовник, меблі на замовлення',
  idea: 'Квартира без стелі, вигляд згори: з голого бетону й цегли, поки гортаєш, виростають перегородки, стінами біжить проводка, стіни шпаклюються, лягають плитка й ламінат, вмикається тепле світло й падають меблі.',
  colors: ['#b98a5e', '#6f4a35', '#cfc6b8'], color: '#b98a5e',
  bg: '#ebe7e1', scale: 0.85,
};

const clamp01 = x => (x < 0 ? 0 : x > 1 ? 1 : x);
const ss = (a, b, x) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const out3 = k => 1 - Math.pow(1 - k, 3);
function bounce(x) {
  const n = 7.5625, d = 2.75;
  if (x < 1 / d) return n * x * x;
  if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
  if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
  return n * (x -= 2.625 / d) * x + 0.984375;
}

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const root = new THREE.Group(), pivot = new THREE.Group(), house = new THREE.Group();
  root.add(pivot); pivot.add(house); house.position.y = -0.22;
  const geos = [], mats = [], texs = [];
  // userData.env — власна сила відблисків оточення (тканина майже без блиску)
  const M = o => { const m = new THREE.MeshStandardMaterial(o); m.userData.env = o.envMapIntensity ?? 1; mats.push(m); return m; };
  const G = g => { geos.push(g); return g; };
  const unit = G(new THREE.BoxGeometry(1, 1, 1));
  const unitUp = G(unit.clone().translate(0, 0.5, 0)); // росте знизу вгору
  const unitX = G(unit.clone().translate(0.5, 0, 0)); // росте вздовж лінії
  const seg = weak ? 10 : 18;
  const dummy = new THREE.Object3D();
  const hasDoc = typeof document !== 'undefined';

  // --- бетонна плита з легким «зерном»
  let concTex = null;
  if (hasDoc) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    g.fillStyle = '#9b9893'; g.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 1500; i++) {
      const v = (115 + Math.random() * 70) | 0;
      g.fillStyle = `rgba(${v},${v - 2},${v - 6},0.35)`;
      g.fillRect(Math.random() * 128, Math.random() * 128, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    concTex = new THREE.CanvasTexture(c);
    concTex.wrapS = concTex.wrapT = THREE.RepeatWrapping; concTex.repeat.set(3, 2);
    concTex.colorSpace = THREE.SRGBColorSpace; texs.push(concTex);
  }
  // темніший тон поверх текстури — сирий бетон, а не гіпс
  const concrete = M({ color: concTex ? '#8f8b85' : '#77746f', map: concTex, roughness: 1, envMapIntensity: 0.6 });
  const slab = new THREE.Mesh(unit, concrete); slab.scale.set(3.86, 0.12, 2.86); slab.position.y = -0.06; house.add(slab);

  // --- інстанси з анімацією появи: t0 — коли почати, d — тривалість, dx/dy/dz — звідки прилітає
  function inst(geo, mat, items, colorFn) {
    const m = new THREE.InstancedMesh(geo, mat, items.length);
    m.frustumCulled = false;
    if (colorFn) { const c = new THREE.Color(); items.forEach((it, i) => { colorFn(c, it, i); m.setColorAt(i, c); }); }
    house.add(m);
    return { m, items, last: -9 };
  }
  function play(I, s) {
    if (Math.abs(s - I.last) < 1e-5) return; I.last = s;
    I.items.forEach((it, i) => {
      let k = it.t0 < 0 ? 1 : clamp01((s - it.t0) / it.d);
      if (it.out) k = 1 - k;
      const e = out3(k), q = 1 - e, sc = k <= 0 ? 1e-4 : 0.35 + 0.65 * e;
      dummy.position.set(it.x + (it.dx || 0) * q, it.y + (it.dy || 0) * q, it.z + (it.dz || 0) * q);
      dummy.scale.set(it.sx * sc, it.sy * sc, it.sz * sc);
      dummy.updateMatrix(); I.m.setMatrixAt(i, dummy.matrix);
    });
    I.m.instanceMatrix.needsUpdate = true;
  }

  // --- стіни: зовнішні стоять з початку, перегородки (inner) ростуть ряд за рядом
  const H = 0.5, ROWS = 7, BH = H / ROWS, BL = 0.2, T = 0.1;
  const PH = 0.055; // половина товщини стіни зі шпаклівкою — тонка, лише трохи ширша за цеглу
  const walls = [
    { a: [-1.85, -1.3], b: [1.85, -1.3], rows: ROWS },
    { a: [1.8, -1.25], b: [1.8, 1.25], rows: ROWS },
    { a: [-1.85, 1.3], b: [0.4, 1.3], rows: 3 },   // ближні стіни низькі — як у ляльковому будиночку
    { a: [0.8, 1.3], b: [1.85, 1.3], rows: 3 },
    { a: [-1.8, -1.25], b: [-1.8, 1.25], rows: 3 },
    { a: [0.3, -1.25], b: [0.3, -0.2], rows: ROWS, inner: 0 },
    { a: [0.3, 0.35], b: [0.3, 1.25], rows: ROWS, inner: 1 },
    { a: [0.85, 0.3], b: [1.75, 0.3], rows: ROWS, inner: 2 },
    { a: [0.9, 0.75], b: [0.9, 1.25], rows: 3, inner: 3 },   // ближня до камери — низька, щоб санвузол було видно
  ];
  const bricks = [];
  walls.forEach(w => {
    w.alongX = w.a[1] === w.b[1];
    w.L = w.alongX ? w.b[0] - w.a[0] : w.b[1] - w.a[1];
    w.cx = (w.a[0] + w.b[0]) / 2; w.cz = (w.a[1] + w.b[1]) / 2;
    for (let r = 0; r < w.rows; r++) {
      const off = (r % 2) * BL / 2;
      for (let s = -off; s < w.L - 0.001; s += BL) {
        const s0 = Math.max(0, s), s1 = Math.min(w.L, s + BL);
        if (s1 - s0 < 0.04) continue;
        const c = (s0 + s1) / 2, len = s1 - s0 - 0.014;
        const it = {
          x: w.alongX ? w.a[0] + c : w.a[0], y: r * BH + BH / 2, z: w.alongX ? w.a[1] : w.a[1] + c,
          sx: w.alongX ? len : T - 0.006, sy: BH - 0.012, sz: w.alongX ? T - 0.006 : len, t0: -1, d: 1,
        };
        if (w.inner !== undefined) { it.t0 = 0.03 + w.inner * 0.065 + (r / w.rows) * 0.055 + (c / w.L) * 0.008; it.d = 0.025; it.dy = 0.35; }
        bricks.push(it);
      }
    }
  });
  // піддон із цеглою посеред кімнати — тане, поки ростуть перегородки
  const PX = -0.75, PZ = 0.35;
  for (let l = 3; l >= 0; l--) for (let i = 0; i < 2; i++) for (let j = 0; j < 3; j++) {
    const order = (3 - l) * 6 + i * 3 + j;
    bricks.push({ x: PX - 0.1 + i * 0.2, y: 0.05 + l * BH + BH / 2, z: PZ - 0.1 + j * 0.1, sx: 0.19, sy: BH - 0.012, sz: 0.094, t0: 0.03 + order / 24 * 0.25, d: 0.02, dy: 0.3, out: true });
  }
  const brickMat = M({ color: 0xffffff, roughness: 0.88 });
  const Bricks = inst(unit, brickMat, bricks, c => c.setHSL(0.025 + Math.random() * 0.02, 0.42 + Math.random() * 0.12, 0.34 + Math.random() * 0.1, THREE.SRGBColorSpace));
  const woodRaw = M({ color: '#b39468', roughness: 0.9 });
  const pallet = new THREE.Mesh(unitUp, woodRaw); pallet.position.set(PX, 0, PZ); house.add(pallet);

  // --- шпаклівка: тонка оболонка поверх цегли піднімається від підлоги, потім фарбується в колір стилю
  const putty = new THREE.Color('#e9e6df'), cream = new THREE.Color('#f4efe7');
  const plasterMat = M({ color: putty.clone(), roughness: 0.92 });
  const capMat = M({ color: '#4a413b', roughness: 0.8 }); // темний зріз стіни згори — як на архітектурному кресленні
  const plaster = walls.map((w, i) => {
    const m = new THREE.Mesh(unitUp, plasterMat), len = w.L + 0.03, th = PH * 2;
    m.position.set(w.cx, 0, w.cz); m.visible = false;
    m.userData = { sx: w.alongX ? len : th, sz: w.alongX ? th : len, h: w.rows * BH + 0.008 };
    const cap = new THREE.Mesh(unit, capMat);
    cap.scale.set(m.userData.sx + 0.004, 0.01, m.userData.sz + 0.004); cap.position.set(w.cx, 0, w.cz); cap.visible = false;
    m.userData.cap = cap;
    house.add(m, cap); return m;
  });
  // один спільний рівень шпаклівки для всіх стін: піднімається разом, низькі стіни просто закінчуються раніше
  const PT0 = 0.45, PT1 = 0.6, PMAX = H + 0.008;
  const plasterLevel = (i, s) => Math.min(plaster[i].userData.h, PMAX * clamp01((s - PT0 - i * 0.002) / (PT1 - PT0)));

  // --- проводка й труби: товсті контрастні лінії по цеглі, ховаються під шпаклівку, коли та їх наздоганяє
  const elecMat = M({ color: '#fff4cf', emissive: '#ffe08a', emissiveIntensity: 0.5, roughness: 0.4 });
  const coldMat = M({ color: '#3f8bd4', emissive: '#2a6fb5', emissiveIntensity: 0.25, roughness: 0.3, metalness: 0.1 });
  const hotMat = M({ color: '#f4a23c', emissive: '#e88a22', emissiveIntensity: 0.25, roughness: 0.3, metalness: 0.1 });
  const OFF = 0.068; // від осі стіни: лежить на цеглі
  const BZ = -1.3 + OFF, RX = 1.8 - OFF, AX = 0.3 - OFF;
  const EW = 0.038, PW = 0.044;
  const paths = [
    { w: EW, mat: elecMat, t: [0.15, 0.28], pts: [[-1.7, 0.42, BZ], [RX, 0.42, BZ], [RX, 0.42, 0.2]], end: 'j' },
    { w: EW, mat: elecMat, t: [0.215, 0.27], pts: [[-1.4, 0.42, BZ], [-1.4, 0.12, BZ]], end: 's' },
    { w: EW, mat: elecMat, t: [0.24, 0.325], pts: [[AX, 0.42, -1.2], [AX, 0.42, -0.6], [AX, 0.26, -0.6]], end: 'k' },
    { w: EW, mat: elecMat, t: [0.27, 0.315], pts: [[0.7, 0.42, BZ], [0.7, 0.3, BZ]], end: 's' },
    { w: EW, mat: elecMat, t: [0.295, 0.35], pts: [[RX, 0.42, -0.3], [RX, 0.24, -0.3]], end: 's' },
    { w: PW, mat: coldMat, t: [0.305, 0.435], pts: [[0.45, 0.08, BZ], [RX, 0.08, BZ], [RX, 0.08, 1.15]] },
    { w: PW, mat: hotMat, t: [0.325, 0.46], pts: [[0.45, 0.15, BZ], [RX, 0.15, BZ], [RX, 0.15, 1.15]] },
    { w: PW, mat: coldMat, t: [0.425, 0.47], pts: [[1.1, 0.08, BZ], [1.1, 0.27, BZ]] },
    { w: PW, mat: hotMat, t: [0.445, 0.49], pts: [[RX, 0.15, 0.55], [RX, 0.3, 0.55]] },
  ];
  // до якої стіни належить точка і куди дивиться її лице
  const wallAt = v => Math.abs(v[2] - BZ) < 1e-3 ? { wi: 0, n: [0, 0, 1], base: [v[0], v[1], -1.3] }
    : Math.abs(v[0] - RX) < 1e-3 ? { wi: 1, n: [-1, 0, 0], base: [1.8, v[1], v[2]] }
    : { wi: 5, n: [-1, 0, 0], base: [0.3, v[1], v[2]] };
  const X1 = new THREE.Vector3(1, 0, 0), Y1 = new THREE.Vector3(0, 1, 0), Z1 = new THREE.Vector3(0, 0, 1);
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vN = new THREE.Vector3();
  const lines = paths.map(P => {
    let cum = 0; const segs = [];
    for (let i = 0; i < P.pts.length - 1; i++) {
      vA.fromArray(P.pts[i]); vB.fromArray(P.pts[i + 1]);
      const len = vA.distanceTo(vB), dir = vB.clone().sub(vA).normalize();
      const m = new THREE.Mesh(unitX, P.mat);
      m.quaternion.setFromUnitVectors(X1, dir);
      m.position.copy(vA).addScaledVector(dir, -P.w / 2);
      m.visible = false; house.add(m);
      segs.push({ m, len, cum, wi: wallAt(P.pts[i + 1]).wi, top: Math.max(vA.y, vB.y) + P.w / 2 }); cum += len;
    }
    return { P, segs, total: cum };
  });

  // підрозетники (на цеглі) і розетки/вимикач (на шпаклівці) на кінцях ліній проводки
  const boxMat = M({ color: '#e7782c', roughness: 0.55 });
  const plateMat = M({ color: '#fbfaf6', roughness: 0.35 });
  const holeMat = M({ color: '#3a3532', roughness: 0.6 });
  const cupGeo = G(new THREE.CylinderGeometry(0.042, 0.042, 0.03, seg));
  const sockets = [];
  lines.forEach(L => {
    if (!L.P.end) return;
    const e = L.P.pts[L.P.pts.length - 1], W = wallAt(e);
    vN.fromArray(W.n); const q = new THREE.Quaternion().setFromUnitVectors(Y1, vN);
    const box = new THREE.Mesh(L.P.end === 'j' ? unit : cupGeo, boxMat);
    box.quaternion.copy(q);
    box.position.fromArray(W.base).addScaledVector(vN, 0.05 + 0.012);
    if (L.P.end === 'j') box.scale.set(0.1, 0.03, 0.1);
    box.userData.s = box.scale.clone(); box.visible = false; house.add(box);
    let plate = null;
    if (L.P.end !== 'j') {
      plate = new THREE.Group();
      plate.quaternion.setFromUnitVectors(Z1, vN);
      plate.position.fromArray(W.base).addScaledVector(vN, PH + 0.007);
      const pl = new THREE.Mesh(unit, plateMat); pl.scale.set(0.085, 0.085, 0.014); plate.add(pl);
      const inner = new THREE.Mesh(unit, L.P.end === 'k' ? plateMat : holeMat);
      if (L.P.end === 'k') { inner.scale.set(0.03, 0.05, 0.008); inner.position.z = 0.009; }
      else { inner.scale.set(0.04, 0.04, 0.004); inner.position.z = 0.0075; }
      plate.add(inner); plate.visible = false; house.add(plate);
    }
    sockets.push({ L, box, plate, wi: W.wi, y: e[1] });
  });

  // --- плитка в санвузлі: мʼятна, з помітними швами; підлога — шахівниця, зверху темніший бордюр
  const tiles = [], mint = new THREE.Color('#79b9a2'), mintDark = new THREE.Color('#4f8f79'), tileWhite = new THREE.Color('#eef0ea');
  for (let i = 0; i < 9; i++) for (let j = 0; j < 10; j++)
    tiles.push({ x: 0.9 + (i + 0.5) * 0.1, y: 0.011, z: 0.3 + (j + 0.5) * 0.1, sx: 0.089, sy: 0.022, sz: 0.089, t0: 0.62 + (i + j) / 17 * 0.06, d: 0.025, dy: 0.18, kind: (i + j) % 2 ? 'w' : 'm' });
  const TX = 1.8 - PH - 0.007, TZ = 0.3 + PH + 0.007; // плитка лежить на шпаклівці
  const wz = (1.3 - PH - TZ) / 9, wx = (TX - 0.9 - PH) / 8, TR = 4;
  for (let r = 0; r < TR; r++) {
    const kind = r === TR - 1 ? 'd' : 'm';
    for (let j = 0; j < 9; j++) tiles.push({ x: TX, y: 0.022 + (r + 0.5) * 0.1, z: TZ + 0.006 + (j + 0.5) * wz, sx: 0.012, sy: 0.09, sz: wz - 0.01, t0: 0.67 + (r * 9 + j) / 36 * 0.06, d: 0.02, dx: -0.2, kind });
    for (let i = 0; i < 8; i++) tiles.push({ x: 0.9 + PH + (i + 0.5) * wx, y: 0.022 + (r + 0.5) * 0.1, z: TZ, sx: wx - 0.01, sy: 0.09, sz: 0.012, t0: 0.68 + (r * 8 + i) / 32 * 0.06, d: 0.02, dz: 0.2, kind });
  }
  const tileMat = M({ color: '#ffffff', roughness: 0.22 });
  const Tiles = inst(unit, tileMat, tiles, (c, it) => c.copy(it.kind === 'w' ? tileWhite : it.kind === 'd' ? mintDark : mint).multiplyScalar(0.95 + Math.random() * 0.07));

  // --- ламінат: ряди від дальньої стіни, кожна дошка заїжджає збоку й лягає
  const planks = [], RW = 0.13, NR = 20, PL = 0.5;
  for (let j = 0; j < NR; j++) {
    const z = -1.3 + (j + 0.5) * RW, xmax = z > 0.3 ? 0.9 : 1.8, off = ((j * 0.37) % 1) * PL, row = [];
    for (let s = -1.8 - off; s < xmax - 0.001; s += PL) {
      const a = Math.max(-1.8, s), b = Math.min(xmax, s + PL);
      if (b - a >= 0.05) row.push([a, b]);
    }
    row.forEach(([a, b], k) => planks.push({ x: (a + b) / 2, y: 0.01, z, sx: b - a - 0.005, sy: 0.02, sz: RW - 0.005, t0: 0.64 + j / NR * 0.14 + k / row.length * 0.014, d: 0.022, dx: -0.35, dy: 0.12 }));
  }
  const floorCol = new THREE.Color(color), wantFloor = new THREE.Color(color);
  const wallCol = new THREE.Color(), wantWall = new THREE.Color();
  const mixWall = (src, dst) => dst.copy(src).lerp(cream, 0.75);
  mixWall(floorCol, wallCol); mixWall(wantFloor, wantWall);
  const lamMat = M({ color: floorCol.clone(), roughness: 0.55 });
  const Planks = inst(unit, lamMat, planks, c => c.setScalar(0.92 + Math.random() * 0.13)); // вузький розкид — підлога спокійна

  // --- плінтуси й лутки дверних прорізів
  const trimMat = M({ color: '#6e4f3a', roughness: 0.6 });
  const trims = [];
  const plinth = (wi, side, from, to, t0) => {
    const w = walls[wi], c = (from + to) / 2, len = to - from, o = side * (PH + 0.006);
    trims.push(w.alongX
      ? { x: c, y: 0.0425, z: w.a[1] + o, sx: len, sy: 0.045, sz: 0.012, t0, d: 0.025, dy: 0.12 }
      : { x: w.a[0] + o, y: 0.0425, z: c, sx: 0.012, sy: 0.045, sz: len, t0, d: 0.025, dy: 0.12 });
  };
  [
    [0, 1, -1.8 + PH, 0.3 - PH], [0, 1, 0.3 + PH, 1.8 - PH], [1, -1, -1.3 + PH, 0.3 - PH],
    [2, -1, -1.8 + PH, 0.3 - PH], [4, 1, -1.3 + PH, 1.3 - PH],
    [5, -1, -1.3 + PH, -0.2], [5, 1, -1.3 + PH, -0.2], [6, -1, 0.35, 1.3 - PH], [6, 1, 0.35, 1.3 - PH],
    [7, -1, 0.85, 1.8 - PH], [8, -1, 0.75, 1.3 - PH],
  ].forEach(([wi, sd, a, b], i) => plinth(wi, sd, a, b, 0.76 + i * 0.004));
  // лутки: [стіна, точка кінця, напрямок назовні по осі]
  [[5, [0.3, -0.2], 1], [6, [0.3, 0.35], -1], [7, [0.85, 0.3], -1], [8, [0.9, 0.75], -1], [2, [0.4, 1.3], 1], [3, [0.8, 1.3], -1]].forEach(([wi, e, out], i) => {
    const w = walls[wi], h = w.rows * BH + 0.012, across = PH * 2 + 0.024;
    trims.push({
      x: e[0] + (w.alongX ? out * 0.008 : 0), y: h / 2, z: e[1] + (w.alongX ? 0 : out * 0.008),
      sx: w.alongX ? 0.03 : across, sy: h, sz: w.alongX ? across : 0.03, t0: 0.6 + i * 0.006, d: 0.03, dy: 0.15,
    });
  });
  const Trims = inst(unit, trimMat, trims);

  // --- меблі й світильники: прості форми, падають згори з відскоком
  // тканина — тепла, темна, матова, без відблисків
  const fab = M({ color: '#6a4535', roughness: 1, envMapIntensity: 0.2 }), fab2 = M({ color: '#87604a', roughness: 1, envMapIntensity: 0.2 });
  const wood = M({ color: '#a8794f', roughness: 0.6 }), white = M({ color: '#f2f0eb', roughness: 0.35 });
  const dark = M({ color: '#34312d', roughness: 0.5, metalness: 0.2 }), soft = M({ color: '#dccfba', roughness: 1 });
  const leaf = M({ color: '#5b7f4f', roughness: 0.8 }), clay = M({ color: '#b5694a', roughness: 0.85 });
  const water = M({ color: '#a9d2dc', roughness: 0.08, metalness: 0.1 }), steel = M({ color: '#c9ccd0', roughness: 0.25, metalness: 0.8 });
  const fridgeMat = M({ color: '#dfe1e2', roughness: 0.3, metalness: 0.3 });
  const glowMat = () => M({ color: '#f6e9d2', emissive: '#ffad55', emissiveIntensity: 0, roughness: 0.6 });
  const glowRoom = glowMat(), glowKitchen = glowMat(), glowBath = glowMat();

  const B = (g, mat, w, h, d, x, y, z) => { const m = new THREE.Mesh(unit, mat); m.scale.set(w, h, d); m.position.set(x, y + h / 2, z); g.add(m); return m; };
  const Cy = (g, mat, rt, rb, h, x, y, z, open = false) => { const m = new THREE.Mesh(G(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open)), mat); m.position.set(x, y + h / 2, z); g.add(m); return m; };
  const items = [];
  // sc — масштаб предмета, ry — кінцевий поворот
  const piece = (x, z, t0, build, sc = 1, ry = 0) => { const g = new THREE.Group(); g.position.set(x, 0.02, z); g.scale.setScalar(sc); build(g); g.visible = false; house.add(g); items.push({ g, t0, d: 0.04, ry }); };

  // торшер (зʼявляється перед увімкненням світла)
  piece(-1.55, -1.1, 0.8, g => {
    Cy(g, dark, 0.05, 0.05, 0.012, 0, 0, 0); Cy(g, dark, 0.008, 0.008, 0.4, 0, 0, 0);
    Cy(g, glowRoom, 0.05, 0.08, 0.09, 0, 0.38, 0, true);
    const bulb = new THREE.Mesh(G(new THREE.SphereGeometry(0.025, 12, 8)), glowRoom); bulb.position.y = 0.41; g.add(bulb);
  });
  const fur = [
    [-0.85, -0.35, g => B(g, soft, 1.05, 0.008, 0.7, 0, 0, 0)],
    // диван: висока мʼяка спинка, товсті подушки сидіння й спини
    [-0.85, -1.05, g => {
      B(g, dark, 1.0, 0.035, 0.36, 0, 0, 0); B(g, fab, 1.0, 0.09, 0.36, 0, 0.035, 0);
      B(g, fab, 1.0, 0.25, 0.1, 0, 0.035, -0.13);
      B(g, fab, 0.08, 0.17, 0.36, -0.46, 0.035, 0); B(g, fab, 0.08, 0.17, 0.36, 0.46, 0.035, 0);
      B(g, fab2, 0.41, 0.055, 0.25, -0.21, 0.125, 0.03); B(g, fab2, 0.41, 0.055, 0.25, 0.21, 0.125, 0.03);
      B(g, fab2, 0.41, 0.14, 0.065, -0.21, 0.125, -0.06); B(g, fab2, 0.41, 0.14, 0.065, 0.21, 0.125, -0.06);
      B(g, clay, 0.12, 0.1, 0.04, -0.33, 0.18, -0.01);
    }],
    [-0.85, -0.45, g => {
      B(g, wood, 0.5, 0.03, 0.28, 0, 0.12, 0); B(g, dark, 0.44, 0.012, 0.22, 0, 0.05, 0);
      for (const a of [-1, 1]) for (const b of [-1, 1]) B(g, dark, 0.024, 0.12, 0.024, a * 0.22, 0, b * 0.11);
      Cy(g, clay, 0.03, 0.025, 0.06, 0.12, 0.15, 0.02); B(g, soft, 0.12, 0.02, 0.09, -0.1, 0.15, 0);
    }],
    [-1.22, 0.78, g => {
      B(g, wood, 0.9, 0.07, 0.62, 0, 0, 0); B(g, white, 0.86, 0.07, 0.58, 0, 0.07, 0);
      B(g, fab, 0.5, 0.025, 0.6, 0.19, 0.14, 0);
      B(g, white, 0.12, 0.04, 0.22, -0.33, 0.14, -0.14); B(g, white, 0.12, 0.04, 0.22, -0.33, 0.14, 0.14);
      B(g, wood, 0.04, 0.24, 0.62, -0.45, 0, 0);
    }, 1.12],
    [0.08, -1.08, g => {
      Cy(g, clay, 0.06, 0.045, 0.1, 0, 0, 0);
      const f = new THREE.Mesh(G(new THREE.IcosahedronGeometry(0.1, 1)), leaf); f.position.y = 0.19; f.scale.set(1, 1.2, 1); g.add(f);
      const f2 = f.clone(); f2.scale.setScalar(0.6); f2.position.set(0.05, 0.3, 0.02); g.add(f2);
    }, 1.3],
    // кухня: білі фасади, світла дерев'яна стільниця, мийка й варильна поверхня
    [1.06, -1.08, g => {
      B(g, white, 1.3, 0.25, 0.3, 0, 0, 0); B(g, dark, 1.3, 0.02, 0.29, 0, 0, 0.004); B(g, wood, 1.34, 0.03, 0.32, 0, 0.25, 0);
      B(g, steel, 0.22, 0.006, 0.17, 0.27, 0.28, 0); B(g, dark, 0.26, 0.005, 0.19, -0.28, 0.28, 0);
      Cy(g, steel, 0.008, 0.008, 0.07, 0.27, 0.28, -0.11);
      for (const x of [-0.49, -0.16, 0.17, 0.5]) B(g, dark, 0.1, 0.012, 0.012, x, 0.2, 0.152);
      Cy(g, leaf, 0.025, 0.02, 0.05, -0.55, 0.28, -0.05); Cy(g, white, 0.035, 0.03, 0.05, -0.05, 0.28, -0.06);
    }],
    [1.6, -0.75, g => { B(g, fridgeMat, 0.22, 0.48, 0.22, 0, 0, 0); B(g, dark, 0.01, 0.12, 0.012, -0.113, 0.26, 0.07); B(g, dark, 0.226, 0.004, 0.226, 0, 0.3, 0); }, 1.15],
    [0.85, -0.38, g => {
      Cy(g, dark, 0.07, 0.08, 0.01, 0, 0, 0); Cy(g, dark, 0.015, 0.015, 0.2, 0, 0, 0); Cy(g, wood, 0.17, 0.17, 0.02, 0, 0.2, 0);
      for (const sx of [-1, 1]) { B(g, dark, 0.02, 0.12, 0.02, sx * 0.28, 0, 0); B(g, wood, 0.12, 0.012, 0.12, sx * 0.28, 0.12, 0); B(g, wood, 0.012, 0.13, 0.12, sx * 0.34, 0.12, 0); }
    }, 1.15],
    [1.33, 1.09, g => {
      B(g, white, 0.68, 0.03, 0.22, 0, 0, 0);
      for (const sz of [-1, 1]) B(g, white, 0.68, 0.15, 0.025, 0, 0, sz * 0.0975);
      for (const sx of [-1, 1]) B(g, white, 0.025, 0.15, 0.17, sx * 0.3275, 0, 0);
      B(g, water, 0.63, 0.005, 0.17, 0, 0.1, 0);
    }],
    [1.6, 0.52, g => { B(g, wood, 0.2, 0.17, 0.26, 0, 0, 0); B(g, white, 0.21, 0.03, 0.27, 0, 0.17, 0); B(g, steel, 0.12, 0.004, 0.16, -0.01, 0.2, 0); }],
    [1.61, 0.84, g => { Cy(g, white, 0.055, 0.042, 0.1, -0.03, 0, 0); B(g, white, 0.06, 0.15, 0.14, 0.05, 0.03, 0); }],
    [0.6, 1.12, g => B(g, dark, 0.3, 0.008, 0.18, 0, 0, 0)],
    // крісло біля столика, спинкою до перегородки
    [-0.12, -0.5, g => {
      for (const a of [-1, 1]) for (const b of [-1, 1]) B(g, dark, 0.018, 0.05, 0.018, a * 0.13, 0, b * 0.13);
      B(g, fab2, 0.32, 0.08, 0.32, 0, 0.05, 0); B(g, fab2, 0.32, 0.22, 0.07, 0, 0.05, -0.125);
      B(g, fab2, 0.05, 0.13, 0.32, -0.135, 0.05, 0); B(g, fab2, 0.05, 0.13, 0.32, 0.135, 0.05, 0);
      B(g, soft, 0.22, 0.04, 0.2, 0, 0.13, 0.03);
    }, 1, -Math.PI / 2],
    // стелаж із книжками біля лівої стіни
    [-1.66, -0.4, g => {
      B(g, wood, 0.12, 0.5, 0.02, 0, 0, -0.22); B(g, wood, 0.12, 0.5, 0.02, 0, 0, 0.22);
      for (const y of [0, 0.16, 0.32, 0.48]) B(g, wood, 0.12, 0.02, 0.46, 0, y, 0);
      const bk = [clay, dark, soft, leaf, white, fab];
      [[0.02, -0.16, 0.11], [0.02, -0.11, 0.13], [0.02, -0.06, 0.1], [0.02, 0.1, 0.12], [0.18, -0.15, 0.1], [0.18, 0.02, 0.12],
        [0.18, 0.07, 0.11], [0.18, 0.12, 0.13], [0.34, -0.12, 0.12], [0.34, 0.14, 0.1]].forEach(([y, z, h], i) =>
        B(g, bk[i % bk.length], 0.09, h, 0.04, 0, y, z));
      Cy(g, clay, 0.035, 0.03, 0.07, 0, 0.34, 0.03);
    }],
  ];
  fur.forEach(([x, z, b, sc, ry], i) => piece(x, z, 0.85 + i * 0.008, b, sc, ry));

  // --- контактні тіні: темні мʼякі плями під меблями (без shadowMap)
  const blobs = [];
  if (hasDoc) {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 4, 32, 32, 32);
    // щільне ядро й короткий край — тінь лежить саме під предметом
    gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.6, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c); texs.push(tex);
    const shMat = new THREE.MeshBasicMaterial({ color: '#1e130c', map: tex, transparent: true, opacity: 0.95, depthWrite: false });
    mats.push(shMat);
    const plane = G(new THREE.PlaneGeometry(1, 1));
    // [номер у items, ширина, глибина] — трохи більше за слід предмета
    [[0, 0.17, 0.17], [2, 1.08, 0.42], [3, 0.52, 0.32], [4, 1.06, 0.74], [5, 0.2, 0.2], [6, 1.42, 0.36],
      [7, 0.3, 0.3], [8, 0.94, 0.44], [9, 0.74, 0.28], [10, 0.25, 0.3], [11, 0.18, 0.2], [13, 0.36, 0.36], [14, 0.16, 0.5]].forEach(([ii, w, d]) => {
      const m = new THREE.Mesh(plane, shMat);
      m.rotation.x = -Math.PI / 2; m.position.set(items[ii].g.position.x, 0.031, items[ii].g.position.z);
      m.visible = false; m.renderOrder = 1; house.add(m);
      blobs.push({ m, it: items[ii], w, d });
    });
  }

  // кухонна LED-смуга на стіні й кругле дзеркало з яскравим ореолом у санвузлі
  const fixtures = new THREE.Group(); house.add(fixtures);
  const strip = new THREE.Mesh(unit, glowKitchen); strip.scale.set(1.1, 0.016, 0.022); strip.position.set(1.1, 0.42, -1.3 + PH + 0.012); fixtures.add(strip);
  const halo = new THREE.Mesh(G(new THREE.CircleGeometry(0.13, 32)), glowBath);
  halo.position.set(1.8 - PH - 0.014, 0.33, 0.62); halo.rotation.y = -Math.PI / 2; fixtures.add(halo);
  const mirror = new THREE.Mesh(G(new THREE.CircleGeometry(0.1, 32)), M({ color: '#dfe7ea', roughness: 0.05, metalness: 1 }));
  mirror.position.set(1.8 - PH - 0.017, 0.33, 0.62); mirror.rotation.y = -Math.PI / 2; fixtures.add(mirror);
  const ring = new THREE.Mesh(G(new THREE.TorusGeometry(0.105, 0.012, 8, 40)), glowBath);
  ring.position.set(1.8 - PH - 0.019, 0.33, 0.62); ring.rotation.y = Math.PI / 2; fixtures.add(ring);
  // картина над диваном на дальній стіні
  const pic = new THREE.Group(); pic.position.set(-0.85, 0.385, -1.3 + PH + 0.008); fixtures.add(pic);
  const pm = (mat, w, h, x, y, z) => { const m = new THREE.Mesh(unit, mat); m.scale.set(w, h, 0.01); m.position.set(x, y, z); pic.add(m); };
  pm(dark, 0.46, 0.17, 0, 0, 0); pm(soft, 0.42, 0.13, 0, 0, 0.004);
  pm(clay, 0.12, 0.08, -0.09, -0.01, 0.008); pm(leaf, 0.07, 0.1, 0.05, 0.005, 0.008); pm(wood, 0.05, 0.05, 0.14, -0.025, 0.008);
  const fixList = [strip, halo, mirror, ring, pic]; fixList.forEach(m => { m.userData.s = m.scale.clone(); m.visible = false; });

  // тепле світло: кімната, кухня, санвузол (кількість ламп стала — шейдери не перебудовуються)
  const warm = new THREE.Color('#ffb56b');
  const lamps = [
    { pos: [-1.52, 0.36, -1.0], win: [0.84, 0.89], mat: glowRoom, k: 3.6 },
    { pos: [1.1, 0.34, -1.05], win: [0.82, 0.87], mat: glowKitchen, k: 3.2 },
    { pos: [1.55, 0.34, 0.66], win: [0.86, 0.91], mat: glowBath, k: 3.4 },
  ].map(L => { const l = new THREE.PointLight(warm, 0, 3.4, 2); l.position.fromArray(L.pos); house.add(l); return { ...L, l }; });
  const fill = new THREE.HemisphereLight('#ffd9b0', '#7a6a5a', 0); house.add(fill);

  // загальне світло сцени трохи притушується, коли вмикаються лампи (і повертається в dispose)
  let ext = null;
  function grabSceneLights() {
    let r = root; while (r.parent) r = r.parent;
    if (!r.isScene) return;
    ext = [];
    r.traverse(o => { if (o.isLight && !o.isPointLight && o !== fill) ext.push({ o, base: o.intensity }); });
  }

  let shown = 0, rx = 0, ry = 0, lastDim = -1;
  const api = {
    object: root,
    update({ t = 0, dt = 0, p = 0, mx = 0, my = 0, instant = false, reduce = false } = {}) {
      const pp = clamp01(p);
      shown = (instant || reduce || !dt) ? pp : shown + (pp - shown) * Math.min(1, dt * 3);
      // перші секунди без гортання: перша перегородка сама виростає (на скриншотах — рівно p)
      const intro = (instant || reduce) ? 0 : 0.11 * ss(0.3, 2.0, t);
      const s = Math.max(shown, intro);

      // нахил пальцем + повільний поворот квартири з прокруткою
      const a = instant ? 1 : Math.min(1, dt * 4);
      rx += (mx - rx) * a; ry += (my - ry) * a;
      pivot.rotation.y = Math.PI / 4 - 0.28 + s * 0.42 + rx * 1.1 + (reduce ? 0 : Math.sin(t * 0.25) * 0.04);
      pivot.rotation.x = 0.6 + ry * 0.35;

      play(Bricks, s);
      const pk = 1 - ss(0.28, 0.32, s);
      pallet.visible = pk > 0.001; pallet.scale.set(0.44, 0.05 * pk + 1e-4, 0.34);

      // шпаклівка росте від підлоги; темний зріз їде разом з верхом стіни
      plaster.forEach((m, i) => {
        const u = m.userData, h = plasterLevel(i, s);
        m.visible = h > 0; m.scale.set(u.sx, h + 1e-4, u.sz);
        u.cap.visible = h > 0; u.cap.position.y = h - 0.003;
      });

      // проводка легко пульсує, поки її прокладають; відрізок ще трохи видно поверх свіжої шпаклівки, потім ховається
      elecMat.emissiveIntensity = 0.5 + ((instant || reduce) ? 0 : 0.3 * Math.max(0, Math.sin(t * 4)) * (1 - ss(0.45, 0.55, s)));
      lines.forEach(L => {
        const g = clamp01((s - L.P.t[0]) / (L.P.t[1] - L.P.t[0])) * L.total;
        L.g = g;
        L.segs.forEach(sg => {
          const k = clamp01((g - sg.cum) / sg.len);
          sg.m.visible = k > 0 && plasterLevel(sg.wi, s - 0.05) < sg.top;
          sg.m.scale.set((sg.len + L.P.w) * k + 1e-4, L.P.w, L.P.w);
        });
      });
      sockets.forEach(S => {
        const lv = plasterLevel(S.wi, s);
        const kb = ss(0.88, 1, S.L.g / S.L.total);
        S.box.visible = kb > 0 && lv < S.y + 0.045;
        S.box.scale.copy(S.box.userData.s).multiplyScalar(kb + 1e-4);
        if (S.plate) {
          const kp = out3(clamp01((lv - S.y - 0.045) / 0.04));
          S.plate.visible = kp > 0; S.plate.scale.setScalar(kp + 1e-4);
        }
      });

      // колір стилю: плавно, а на скриншоті — одразу
      const ca = instant ? 1 : 1 - Math.pow(0.02, dt);
      floorCol.lerp(wantFloor, ca); wallCol.lerp(wantWall, ca);
      plasterMat.color.copy(putty).lerp(wallCol, ss(0.6, 0.68, s));
      lamMat.color.copy(floorCol);

      play(Tiles, s);
      play(Planks, s);
      play(Trims, s);

      const fk = ss(0.8, 0.84, s);
      fixList.forEach(m => {
        m.visible = fk > 0;
        if (m === strip) m.scale.set(m.userData.s.x * fk + 1e-4, m.userData.s.y, m.userData.s.z);
        else m.scale.copy(m.userData.s).multiplyScalar(fk + 1e-4);
      });
      let allOn = 0;
      lamps.forEach(L => {
        const k = clamp01((s - L.win[0]) / (L.win[1] - L.win[0]));
        const flick = k > 0 && k < 0.35 ? (Math.sin(k * 90) > 0 ? 1 : 0.25) : 1; // кліпає, як справжня лампа
        const v = ss(0, 1, k) * flick;
        L.l.intensity = v * L.k; L.mat.emissiveIntensity = v * (L.mat === glowBath ? 2.2 : 1.6); allOn += v / 3;
      });
      fill.intensity = allOn * 0.22;

      // «вечір»: денне світло й відблиски оточення сідають, щоб теплі плями від ламп читалися
      if (!ext) grabSceneLights();
      const dim = 1 - 0.42 * allOn;
      if (Math.abs(dim - lastDim) > 1e-4) {
        lastDim = dim;
        if (ext) ext.forEach(E => { E.o.intensity = E.base * dim; });
        mats.forEach(m => { if (m.isMeshStandardMaterial) m.envMapIntensity = m.userData.env * (0.55 + 0.45 * dim); });
      }

      items.forEach(it => {
        const k = clamp01((s - it.t0) / it.d);
        it.g.visible = k > 0;
        if (k > 0) { it.g.position.y = 0.02 + (1 - bounce(k)) * 1.5; it.g.rotation.y = it.ry + (1 - out3(k)) * 0.8; }
      });
      // тінь густішає й стягується, коли предмет опускається на підлогу
      blobs.forEach(b => {
        b.m.visible = b.it.g.visible;
        if (!b.m.visible) return;
        const f = 1 - clamp01((b.it.g.position.y - 0.02) / 1.5), sc = 1.5 - 0.5 * f;
        b.m.scale.set(b.w * sc * f + 1e-4, b.d * sc * f + 1e-4, 1);
        b.m.rotation.z = b.it.g.rotation.y;
      });
    },
    setColor(hex) { wantFloor.set(hex); mixWall(wantFloor, wantWall); },
    dispose() {
      if (ext) ext.forEach(E => { E.o.intensity = E.base; });
      geos.forEach(g => g.dispose()); mats.forEach(m => m.dispose());
      [Bricks, Tiles, Planks, Trims].forEach(I => I.m.dispose());
      texs.forEach(t => t.dispose());
    },
  };
  // одразу виставити стан p=0: плита, цегляні стіни й піддон видно вже з першого кадру
  api.update({ t: 0, dt: 0, p: 0, instant: true });
  return api;
}
