// Острівець-діорама: круглий зріз землі з пагорбом, A-будиночком, соснами, кладкою, затокою з лататтям і очеретом.
// p (0..1): камера облітає острівець, а доба минає — світанок → день → захід → ніч (світло у вікнах, світлячки, зорі).
// Колір неба віддаємо назовні через skyColor (сайт може фарбувати ним фон); у самій сцені — лише сонце, місяць і зорі.
export const meta = {
  id: 'ostrivets-diorama-travya', name: 'Острівець-діорама',
  for: 'глемпінг, база відпочинку, котедж на озері, еко-садиба, риболовля, турклуб',
  idea: "Круглий шматочок землі з трав'янистим пагорбом, A-будиночком, соснами й кладкою в затоку з лататтям. Поки гортаєш, камера облітає острівець, а доба минає: рожевий світанок, ясний день, помаранчевий захід і синя ніч — світло тьмяніє, хмари тануть, сходять місяць і зорі, у вікнах вмикається світло, над травою блимають світлячки.",
  colors: ['#c2553a', '#5f8f3e', '#1d8db0', '#f2a65a'], color: '#c2553a',
  z: 8.6, bg: '#ebe7e1',
  sky: ['#f6d9d0', '#dcebf4', '#f5b783', '#1a2548'],
};

export function create(THREE, { weak = false, color = meta.color, scene = null } = {}) {
  const R = 1.65, WL = 0.1, BOT = -0.5;
  const clamp = x => Math.min(1, Math.max(0, x));
  const sm = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
  let seed = 7;
  const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let q = Math.imul(seed ^ (seed >>> 15), 1 | seed); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; };

  // рельєф: суша майже до краю, вузька смуга води по колу і затока біля кладки
  const HX = -0.25, HZ = 0.02, CV = { x: 1.2, z: 0.3 };
  const rsA = a => 1.45 + 0.07 * Math.sin(3 * a + 1) + 0.04 * Math.sin(5 * a - 2);
  const raw = (x, z) => {
    const land = sm(-0.2, 0.15, rsA(Math.atan2(z, x)) - Math.hypot(x, z)) * sm(0.45, 0.78, Math.hypot(x - CV.x, z - CV.z));
    const hill = 0.6 * Math.exp(-((x + 0.45) ** 2 + 1.3 * (z + 0.15) ** 2) / 0.8)
      + 0.2 * Math.exp(-((x + 0.95) ** 2 + (z - 0.55) ** 2) / 0.25) + 0.025 * Math.sin(3.1 * x + 1) * Math.cos(4.3 * z);
    return -0.14 + land * (0.36 + hill);
  };
  const HY = raw(HX, HZ);
  const hgt = (x, z) => { const r0 = raw(x, z); return r0 + (HY - r0) * sm(0.42, 0.24, Math.hypot(x - HX, z - HZ)); };
  const A = { x: 0.59, z: 0.18 }, B = { x: 1.445, z: 0.35 }, DECK = WL + 0.07;
  const pierDist = (x, z) => {
    const dx = B.x - A.x, dz = B.z - A.z, u = clamp(((x - A.x) * dx + (z - A.z) * dz) / (dx * dx + dz * dz));
    return Math.hypot(x - A.x - dx * u, z - A.z - dz * u);
  };
  const HROT = Math.atan2(A.x - HX, A.z - HZ), FX = Math.sin(HROT), FZ = Math.cos(HROT);
  // чи заступає точка фасад будиночка (конус перед вікном)
  const blocksFront = (x, z) => { const dx = x - HX, dz = z - HZ, d = Math.hypot(dx, dz); return d < 1.15 && dx * FX + dz * FZ > 0.5 * d; };

  const root = new THREE.Group(), sky = new THREE.Group(), tilt = new THREE.Group(), spin = new THREE.Group();
  root.add(sky, tilt); tilt.add(spin); tilt.position.y = -0.45;
  const mats = [];
  const std = o => { const m = new THREE.MeshStandardMaterial(o); mats.push(m); return m; };

  // полярна сітка-диск
  function disc(rad, NR, NS, fy) {
    const pos = [], idx = [];
    for (let i = 0; i <= NR; i++) for (let j = 0; j <= NS; j++) {
      const r = rad * i / NR, a = j / NS * Math.PI * 2, x = r * Math.cos(a), z = r * Math.sin(a);
      pos.push(x, fy(x, z), z);
    }
    for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) {
      const a = i * (NS + 1) + j, b = a + 1, c = a + NS + 1, d = c + 1;
      idx.push(a, b, c, b, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    return g;
  }
  // вертикальна «стінка» по краю диска: rows(h) -> [[y, color], ...]
  function wall(rad, NS, rows) {
    const pos = [], col = [], idx = []; let nr = 0;
    for (let j = 0; j <= NS; j++) {
      const a = j / NS * Math.PI * 2, x = Math.cos(a), z = Math.sin(a);
      const rr = rows(hgt(x * R, z * R)); nr = rr.length;
      for (const [y, c] of rr) { pos.push(x * rad, y, z * rad); col.push(c.r, c.g, c.b); }
    }
    for (let j = 0; j < NS; j++) for (let k = 0; k < nr - 1; k++) {
      const a = j * nr + k, b = a + 1, c = a + nr, d = c + 1;
      idx.push(a, c, b, c, d, b);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  // м'яка радіальна пляма для спрайтів
  function softTex(size, stops) {
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const g = cv.getContext('2d'), h = size / 2, gr = g.createRadialGradient(h, h, 0, h, h, h);
    for (const [o, c] of stops) gr.addColorStop(o, c);
    g.fillStyle = gr; g.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(cv);
  }

  const C = h => new THREE.Color(h);
  const cGrass1 = C('#6f9a48'), cGrass2 = C('#4c7a35'), cSand = C('#d6bd86'), cWet = C('#7d6a4e'),
    cSoil1 = C('#7a5236'), cSoil2 = C('#5c3d29'), cRock = C('#4a4541'), tc = new THREE.Color();

  // земля зверху
  const NS = weak ? 80 : 128;
  const tGeo = disc(R, weak ? 30 : 46, NS, hgt), tP = tGeo.attributes.position, tCol = [];
  for (let i = 0; i < tP.count; i++) {
    const x = tP.getX(i), y = tP.getY(i), z = tP.getZ(i);
    const n = 0.5 + 0.25 * Math.sin(x * 7.1 + z * 3.3) + 0.25 * Math.sin(z * 9.7 - x * 2.1);
    tc.copy(cGrass1).lerp(cGrass2, n * 0.8);
    tc.lerp(cSand, sm(WL + 0.09, WL + 0.03, y)).lerp(cWet, sm(WL - 0.01, WL - 0.08, y));
    tCol.push(tc.r, tc.g, tc.b);
  }
  tGeo.setAttribute('color', new THREE.Float32BufferAttribute(tCol, 3));
  tGeo.computeVertexNormals();
  spin.add(new THREE.Mesh(tGeo, std({ vertexColors: true, roughness: 0.92 })));

  // зріз ґрунту по краю + дно
  const skirt = wall(R, NS, h => [[h, cGrass2], [h - 0.05, cSoil1], [-0.24, cSoil1], [-0.27, cSoil2], [-0.42, cSoil2], [BOT, cRock]]);
  spin.add(new THREE.Mesh(skirt, std({ vertexColors: true, roughness: 1 })));
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(R, NS), std({ color: 0x3a3532, roughness: 1 }));
  bottom.rotation.x = Math.PI / 2; bottom.position.y = BOT; spin.add(bottom);

  // спільний час для шейдерних хвиль і трави
  const uT = { value: 0 };
  // вода: насичена поверхня з хвилями + непрозора бічна смуга, де видно товщу
  const waterMat = std({ color: '#1d8db0', roughness: 0.14, metalness: 0.1, transparent: true, opacity: 0.92, depthWrite: false });
  // хвилі й нормалі рахуються у вершинному шейдері — без перерахунку геометрії на CPU
  waterMat.onBeforeCompile = sh => {
    sh.uniforms.uT = uT;
    sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader
      .replace('#include <beginnormal_vertex>', `
        float wf = 1.0 - pow(min(1.0, length(position.xz) / ${R.toFixed(3)}), 6.0);
        float wa = position.x * 5.0 + uT * 1.4;
        float wb = position.z * 6.5 - uT * 1.1;
        float wH = wf * (0.007 * sin(wa) + 0.006 * sin(wb));
        vec3 objectNormal = normalize(vec3(-wf * 0.035 * cos(wa), 1.0, -wf * 0.039 * cos(wb)));
        #ifdef USE_TANGENT
        vec3 objectTangent = vec3(tangent.xyz);
        #endif`)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.y += wH;');
  };
  waterMat.customProgramCacheKey = () => 'ostr-water';
  const wGeo = disc(R - 0.004, weak ? 16 : 24, weak ? 64 : 96, () => WL);
  wGeo.computeVertexNormals();
  const water = new THREE.Mesh(wGeo, waterMat); water.renderOrder = 2; spin.add(water);
  const wTop = new THREE.Color(1, 1, 1), wDeep = new THREE.Color(0.42, 0.46, 0.5);
  const band = wall(R + 0.004, NS, h => [[WL, wTop], [Math.min(h, WL), wDeep]]);
  const bandMat = std({ color: '#1d8db0', vertexColors: true, roughness: 0.3 });
  spin.add(new THREE.Mesh(band, bandMat));

  // A-подібний будиночок
  const house = new THREE.Group();
  house.position.set(HX, HY - 0.01, HZ);
  house.rotation.y = HROT;
  spin.add(house);
  const W = 0.5, H = 0.56, D = 0.5, th = Math.atan2(H, W / 2), L = Math.hypot(W / 2, H);
  const tri = new THREE.Shape([new THREE.Vector2(-W / 2, 0), new THREE.Vector2(W / 2, 0), new THREE.Vector2(0, H)]);
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: D, bevelEnabled: false }), std({ color: '#d9b58a', roughness: 0.8 }));
  body.position.z = -D / 2; house.add(body);
  const roofMat = std({ color, roughness: 0.6 });
  for (const s of [-1, 1]) {
    const pane = new THREE.Mesh(new THREE.BoxGeometry(L + 0.09, 0.035, D + 0.12), roofMat);
    pane.rotation.z = -s * th;
    pane.position.set(s * W / 4 + s * Math.sin(th) * 0.02, H / 2 + Math.cos(th) * 0.02, 0);
    house.add(pane);
  }
  const base = new THREE.Mesh(new THREE.BoxGeometry(W + 0.08, 0.22, D + 0.1), std({ color: '#8d8378', roughness: 0.95 }));
  base.position.y = -0.11; house.add(base);
  const porch = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, 0.03, 0.2), std({ color: '#9a6b45', roughness: 0.85 }));
  porch.position.set(0, 0.01, D / 2 + 0.1); house.add(porch);
  // вікна на обох фронтонах — світло видно з будь-якого боку
  const winShape = new THREE.Shape([new THREE.Vector2(-0.16, 0.05), new THREE.Vector2(0.16, 0.05), new THREE.Vector2(0, 0.05 + 0.16 * H / (W / 2))]);
  const winGeo = new THREE.ShapeGeometry(winShape);
  const winMat = std({ color: '#26313b', roughness: 0.15, metalness: 0.4, emissive: '#ffb35c', emissiveIntensity: 0 });
  const frameMat = std({ color: '#3a2a1e', roughness: 0.7 });
  const mullGeo = new THREE.BoxGeometry(0.018, 0.36, 0.012), crossGeo = new THREE.BoxGeometry(0.2, 0.018, 0.012);
  for (const s of [1, -1]) {
    const g = new THREE.Group(); g.rotation.y = s > 0 ? 0 : Math.PI; house.add(g);
    const win = new THREE.Mesh(winGeo, winMat); win.position.z = D / 2 + 0.003; g.add(win);
    const mull = new THREE.Mesh(mullGeo, frameMat); mull.position.set(0, 0.23, D / 2 + 0.006); g.add(mull);
    const cross = new THREE.Mesh(crossGeo, frameMat); cross.position.set(0, 0.17, D / 2 + 0.006); g.add(cross);
  }
  // одна лампа перед фасадом; на слабкому телефоні — лише світіння вікон
  const lamp = weak ? null : new THREE.PointLight(0xffa850, 0, 2.2, 2);
  if (lamp) { lamp.position.set(0, 0.2, D / 2 + 0.22); house.add(lamp); }

  // кладка до води
  const pier = new THREE.Group(), PL = Math.hypot(B.x - A.x, B.z - A.z), PA = Math.atan2(B.z - A.z, B.x - A.x);
  pier.position.set(A.x, DECK, A.z); pier.rotation.y = -PA; spin.add(pier);
  const toWorld = (lx, lz) => [A.x + lx * Math.cos(PA) - lz * Math.sin(PA), A.z + lx * Math.sin(PA) + lz * Math.cos(PA)];
  const wood = std({ color: '#a77a4f', roughness: 0.85 }), woodDark = std({ color: '#6b4a30', roughness: 0.9 });
  const nPl = Math.floor(PL / 0.072);
  const planks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.022, 0.2), wood, nPl);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3(), up = new THREE.Vector3();
  for (let i = 0; i < nPl; i++) {
    e.set(0, (rnd() - 0.5) * 0.08, (rnd() - 0.5) * 0.05); q.setFromEuler(e);
    m4.compose(v3.set(i * 0.072 + 0.04, (rnd() - 0.5) * 0.006, 0), q, s3.set(1, 1, 1)); planks.setMatrixAt(i, m4);
  }
  pier.add(planks);
  const nPost = Math.floor(PL / 0.3) + 1, postXZ = [];
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.55, 6), woodDark, nPost * 2);
  for (let i = 0; i < nPost; i++) for (const s of [-1, 1]) {
    const lx = 0.08 + i * (PL - 0.12) / (nPost - 1), lz = s * 0.095;
    m4.makeTranslation(lx, -0.25, lz); posts.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), m4);
    postXZ.push(toWorld(lx, lz));
  }
  pier.add(posts);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.24, 0.025), woodDark); post.position.set(PL - 0.02, 0.12, 0.1); pier.add(post);
  const lantMat = std({ color: '#3b3128', roughness: 0.4, emissive: '#ffbf6b', emissiveIntensity: 0 });
  const lant = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), lantMat); lant.position.set(PL - 0.02, 0.26, 0.1); pier.add(lant);
  // човник біля кладки
  const boat = new THREE.Group(); boat.position.set(PL - 0.22, WL - DECK, -0.24); boat.rotation.y = 0.25; pier.add(boat);
  const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), std({ color: '#e9e1d2', roughness: 0.6, side: THREE.DoubleSide }));
  hull.scale.set(0.22, 0.075, 0.085); boat.add(hull);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.012, 0.15), wood); seat.position.y = -0.012; boat.add(seat);

  // піна навколо паль у воді
  const foamAt = postXZ.filter(([x, z]) => hgt(x, z) < WL - 0.02);
  const foamMat = std({ color: '#f4f1ea', roughness: 0.7, transparent: true, opacity: 0.6, depthWrite: false });
  const foam = new THREE.InstancedMesh(new THREE.RingGeometry(0.022, 0.042, 18).rotateX(-Math.PI / 2), foamMat, Math.max(1, foamAt.length));
  foam.count = foamAt.length; foam.renderOrder = 3; spin.add(foam);

  // латаття з квітками
  const pads = [];
  for (let k = 0; k < 4000 && pads.length < (weak ? 7 : 11); k++) {
    const r = (R - 0.1) * Math.sqrt(rnd()), a = rnd() * Math.PI * 2, x = r * Math.cos(a), z = r * Math.sin(a);
    if (hgt(x, z) > WL - 0.06 || pierDist(x, z) < 0.17 || pads.some(o => Math.hypot(o.x - x, o.z - z) < 0.13)) continue;
    pads.push({ x, z, s: 0.045 + rnd() * 0.035, ry: rnd() * 6.3 });
  }
  const padMat = std({ roughness: 0.55, side: THREE.DoubleSide });
  const lily = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 16, 0.35, Math.PI * 2 - 0.35).rotateX(-Math.PI / 2), padMat, pads.length);
  const padPal = [C('#4f8a3c'), C('#5d9a44'), C('#447a35')];
  pads.forEach((o, i) => {
    q.setFromAxisAngle(up.set(0, 1, 0), o.ry);
    m4.compose(v3.set(o.x, WL + 0.012, o.z), q, s3.set(o.s, 1, o.s)); lily.setMatrixAt(i, m4); lily.setColorAt(i, padPal[i % 3]);
  });
  spin.add(lily);
  const nFl = Math.min(4, pads.length);
  const flowers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), std({ color: '#f6d7e1', roughness: 0.6, flatShading: true }), Math.max(1, nFl));
  flowers.count = nFl;
  for (let i = 0; i < nFl; i++) {
    const o = pads[i * 2 % pads.length];
    m4.compose(v3.set(o.x, WL + 0.03, o.z), q.identity(), s3.set(0.024, 0.018, 0.024)); flowers.setMatrixAt(i, m4);
  }
  spin.add(flowers);

  // очерет купками біля берега
  const reedPts = [];
  for (let k = 0; k < 8000 && reedPts.length < (weak ? 8 : 13); k++) {
    const r = R * 0.95 * Math.sqrt(rnd()), a = rnd() * Math.PI * 2, x = r * Math.cos(a), z = r * Math.sin(a), h = hgt(x, z);
    if (h > WL - 0.008 || h < WL - 0.07 || pierDist(x, z) < 0.22 || blocksFront(x, z)) continue;
    if (reedPts.some(o => Math.hypot(o.x - x, o.z - z) < 0.3)) continue;
    reedPts.push({ x, z, h });
  }
  const PER = 6;
  const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.45, 1, 1, 4), std({ color: '#7d8a3e', roughness: 0.8 }), Math.max(1, reedPts.length * PER));
  const heads = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 6), std({ color: '#6a4529', roughness: 0.9 }), Math.max(1, reedPts.length * 2));
  stems.count = reedPts.length * PER; heads.count = reedPts.length * 2;
  reedPts.forEach((o, i) => {
    for (let j = 0; j < PER; j++) {
      const x = o.x + (rnd() - 0.5) * 0.09, z = o.z + (rnd() - 0.5) * 0.09, hh = 0.14 + rnd() * 0.12, y0 = hgt(x, z);
      e.set((rnd() - 0.5) * 0.3, 0, (rnd() - 0.5) * 0.3); q.setFromEuler(e);
      v3.set(0, hh / 2, 0).applyQuaternion(q);
      m4.compose(v3.add(up.set(x, y0, z)), q, s3.set(0.006, hh, 0.006)); stems.setMatrixAt(i * PER + j, m4);
      if (j < 2) {
        v3.set(0, hh - 0.01, 0).applyQuaternion(q).add(up.set(x, y0, z));
        m4.compose(v3, q, s3.set(0.011, 0.045, 0.011)); heads.setMatrixAt(i * 2 + j, m4);
      }
    }
  });
  spin.add(stems, heads);

  // сосни-конуси
  const trees = [];
  for (let k = 0; k < 1500 && trees.length < (weak ? 11 : 17); k++) {
    const r = R * 0.92 * Math.sqrt(rnd()), a = rnd() * Math.PI * 2, x = r * Math.cos(a), z = r * Math.sin(a), h = hgt(x, z);
    if (h < WL + 0.1 || Math.hypot(x - HX, z - HZ) < 0.42 || pierDist(x, z) < 0.2 || blocksFront(x, z)) continue;
    if (trees.some(o => Math.hypot(o.x - x, o.z - z) < 0.2)) continue;
    trees.push({ x, z, h, s: 0.7 + rnd() * 0.55 });
  }
  const tierGeo = new THREE.ConeGeometry(1, 1, 7);
  const tiers = new THREE.InstancedMesh(tierGeo, std({ roughness: 0.85, flatShading: true }), trees.length * 3);
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.022, 0.032, 1, 6), woodDark, trees.length);
  const pines = [C('#2f5a34'), C('#3d6c3a'), C('#284d33'), C('#46743f')];
  trees.forEach((o, i) => {
    const s = o.s;
    m4.compose(v3.set(o.x, o.h + 0.06 * s, o.z), q.identity(), s3.set(1, 0.14 * s, 1)); trunks.setMatrixAt(i, m4);
    [[0.2, 0.26, 0.2], [0.155, 0.22, 0.33], [0.105, 0.19, 0.45]].forEach(([rr, hh, yy], j) => {
      q.setFromAxisAngle(up.set(0, 1, 0), rnd() * 3);
      m4.compose(v3.set(o.x, o.h + yy * s, o.z), q, s3.set(rr * s, hh * s, rr * s));
      tiers.setMatrixAt(i * 3 + j, m4); tiers.setColorAt(i * 3 + j, pines[(i + j) % 4]);
    });
  });
  spin.add(tiers, trunks);

  // каміння на березі
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), std({ color: '#9a948c', roughness: 0.9, flatShading: true }), 14);
  let rocksN = 0;
  for (let k = 0; k < 3000 && rocksN < 14; k++) {
    const r = R * 0.95 * Math.sqrt(rnd()), a = rnd() * Math.PI * 2, x = r * Math.cos(a), z = r * Math.sin(a), h = hgt(x, z);
    if (Math.abs(h - WL) > 0.035 || pierDist(x, z) < 0.15) continue;
    e.set(rnd() * 3, rnd() * 3, rnd() * 3); q.setFromEuler(e);
    const s = 0.035 + rnd() * 0.05;
    m4.compose(v3.set(x, h, z), q, s3.set(s, s * 0.7, s)); rocks.setMatrixAt(rocksN++, m4);
  }
  rocks.count = rocksN;
  spin.add(rocks);

  // трава купками: біля сосон і вздовж берега; відкритий схил — чистий
  const blades = [], PB = weak ? 3 : 5;
  const tuft = (cx, cz) => {
    for (let j = 0; j < PB; j++) {
      const x = cx + (rnd() - 0.5) * 0.07, z = cz + (rnd() - 0.5) * 0.07, h = hgt(x, z);
      if (h < WL + 0.025 || Math.hypot(x - HX, z - HZ) < 0.33 || pierDist(x, z) < 0.1) continue;
      // нахил від центру купки — віялом
      const dx = x - cx, dz = z - cz;
      blades.push({ x, y: h - 0.004, z, rx: dz * 6, rz: -dx * 6, ry: rnd() * 6.3, s: 0.65 + rnd() * 0.6 });
    }
  };
  trees.forEach(o => { for (let c = 0; c < 2; c++) { const a = rnd() * 6.3, d = (0.17 + rnd() * 0.08) * o.s; tuft(o.x + Math.cos(a) * d, o.z + Math.sin(a) * d); } });
  const shore = [];
  for (let k = 0; k < 4000 && shore.length < (weak ? 8 : 14); k++) {
    const r = R * 0.96 * Math.sqrt(rnd()), a = rnd() * Math.PI * 2, x = r * Math.cos(a), z = r * Math.sin(a), h = hgt(x, z);
    if (h < WL + 0.03 || h > WL + 0.08 || pierDist(x, z) < 0.14 || blocksFront(x, z) || shore.some(o => Math.hypot(o.x - x, o.z - z) < 0.22)) continue;
    shore.push({ x, z }); tuft(x, z);
  }
  // широка низька травинка, основа в нулі
  const GH = 0.055;
  const grassMat = std({ roughness: 0.85 });
  if (!weak) {
    // гойдання у шейдері: верхівка зміщується, основа стоїть
    grassMat.onBeforeCompile = sh => {
      sh.uniforms.uT = uT;
      sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float gy = max(position.y, 0.0) / ${GH.toFixed(3)};
        float gw = sin(uT * 1.7 + instanceMatrix[3].x * 2.3 + instanceMatrix[3].z * 3.1) * 0.012 * gy * gy;
        transformed.x += gw; transformed.z += gw * 0.6;`);
    };
    grassMat.customProgramCacheKey = () => 'ostr-grass';
  }
  const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.024, GH, 3).translate(0, GH / 2, 0), grassMat, Math.max(1, blades.length));
  grass.count = blades.length;
  const gPal = [C('#7fae4f'), C('#5d8f3c'), C('#94b85a'), C('#4f7f33')];
  blades.forEach((b, i) => {
    e.set(b.rx, b.ry, b.rz); q.setFromEuler(e);
    m4.compose(v3.set(b.x, b.y, b.z), q, s3.set(1.2, b.s, 0.55)); grass.setMatrixAt(i, m4);
    grass.setColorAt(i, gPal[i % 4]);
  });
  spin.add(grass);

  // хмарки — пухкі непрозорі низькополігональні кульки
  const clouds = new THREE.Group(); clouds.position.y = 1.55; spin.add(clouds);
  const cloudMat = std({ color: '#ffffff', roughness: 1, flatShading: true, transparent: true });
  const puffs = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), cloudMat, 15);
  for (let c = 0, n = 0; c < 3; c++) {
    const a = c * 2.2 + 0.5, cx = Math.cos(a) * 1.25, cz = Math.sin(a) * 1.25, cy = c * 0.12;
    for (let k = 0; k < 5; k++) {
      const s = (k === 2 ? 0.17 : 0.1 + rnd() * 0.05);
      m4.compose(v3.set(cx + (k - 2) * 0.12, cy + (k === 2 ? 0.05 : 0) + rnd() * 0.03, cz + (rnd() - 0.5) * 0.1), q.identity(), s3.set(s, s * 0.8, s));
      puffs.setMatrixAt(n++, m4);
    }
  }
  clouds.add(puffs);

  // світлячки: точки, що блимають (блимання — через колір при адитивному змішуванні)
  const dot = softTex(32, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.6)'], [1, 'rgba(255,255,255,0)']]);
  const NF = weak ? 50 : 110, fBase = [], fPos = new Float32Array(NF * 3), fCol = new Float32Array(NF * 3);
  for (let k = 0; k < 4000 && fBase.length < NF; k++) {
    const r = R * 0.95 * Math.sqrt(rnd()), a = rnd() * Math.PI * 2, x = r * Math.cos(a), z = r * Math.sin(a), h = hgt(x, z);
    if (h < WL - 0.02) continue;
    fBase.push({ x, y: h + 0.08 + rnd() * 0.4, z, ph: rnd() * 20, sp: 0.6 + rnd() * 0.8 });
  }
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3)); fGeo.setAttribute('color', new THREE.BufferAttribute(fCol, 3));
  const fMat = new THREE.PointsMaterial({ size: 0.07, map: dot, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const flies = new THREE.Points(fGeo, fMat); flies.renderOrder = 3; spin.add(flies);

  // сонце й місяць: маленьке ядро + м'який ореол, над острівцем (у межах кола ~2.2; не обертаються з острівцем)
  const halo = softTex(64, [[0, 'rgba(255,255,255,0.75)'], [0.25, 'rgba(255,255,255,0.32)'], [0.6, 'rgba(255,255,255,0.08)'], [1, 'rgba(255,255,255,0)']]);
  const sunMat = new THREE.MeshBasicMaterial({ color: '#fff1d6', transparent: true, depthWrite: false, toneMapped: false });
  const sun = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), sunMat); sun.renderOrder = -8; sky.add(sun);
  const sunHaloMat = new THREE.SpriteMaterial({ map: halo, transparent: true, depthWrite: false, toneMapped: false });
  const sunHalo = new THREE.Sprite(sunHaloMat); sunHalo.scale.setScalar(0.9); sunHalo.renderOrder = -9; sky.add(sunHalo);
  const moonMat = new THREE.MeshBasicMaterial({ color: '#eef1f8', transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.09, 32), moonMat); moon.renderOrder = -8; sky.add(moon);
  const moonHaloMat = new THREE.SpriteMaterial({ map: halo, color: '#c9d6ff', transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
  const moonHalo = new THREE.Sprite(moonHaloMat); moonHalo.scale.setScalar(0.6); moonHalo.renderOrder = -9; sky.add(moonHalo);
  // зорі — на задньому верхньому куполі радіусом ~2.1
  const NSt = weak ? 90 : 160, stPos = new Float32Array(NSt * 3);
  for (let i = 0, n = 0; n < NSt && i < 5000; i++) {
    const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, rr = Math.sqrt(1 - u * u);
    const x = rr * Math.cos(a), y = u, z = rr * Math.sin(a);
    if (y < 0.35 || z > -0.15) continue;
    const s = 1.95 + rnd() * 0.2;
    stPos.set([x * s, y * s, z * s], n++ * 3);
  }
  const stGeo = new THREE.BufferGeometry(); stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3));
  const stMat = new THREE.PointsMaterial({ size: 0.035, map: dot, color: '#dfe6ff', transparent: true, opacity: 0, depthWrite: false });
  const stars = new THREE.Points(stGeo, stMat); stars.renderOrder = -9; sky.add(stars);
  const sunLight = new THREE.DirectionalLight(0xffffff, 2); sky.add(sunLight);

  // світло сцени від stage.js: керуємо ним за часом доби, при dispose — повертаємо
  const stageLights = scene ? scene.children.filter(o => o.isLight).map(o => ({ o, i: o.intensity, c: o.color.clone(), g: o.groundColor && o.groundColor.clone() })) : [];

  // стопи доби: світанок, день, захід, ніч
  const T = [0, 0.3, 0.62, 0.9];
  const P = a => a.map(C);
  const K = {
    sky: P(meta.sky),
    sunC: P(['#ffc2b0', '#fff4e4', '#ff9a50', '#8ea6ff']), sunI: [1.6, 2.6, 1.8, 0.55],
    hSky: P(['#f7cfd4', '#dcecff', '#ffc08a', '#3a4b80']), hGr: P(['#6b5a6a', '#6f7a52', '#6a4a3a', '#141a2c']), hI: [0.8, 0.9, 0.7, 0.45],
    key: [0.32, 0.45, 0.28, 0.04], env: [0.75, 1, 0.75, 0.22],
    water: P(['#3a8c9e', '#1d8db0', '#2f7486', '#14284d']),
    cloud: P(['#ffe1e3', '#ffffff', '#ffc89c', '#b9c6e6']), cloudA: [1, 1, 0.95, 0],
    disc: P(['#fff0e4', '#fff8e6', '#ffd6a0', '#ffd6a0']), halo: P(['#ffc7b8', '#fff3d6', '#ffab66', '#ffab66']),
    win: [0.9, 0, 0.7, 2.6], fly: [0, 0, 0.1, 1], star: [0, 0, 0, 1],
  };
  function at(k) {
    if (k <= T[0]) return [0, 0];
    for (let i = 0; i < 3; i++) if (k < T[i + 1]) return [i, sm(0, 1, (k - T[i]) / (T[i + 1] - T[i]))];
    return [2, 1];
  }
  const mixC = (out, arr, s) => out.copy(arr[s[0]]).lerp(arr[s[0] + 1], s[1]);
  const mixN = (arr, s) => arr[s[0]] + (arr[s[0] + 1] - arr[s[0]]) * s[1];

  // обліт: будиночок у камері на три чверті з фронтоном і на старті (−0.45 рад), і наприкінці (+0.45 рад) —
  // між ними повне коло довкола острівця
  const S1 = 0.45 - HROT, SPAN = Math.PI * 2 + 0.9;

  const skyColor = new THREE.Color(meta.sky[0]), want = new THREE.Color(color), tmp = new THREE.Color();
  const sunP = new THREE.Vector3(), moonP = new THREE.Vector3(), lA = new THREE.Vector3(), lB = new THREE.Vector3();
  let shown = -1, yaw = 0, pitch = 0;

  return {
    object: root, skyColor,
    update({ t, dt, p, mx, my, instant }) {
      p = clamp(p);
      shown = instant || shown < 0 ? p : shown + (p - shown) * Math.min(1, dt * 3);
      const k = shown, s = at(k), fast = instant ? 1 : Math.min(1, dt * 3);

      // камера облітає: острівець повертається, нахил трохи опускається до ночі
      yaw += (mx * 0.35 - yaw) * fast; pitch += (my * 0.12 - pitch) * fast;
      spin.rotation.y = S1 - (1 - k) * SPAN + 0.05 * Math.sin(t * 0.15);
      tilt.rotation.set(0.5 - 0.12 * k + pitch, yaw, 0);

      uT.value = t;

      // сонце йде дугою зліва направо й гасне на заході, потім сходить місяць
      const ks = clamp(k / 0.74), a = Math.PI * (0.9 - 0.8 * ks);
      sunP.set(Math.cos(a) * 1.2, 1.35 + Math.sin(a) * 0.35, -0.9);
      sun.position.copy(sunP); sunHalo.position.copy(sunP);
      const sunVis = 1 - sm(0.64, 0.78, k);
      sunMat.opacity = sunVis; sunHaloMat.opacity = sunVis * 0.9; sun.visible = sunHalo.visible = sunVis > 0.01;
      mixC(sunMat.color, K.disc, s); mixC(sunHaloMat.color, K.halo, s);
      const m = sm(0.74, 0.95, k), b = Math.PI * (0.8 - 0.12 * m);
      moonP.set(Math.cos(b) * 1.1, 1.3 + Math.sin(b) * 0.4, -0.9);
      moon.position.copy(moonP); moonHalo.position.copy(moonP);
      moonMat.opacity = m; moonHaloMat.opacity = m * 0.5; moon.visible = moonHalo.visible = m > 0.01;
      // напрям світла: низько збоку вранці й увечері, згори вдень
      lA.set(Math.cos(a) * 3, 0.7 + Math.sin(a) * 2.2, 1.4); lB.set(-1.6, 2.2, 1.2);
      sunLight.position.copy(lA).lerp(lB, sm(0.7, 0.85, k));
      mixC(sunLight.color, K.sunC, s); sunLight.intensity = mixN(K.sunI, s);

      // загальне світло і відблиски
      const env = mixN(K.env, s);
      for (const mt of mats) mt.envMapIntensity = env;
      const keyF = mixN(K.key, s);
      for (const L0 of stageLights) {
        if (L0.o.isHemisphereLight) { mixC(L0.o.color, K.hSky, s); mixC(L0.o.groundColor, K.hGr, s); L0.o.intensity = mixN(K.hI, s); }
        else L0.o.intensity = L0.i * keyF;
      }
      mixC(skyColor, K.sky, s);

      // вода: колір за часом доби (хвилі — у шейдері)
      mixC(tmp, K.water, s); waterMat.color.copy(tmp); bandMat.color.copy(tmp);
      boat.position.y = WL - DECK + 0.01 + Math.sin(t * 1.3) * 0.006; boat.rotation.z = Math.sin(t * 1.1) * 0.04;
      foamAt.forEach(([x, z], i) => {
        const sc = 1 + 0.18 * Math.sin(t * 2 + i * 1.7);
        m4.compose(v3.set(x, WL + 0.014, z), q.identity(), s3.set(sc, 1, sc)); foam.setMatrixAt(i, m4);
      });
      foam.instanceMatrix.needsUpdate = true;
      foamMat.opacity = 0.6 - 0.3 * sm(0.75, 0.95, k);

      // хмари: вдень пухкі, на ніч холоднішають і тануть
      clouds.rotation.y = t * 0.04 + k * 0.6;
      mixC(cloudMat.color, K.cloud, s);
      cloudMat.opacity = mixN(K.cloudA, s); clouds.visible = cloudMat.opacity > 0.01;

      // вікна й ліхтар
      const wi = mixN(K.win, s);
      winMat.emissiveIntensity = wi; lantMat.emissiveIntensity = wi * 0.9;
      if (lamp) lamp.intensity = wi * 0.9;

      // світлячки і зорі
      fMat.opacity = mixN(K.fly, s);
      stMat.opacity = mixN(K.star, s) * 0.9; stars.visible = stMat.opacity > 0.01;
      if (fMat.opacity > 0.01) {
        fBase.forEach((f, i) => {
          const tt = t * f.sp + f.ph;
          fPos[i * 3] = f.x + Math.sin(tt * 0.7) * 0.07;
          fPos[i * 3 + 1] = f.y + Math.sin(tt * 1.1) * 0.05;
          fPos[i * 3 + 2] = f.z + Math.cos(tt * 0.6) * 0.07;
          const bl = Math.max(0, Math.sin(tt * 2.3)) ** 2;
          fCol[i * 3] = bl; fCol[i * 3 + 1] = bl * 0.85; fCol[i * 3 + 2] = bl * 0.35;
        });
        fGeo.attributes.position.needsUpdate = true; fGeo.attributes.color.needsUpdate = true;
      }

      roofMat.color.lerp(want, instant ? 1 : 1 - Math.pow(0.02, dt));
    },
    setColor(hex) { want.set(hex); },
    dispose() {
      for (const L0 of stageLights) { L0.o.intensity = L0.i; L0.o.color.copy(L0.c); if (L0.g) L0.o.groundColor.copy(L0.g); }
      root.traverse(o => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); });
      dot.dispose(); halo.dispose();
    },
  };
}
