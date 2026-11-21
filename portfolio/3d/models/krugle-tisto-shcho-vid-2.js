// Піца з нуля. p (0..1): кулька тіста в борошні → корж із румʼяним бортиком → соус → сир, що плавиться
// в суцільний шар → салямі → базилік → піца докручується, ролер-ніж ріже на 8 шматків, один відʼїжджає з нитками сиру.
export const meta = {
  id: 'krugle-tisto-shcho-vid-2', name: 'Піца з нуля', for: 'піцерія, доставка їжі, італійський ресторан, пекарня, фудтрак',
  idea: 'Кулька тіста в борошні сплющується в корж з пухирцями на бортику, зверху падають томатний соус, сир, що розтікається, салямі й листки базиліку; наприкінці ролер-ніж ріже піцу на 8 шматків, і один відʼїжджає, тягнучи нитки сиру.',
  colors: ['#e63b2e', '#ffc93c', '#3a9d4a', '#f0a64a'], color: '#e63b2e', scale: 0.9, bg: '#fbefdc',
};

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const PI = Math.PI, TAU = PI * 2, W = 8, WA = PI / 4;
  const cl = x => (x < 0 ? 0 : x > 1 ? 1 : x);
  const seg = (x, a, b) => cl((x - a) / (b - a));
  const sm = x => x * x * (3 - 2 * x);
  const back = x => 1 + 2.9 * Math.pow(x - 1, 3) + 1.9 * Math.pow(x - 1, 2);
  const wrapA = a => ((a % TAU) + TAU + PI) % TAU - PI;
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ---------- профілі тіста: куля і корж з однаковою кількістю точок ----------
  const NP = weak ? 44 : 72, SEG = weak ? 6 : 10, NI = W * SEG;
  const ball = [];
  for (let j = 0; j < NP; j++) { const a = -PI / 2 + (j / (NP - 1)) * PI; ball.push([0.95 * Math.cos(a), 0.95 * Math.sin(a)]); }
  ball[0][0] = 0; ball[NP - 1][0] = 0;

  const RB = 1.74, RT = 0.16, YB = -0.1, YC = YB + RT;
  const path = [];
  for (let i = 0; i <= 20; i++) path.push([(RB * i) / 20, YB, 1]);
  for (let i = 1; i <= 24; i++) { const a = -PI / 2 + (i / 24) * 1.5 * PI; path.push([RB + RT * Math.cos(a), YC + RT * Math.sin(a), 3.2]); }
  path.push([1.54, 0.012, 2]);
  for (let i = 0; i <= 20; i++) path.push([1.5 * (1 - i / 20), 0, 1]);
  // рівномірно за «зваженою» довжиною — на бортик більше точок
  const cum = [0];
  for (let i = 1; i < path.length; i++) cum.push(cum[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]) * path[i][2]);
  const L = cum[cum.length - 1], disc = [];
  for (let j = 0, s = 1; j < NP; j++) {
    const u = (j / (NP - 1)) * L;
    while (s < path.length - 1 && cum[s] < u) s++;
    const f = (u - cum[s - 1]) / Math.max(1e-6, cum[s] - cum[s - 1]);
    disc.push([path[s - 1][0] + (path[s][0] - path[s - 1][0]) * f, path[s - 1][1] + (path[s][1] - path[s - 1][1]) * f]);
  }
  disc[0] = [0, YB]; disc[NP - 1] = [0, 0];

  const prof = new Float32Array(NP * 2), nrm = new Float32Array(NP * 2);
  function setProfile(k) {
    for (let j = 0; j < NP; j++) {
      prof[2 * j] = Math.max(0, ball[j][0] + (disc[j][0] - ball[j][0]) * k);
      prof[2 * j + 1] = ball[j][1] + (disc[j][1] - ball[j][1]) * k;
    }
    for (let j = 0; j < NP; j++) {
      const a = Math.max(0, j - 1), b = Math.min(NP - 1, j + 1);
      const dr = prof[2 * b] - prof[2 * a], dy = prof[2 * b + 1] - prof[2 * a + 1], l = Math.hypot(dr, dy) || 1;
      nrm[2 * j] = dy / l; nrm[2 * j + 1] = -dr / l;
    }
  }

  // ---------- шум тіста: грудки на кульці, хвилі й пухирці на бортику, румʼяні плями ----------
  const SPH = new Float32Array(NI), CPH = new Float32Array(NI);
  for (let i = 0; i < NI; i++) { SPH[i] = Math.sin((i / NI) * TAU); CPH[i] = Math.cos((i / NI) * TAU); }
  let jTop = 0;
  for (let j = 0; j < NP; j++) if (disc[j][0] > 1.4 && disc[j][1] > disc[jTop][1]) jTop = j;
  const rimW = disc.map(([r]) => sm(seg(r, 1.3, 1.62)));
  const rimTopW = disc.map(([r, y], j) => rimW[j] * sm(seg(y, -0.04, 0.16)));
  const bubbles = [];
  for (let b = 0; b < (weak ? 12 : 18); b++) bubbles.push({ a: rnd() * TAU, j: jTop + (rnd() - 0.6) * 7, A: 0.022 + rnd() * 0.038, w: 0.05 + rnd() * 0.07, jw: 1.8 + rnd() * 1.8 });
  const lumpD = new Float32Array(NI * NP), rimD = new Float32Array(NI * NP), spotW = new Float32Array(NI * NP);
  for (let i = 0; i < NI; i++) {
    const ph = (i / NI) * TAU;
    const wave = 0.5 * Math.sin(3 * ph + 1.1) + 0.3 * Math.sin(7 * ph + 2.3) + 0.2 * Math.sin(17 * ph + 0.4);
    for (let j = 0; j < NP; j++) {
      const o = i * NP + j, tj = Math.sin((PI * j) / (NP - 1));
      lumpD[o] = tj * (0.03 * Math.sin(3 * ph + j * 0.31) * Math.cos(2 * ph - j * 0.17 + 0.7) + 0.014 * Math.sin(6 * ph + j * 0.53 + 1.3) + 0.008 * Math.sin(11 * ph - j * 0.9));
      let bub = 0;
      for (const b of bubbles) { const da = wrapA(ph - b.a) / b.w, dj = (j - b.j) / b.jw; bub += b.A * Math.exp(-da * da - dj * dj); }
      rimD[o] = rimW[j] * 0.032 * wave + bub;
      const n2 = Math.sin(5 * ph + 1 + j * 0.4) * Math.sin(11 * ph - j * 0.7 + 0.3) + 0.4 * Math.sin(23 * ph + j * 1.3);
      spotW[o] = Math.min(1, rimTopW[j] * cl(0.45 + 0.9 * n2) * 0.85 + Math.min(1, bub / 0.035) * 0.8 + rimW[j] * 0.22);
    }
  }

  // ---------- матеріали: насичені, з приглушеним відбиттям оточення ----------
  const raw = new THREE.Color(0xe8b877), baked = new THREE.Color(0xe8923a);
  const doughMat = new THREE.MeshStandardMaterial({ color: raw.clone(), roughness: 0.82, vertexColors: true, envMapIntensity: 0.5 });
  const crumbMat = new THREE.MeshStandardMaterial({ color: 0xf3d39c, roughness: 1, side: THREE.DoubleSide, envMapIntensity: 0.5 });
  const sauceTarget = new THREE.Color(), hsl = {};
  const tuneSauce = hex => { sauceTarget.set(hex); sauceTarget.getHSL(hsl); sauceTarget.setHSL(hsl.h, Math.min(1, hsl.s * 1.1), hsl.l * 0.8); };
  tuneSauce(color);
  const sauceMat = new THREE.MeshStandardMaterial({ color: sauceTarget.clone(), roughness: 0.5, envMapIntensity: 0.35 });
  const cheeseA = new THREE.Color(0xffd23a), cheeseB = new THREE.Color(0xffad12);
  const cheeseMat = new THREE.MeshStandardMaterial({ color: cheeseA.clone(), roughness: 0.25, envMapIntensity: 0.6 });
  const meltMat = new THREE.MeshStandardMaterial({ color: cheeseA.clone(), roughness: 0.25, envMapIntensity: 0.6 });
  const stringMat = new THREE.MeshStandardMaterial({ color: 0xffbf2a, roughness: 0.3, envMapIntensity: 0.6 });
  const salamiMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, envMapIntensity: 0.45 });
  const basilMat = new THREE.MeshStandardMaterial({ color: 0x2f8f3e, roughness: 0.45, side: THREE.DoubleSide, envMapIntensity: 0.5 });
  const flourMat = new THREE.MeshStandardMaterial({ color: 0xfff7ea, roughness: 1, envMapIntensity: 0.6 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 1, roughness: 0.22 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x2f6fde, roughness: 0.5 });

  // мʼяка тінь під тістом — контраст до кремового фону
  // alphaMap читає зелений канал, тому градієнт непрозорий: білий центр → чорний край
  let shTex = null;
  if (typeof document !== 'undefined') {
    const shCanvas = document.createElement('canvas'); shCanvas.width = shCanvas.height = 128;
    const cx = shCanvas.getContext('2d');
    if (cx) {
      cx.fillStyle = '#000'; cx.fillRect(0, 0, 128, 128);
      const gr = cx.createRadialGradient(64, 64, 0, 64, 64, 63);
      gr.addColorStop(0, '#fff'); gr.addColorStop(0.45, '#b3b3b3'); gr.addColorStop(1, '#000');
      cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128);
      shTex = new THREE.CanvasTexture(shCanvas);
    }
  }
  const shadowMat = new THREE.MeshStandardMaterial({ color: 0x4a2a10, roughness: 1, envMapIntensity: 0, alphaMap: shTex, transparent: true, opacity: 0.32, depthWrite: false });

  // ---------- геометрії ----------
  // плаский сектор з нерівним краєм (соус, розплавлений сир)
  function sector(phi0, nA, rings, Rf, y, yf) {
    const P = [0, y, 0], I = [];
    for (let r = 1; r <= rings; r++) for (let a = 0; a <= nA; a++) {
      const ph = phi0 + (a / nA) * WA, R = (r / rings) * Rf(ph);
      P.push(R * Math.sin(ph), y + (yf ? yf(ph, r / rings) : 0), R * Math.cos(ph));
    }
    const row = nA + 1, at = (r, a) => 1 + (r - 1) * row + a;
    for (let a = 0; a < nA; a++) I.push(0, at(1, a), at(1, a + 1));
    for (let r = 2; r <= rings; r++) for (let a = 0; a < nA; a++) { I.push(at(r - 1, a), at(r, a), at(r, a + 1), at(r - 1, a), at(r, a + 1), at(r - 1, a + 1)); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals();
    return g;
  }
  const sauceR = ph => 1.5 + 0.03 * Math.sin(5 * ph + 0.3) + 0.02 * Math.sin(13 * ph + 1.7);
  const meltR = ph => 1.32 + 0.07 * Math.sin(4 * ph + 0.8) + 0.05 * Math.sin(9 * ph + 2.1) + 0.03 * Math.sin(19 * ph);
  const meltY = (ph, f) => 0.006 * Math.sin(7 * ph + f * 9) * Math.sin(f * PI) + 0.004 * (1 - f);

  // кубик сиру із заокругленими краями
  const cheeseGeo = new THREE.SphereGeometry(0.085, weak ? 8 : 12, weak ? 6 : 9);
  {
    const cp = cheeseGeo.attributes.position;
    for (let i = 0; i < cp.count; i++) {
      const x = cp.getX(i), y = cp.getY(i), z = cp.getZ(i), l = Math.hypot(x, y, z) || 1;
      const nx = x / l, ny = y / l, nz = z / l, m = Math.max(Math.abs(nx), Math.abs(ny), Math.abs(nz)) || 1;
      const rr = ((0.075 / m) * 0.6 + 0.085 * 0.4) * (1 + 0.12 * Math.sin(nx * 5 + nz * 3));
      cp.setXYZ(i, nx * rr, ny * rr, nz * rr);
    }
    cheeseGeo.computeVertexNormals();
  }
  const salamiGeo = new THREE.CylinderGeometry(0.19, 0.18, 0.04, weak ? 16 : 28);
  // листок базиліку: форма + вигин човником
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -0.16); leafShape.quadraticCurveTo(0.12, -0.06, 0, 0.17); leafShape.quadraticCurveTo(-0.12, -0.06, 0, -0.16);
  const leafGeo = new THREE.ShapeGeometry(leafShape, weak ? 5 : 9);
  leafGeo.rotateX(-PI / 2);
  {
    const lp = leafGeo.attributes.position;
    for (let i = 0; i < lp.count; i++) { const x = lp.getX(i), z = lp.getZ(i); lp.setY(i, x * x * 3.2 - z * z * 0.6); }
    leafGeo.computeVertexNormals();
  }

  // ---------- сітка тіста: спільна для всіх шматків, щоб шви не було видно ----------
  const gp = new Float32Array(NI * NP * 3), gn = new Float32Array(NI * NP * 3);
  function buildGrid(k) {
    const kl = Math.max(0, 1 - k);
    for (let i = 0; i < NI; i++) {
      const s = SPH[i], c = CPH[i];
      for (let j = 0; j < NP; j++) {
        const o = i * NP + j, d = lumpD[o] * kl + rimD[o] * k;
        const r = Math.max(0, prof[2 * j] + nrm[2 * j] * d), y = prof[2 * j + 1] + nrm[2 * j + 1] * d;
        gp[3 * o] = r * s; gp[3 * o + 1] = y; gp[3 * o + 2] = r * c;
      }
    }
    for (let i = 0; i < NI; i++) {
      const ip = ((i + 1) % NI) * NP, im = ((i - 1 + NI) % NI) * NP, s = SPH[i], c = CPH[i];
      for (let j = 0; j < NP; j++) {
        const o = i * NP + j, jp = i * NP + Math.min(NP - 1, j + 1), jm = i * NP + Math.max(0, j - 1);
        const ax = gp[3 * (ip + j)] - gp[3 * (im + j)], ay = gp[3 * (ip + j) + 1] - gp[3 * (im + j) + 1], az = gp[3 * (ip + j) + 2] - gp[3 * (im + j) + 2];
        const bx = gp[3 * jp] - gp[3 * jm], by = gp[3 * jp + 1] - gp[3 * jm + 1], bz = gp[3 * jp + 2] - gp[3 * jm + 2];
        let nx = by * az - bz * ay, ny = bz * ax - bx * az, nz = bx * ay - by * ax;
        const anx = nrm[2 * j] * s, any = nrm[2 * j + 1], anz = nrm[2 * j] * c, l = Math.hypot(nx, ny, nz);
        if (l < 1e-9) { nx = anx; ny = any; nz = anz; } else { const f = (nx * anx + ny * any + nz * anz < 0 ? -1 : 1) / l; nx *= f; ny *= f; nz *= f; }
        gn[3 * o] = nx; gn[3 * o + 1] = ny; gn[3 * o + 2] = nz;
      }
    }
  }

  // ---------- ієрархія ----------
  const root = new THREE.Group(), tilt = new THREE.Group(), shift = new THREE.Group(), spin = new THREE.Group();
  root.add(tilt); tilt.add(shift); shift.add(spin);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
  shadow.rotation.x = -PI / 2; shadow.renderOrder = -1; shadow.visible = !!shTex; tilt.add(shadow);

  // зрізи коржа — з реального профілю бортика на кожній лінії розрізу
  setProfile(1);
  const capGeos = [];
  for (let w = 0; w < W; w++) {
    const gi = w * SEG, sh = new THREE.Shape();
    for (let j = 0; j < NP; j++) {
      const d = rimD[gi * NP + j], r = Math.max(0, prof[2 * j] + nrm[2 * j] * d), y = prof[2 * j + 1] + nrm[2 * j + 1] * d;
      j ? sh.lineTo(r, y) : sh.moveTo(r, y);
    }
    capGeos.push(new THREE.ShapeGeometry(sh));
  }
  setProfile(0);

  const wedges = [], doughs = [];
  const ballPts = ball.map(([r, y]) => new THREE.Vector2(r, y));
  for (let w = 0; w < W; w++) {
    const g = new THREE.Group();
    const dg = new THREE.LatheGeometry(ballPts, SEG, w * WA, WA);
    dg.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(dg.attributes.position.count * 3).fill(1), 3));
    const dough = new THREE.Mesh(dg, doughMat); dough.frustumCulled = false;
    const caps = [w, (w + 1) % W].map(b => { const c = new THREE.Mesh(capGeos[b], crumbMat); c.rotation.y = b * WA - PI / 2; c.visible = false; g.add(c); return c; });
    const sauce = new THREE.Mesh(sector(w * WA, weak ? 6 : 12, 2, sauceR, 0.022), sauceMat);
    const melt = new THREE.Mesh(sector(w * WA, weak ? 8 : 16, weak ? 3 : 5, meltR, 0.04, meltY), meltMat);
    sauce.frustumCulled = melt.frustumCulled = false; sauce.visible = melt.visible = false;
    g.add(dough, sauce, melt); spin.add(g);
    doughs.push(dg);
    wedges.push({ g, caps, sauce, melt, mid: w * WA + WA / 2, cheese: [], salami: [], basil: [] });
  }

  // сир — шматочки різного розміру, не на лініях розрізу
  const NC = weak ? 70 : 130;
  for (let n = 0; n < NC;) {
    const r = Math.sqrt(rnd()) * 1.38 + 0.05, a = rnd() * TAU, w = Math.floor(a / WA) % W, loc = a - w * WA;
    if (Math.min(loc, WA - loc) * r < 0.09) continue;
    wedges[w].cheese.push({ x: r * Math.sin(a), z: r * Math.cos(a), ts: 0.22 + rnd() * 0.09, h: 3.3 + rnd() * 0.9, s: 0.55 + Math.pow(rnd(), 1.4) * 1.0, ax: 0.75 + rnd() * 0.6, rx: (rnd() - 0.5) * 6, ry: (rnd() - 0.5) * 6, rz: (rnd() - 0.5) * 6, yaw: rnd() * PI, tone: rnd() });
    n++;
  }
  // салямі — по дві на шматок; базилік — один-два листки
  wedges.forEach((wd, w) => {
    [[1.12, (rnd() - 0.5) * 0.1], [0.58, 0]].forEach(([r, da]) => {
      const a = wd.mid + da;
      wd.salami.push({ x: r * Math.sin(a), z: r * Math.cos(a), ts: 0.33 + rnd() * 0.1, h: 3.4 + rnd() * 0.6, flip: (3 + Math.floor(rnd() * 2)) * PI, yaw: rnd() * PI, s: 0.92 + rnd() * 0.16 });
    });
    const leaves = [[0.88, w % 2 ? 0.1 : -0.1, 0]];
    if (w % 2 === 0) leaves.push([1.4, (rnd() - 0.5) * 0.3, PI / 2]);
    leaves.forEach(([r, da, turn]) => {
      const a = wd.mid + da;
      wd.basil.push({ x: r * Math.sin(a), z: r * Math.cos(a), ts: 0.45 + rnd() * 0.1, h: 3.0 + rnd() * 0.6, yaw: a + turn + (rnd() - 0.5) * 0.4, s: 0.85 + rnd() * 0.3, ph: rnd() * 6 });
    });
    const mk = (geo, mat, list) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length)); m.count = list.length; m.frustumCulled = false; wd.g.add(m); return m; };
    wd.cheeseMesh = mk(cheeseGeo, cheeseMat, wd.cheese);
    wd.salamiMesh = mk(salamiGeo, salamiMat, wd.salami);
    wd.basilMesh = mk(leafGeo, basilMat, wd.basil);
    const sc = new THREE.Color();
    wd.cheese.forEach((c, i) => wd.cheeseMesh.setColorAt(i, sc.setRGB(1, 0.86 + c.tone * 0.14, 0.7 + c.tone * 0.3)));
    wd.salami.forEach((_, i) => wd.salamiMesh.setColorAt(i, sc.setHSL(0.988, 0.78, 0.36 + rnd() * 0.06)));
  });

  // ролер-ніж для піци
  const cutter = new THREE.Group(), roll = new THREE.Group();
  {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.025, weak ? 28 : 48), steelMat); wheel.rotation.z = PI / 2;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.09, 16), handleMat); hub.rotation.z = PI / 2;
    roll.add(wheel, hub);
    const fork = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.05, 0.45), steelMat);
    fork.position.set(0.05, 0.15, -0.16); fork.rotation.x = 0.75;
    const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.6, 4, 12), handleMat);
    handle.position.set(0.05, 0.55, -0.59); handle.rotation.x = -0.82;
    cutter.add(roll, fork, handle);
    cutter.visible = false; spin.add(cutter);
  }

  // тягучі нитки сиру між шматком, що відʼїжджає, і сусідами
  const SS = 8, strandBase = [];
  [[0, 7], [WA, 1]].forEach(([phi, nb]) => [0.45, 0.85, 1.25].forEach(r => strandBase.push({ x: r * Math.sin(phi), z: r * Math.cos(phi), nb, tf: 0.7 + rnd() * 0.6, sag: 0.12 + rnd() * 0.1 })));
  const strands = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 7, 1, true), stringMat, strandBase.length * SS);
  strands.frustumCulled = false; strands.visible = false; spin.add(strands);

  // борошно: пил на кульці й кілька пилинок у повітрі
  buildGrid(0);
  const flour = [], NDs = weak ? 110 : 230, NDf = weak ? 14 : 30;
  for (let n = 0; n < NDs; n++) {
    const i = Math.floor(rnd() * NI), j = Math.floor(NP * (0.3 + 0.68 * rnd())), o = 3 * (i * NP + j);
    flour.push({ x: gp[o] + gn[o] * 0.008, y: gp[o + 1] + gn[o + 1] * 0.008, z: gp[o + 2] + gn[o + 2] * 0.008, s: 0.5 + rnd() * 1.1, r: rnd() * 6, f: 0 });
  }
  for (let n = 0; n < NDf; n++) {
    const a = rnd() * TAU, r = 1.1 + rnd() * 0.75;
    flour.push({ x: r * Math.sin(a), y: -0.5 + rnd() * 1.6, z: r * Math.cos(a), s: 0.4 + rnd() * 0.7, r: rnd() * 6, f: 1 });
  }
  const flourMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.014, 0), flourMat, flour.length);
  flourMesh.frustumCulled = false; spin.add(flourMesh);

  // ---------- робочі змінні ----------
  const m4 = new THREE.Matrix4(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), q4 = new THREE.Quaternion(), eul = new THREE.Euler();
  const up = new THREE.Vector3(0, 1, 0), va = new THREE.Vector3(), vb = new THREE.Vector3(), vc = new THREE.Vector3(), d1 = new THREE.Vector3(), d2 = new THREE.Vector3();
  const offs = wedges.map(() => new THREE.Vector3());
  const A = 0.45, thF = A - WA / 2; // фінальний кут шматка, що відʼїжджає (до глядача)
  const PULL = 0.7, SHIFT = 0.35;     // шматок лишається в колі ~2.2
  const tint = [0.6, 0.4, 0.28];      // румʼяні плями (множаться на колір тіста)
  let shown = 0, lastK = -1, lastTop = -1, lastBake = -1, ry = 0, rz = 0, errLogged = false;

  function writeDough() {
    doughs.forEach((g, w) => {
      const Pa = g.attributes.position.array, Na = g.attributes.normal.array;
      for (let i = 0; i <= SEG; i++) {
        const gi = (w * SEG + i) % NI;
        for (let j = 0; j < NP; j++) {
          const o = (i * NP + j) * 3, s = (gi * NP + j) * 3;
          Pa[o] = gp[s]; Pa[o + 1] = gp[s + 1]; Pa[o + 2] = gp[s + 2];
          Na[o] = gn[s]; Na[o + 1] = gn[s + 1]; Na[o + 2] = gn[s + 2];
        }
      }
      g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
    });
  }
  function writeColors(bake) {
    doughs.forEach((g, w) => {
      const Ca = g.attributes.color.array;
      for (let i = 0; i <= SEG; i++) {
        const gi = (w * SEG + i) % NI;
        for (let j = 0; j < NP; j++) {
          const o = (i * NP + j) * 3, sp = spotW[gi * NP + j] * bake;
          Ca[o] = 1 + (tint[0] - 1) * sp; Ca[o + 1] = 1 + (tint[1] - 1) * sp; Ca[o + 2] = 1 + (tint[2] - 1) * sp;
        }
      }
      g.attributes.color.needsUpdate = true;
    });
  }
  const bzc = (tt, out) => out.set(
    (1 - tt) * (1 - tt) * va.x + 2 * (1 - tt) * tt * vc.x + tt * tt * vb.x,
    (1 - tt) * (1 - tt) * va.y + 2 * (1 - tt) * tt * vc.y + tt * tt * vb.y,
    (1 - tt) * (1 - tt) * va.z + 2 * (1 - tt) * tt * vc.z + tt * tt * vb.z);

  function toppings(P) {
    const melt = sm(seg(P, 0.29, 0.45));
    cheeseMat.color.copy(cheeseA).lerp(cheeseB, melt);
    meltMat.color.copy(cheeseMat.color);
    const ms = 0.3 + 0.7 * melt;
    wedges.forEach(wd => {
      wd.melt.visible = melt > 0.004;
      wd.melt.scale.set(ms, 0.4 + 0.6 * melt, ms);

      wd.cheese.forEach((c, i) => {
        const q = seg(P, c.ts, c.ts + 0.05), app = seg(P, c.ts - 0.012, c.ts), m = Math.max(sm(seg(P, c.ts + 0.05, c.ts + 0.12)), melt);
        const sy = 1 - 0.76 * m, sxz = 1 + 1.1 * m, g = q * q, iq = 1 - q, s = c.s * Math.max(1e-4, app);
        pos.set(c.x, c.h * (1 - g) + g * (0.032 + 0.07 * sy * c.s), c.z);
        q4.setFromEuler(eul.set(c.rx * iq, c.yaw + c.ry * iq, c.rz * iq));
        scl.set(sxz * s * c.ax, sy * s, (sxz * s) / c.ax);
        wd.cheeseMesh.setMatrixAt(i, m4.compose(pos, q4, scl));
      });
      wd.cheeseMesh.instanceMatrix.needsUpdate = true;

      wd.salami.forEach((s, i) => {
        const q = seg(P, s.ts, s.ts + 0.06), app = Math.max(1e-4, seg(P, s.ts - 0.012, s.ts)) * s.s;
        const hop = 0.08 * Math.sin(seg(P, s.ts + 0.06, s.ts + 0.09) * PI);
        pos.set(s.x, s.h * (1 - q * q) + q * q * 0.072 + hop, s.z);
        q4.setFromEuler(eul.set((1 - q) * s.flip, s.yaw, (1 - q) * 0.4));
        scl.set(app, app, app);
        wd.salamiMesh.setMatrixAt(i, m4.compose(pos, q4, scl));
      });
      wd.salamiMesh.instanceMatrix.needsUpdate = true;

      wd.basil.forEach((b, i) => {
        const q = seg(P, b.ts, b.ts + 0.1), iq = 1 - q, app = Math.max(1e-4, seg(P, b.ts - 0.012, b.ts)) * b.s;
        const sway = Math.sin(q * PI * 3 + b.ph) * 0.4 * iq;
        pos.set(b.x + sway, b.h * iq + q * 0.11, b.z + sway * 0.5);
        q4.setFromEuler(eul.set(Math.sin(q * 9 + b.ph) * 0.6 * iq, b.yaw + iq * 1.5, Math.cos(q * 7 + b.ph) * 0.7 * iq));
        scl.set(app, app, app);
        wd.basilMesh.setMatrixAt(i, m4.compose(pos, q4, scl));
      });
      wd.basilMesh.instanceMatrix.needsUpdate = true;
    });
  }

  function step({ t = 0, dt = 0, p = 0, mx = 0, my = 0, instant = false }) {
    const pp = cl(+p || 0);
    shown = instant ? pp : shown + (pp - shown) * Math.min(1, dt * 3);
    const P = shown;

    // 1. кулька → корж (з легким «перелітом»)
    const kf = seg(P, 0.02, 0.14), k = back(kf);
    if (Math.abs(k - lastK) > 1e-4) { setProfile(k); buildGrid(k); writeDough(); lastK = k; }
    const bake = sm(seg(P, 0.08, 0.5));
    doughMat.color.copy(raw).lerp(baked, bake);
    if (Math.abs(bake - lastBake) > 0.004 || (bake === 1 && lastBake !== 1)) { writeColors(bake); lastBake = bake; }
    const br = Math.sin(t * 2.2) * 0.035 * (1 - cl(kf * 1.5));

    // тінь: від маленької під кулькою до широкої під коржем
    const kk0 = Math.min(1, k);
    shadow.position.y = -0.97 + 0.84 * kk0;
    shadow.scale.setScalar(1.7 + 2.2 * kk0);
    shadowMat.opacity = 0.34 - 0.1 * kk0;

    // борошно зникає, коли тісто розкатують
    const ds = 1 - sm(seg(P, 0.015, 0.08));
    flourMesh.visible = ds > 0.002;
    if (flourMesh.visible) {
      flour.forEach((d, i) => {
        const s = d.s * ds;
        if (d.f) pos.set(d.x + Math.cos(t * 0.4 + d.r) * 0.06, d.y + Math.sin(t * 0.6 + d.r) * 0.1, d.z + Math.sin(t * 0.5 + d.r) * 0.05);
        else pos.set(d.x, d.y, d.z);
        q4.setFromEuler(eul.set(d.r, d.r * 1.7, 0));
        scl.set(s, s * 0.6, s);
        flourMesh.setMatrixAt(i, m4.compose(pos, q4, scl));
      });
      flourMesh.instanceMatrix.needsUpdate = true;
      flourMesh.scale.set(1 - br * 0.5, 1 + br, 1 - br * 0.5);
    }

    // 2. соус: плаский диск падає й розтікається
    const sq = seg(P, 0.13, 0.19), spread = 0.5 + 0.5 * back(seg(P, 0.19, 0.25));
    // 3–5. сир, салямі, базилік
    if (P !== lastTop) { toppings(P); lastTop = P; }

    // 6. піца докручується так, щоб «наш» шматок дивився на глядача
    const e1 = sm(seg(P, 0.6, 0.74));
    spin.rotation.y = thF + (-2.5 * PI + 0.9 * seg(P, 0, 0.6) + 0.12 * Math.sin(t * 0.5)) * (1 - e1);

    // 7. ролер-ніж проходить 4 діаметри
    const cs = sm(seg(P, 0.735, 0.755)) * (1 - sm(seg(P, 0.865, 0.885)));
    cutter.visible = cs > 0.002;
    if (cutter.visible) {
      const c = seg(P, 0.75, 0.865) * 4, kk = Math.min(3, Math.floor(c)), qq = Math.min(1, c - kk), ak = kk * WA, dir = kk % 2 ? -1 : 1;
      let ang, rad, lift = 0, head = dir > 0 ? ak : ak + PI;
      if (qq < 0.8) {
        ang = ak; rad = dir * (-2.05 + 4.1 * (qq / 0.8));
      } else {
        const w = (qq - 0.8) / 0.2;
        ang = (dir > 0 ? ak : ak + PI) + w * WA; rad = 2.05; lift = 0.25 * Math.sin(w * PI);
        if (kk === 3) lift = 0.6 * w;
        const nh = kk % 2 ? ak + WA : ak + WA + PI;
        head += wrapA(nh - head) * sm(w);
      }
      cutter.position.set(rad * Math.sin(ang), 0.27 + lift + (1 - cs) * 0.8, rad * Math.cos(ang));
      cutter.rotation.y = head;
      roll.rotation.x = (c * 4.1) / 0.3;
      cutter.scale.setScalar(Math.max(1e-4, cs));
    }

    // 8. шматки розходяться, один відʼїжджає
    const e3 = sm(seg(P, 0.86, 0.91)), e4 = sm(seg(P, 0.89, 1));
    wedges.forEach((wd, w) => {
      const o = offs[w], g = 0.06 * e3 + (w === 0 ? PULL * e4 : 0);
      o.set(Math.sin(wd.mid) * g, w === 0 ? 0.2 * Math.sin(e4 * PI) + 0.05 * e4 : 0, Math.cos(wd.mid) * g);
      wd.g.position.copy(o);
      wd.g.scale.set(1 - br * 0.5, 1 + br, 1 - br * 0.5);
      wd.caps[0].visible = wd.caps[1].visible = e3 > 0.001;
      wd.sauce.visible = P > 0.125;
      wd.sauce.position.y = 3.2 * (1 - sq * sq);
      wd.sauce.scale.set(spread, 1, spread);
    });
    shift.position.set(-SHIFT * e4 * Math.sin(A), 0, -SHIFT * e4 * Math.cos(A));

    strands.visible = e4 > 0.01;
    if (strands.visible) {
      strandBase.forEach((sb, si) => {
        va.set(sb.x, 0.06, sb.z).add(offs[sb.nb]);
        vb.set(sb.x, 0.06, sb.z).add(offs[0]);
        const len = va.distanceTo(vb), th = Math.max(0.005, 0.034 * sb.tf * Math.max(0.3, 1 - len / 1.6));
        vc.addVectors(va, vb).multiplyScalar(0.5); vc.y -= sb.sag * len;
        for (let i = 0; i < SS; i++) {
          const t0 = i / SS, t1 = (i + 1) / SS, tm = (t0 + t1) - 1;
          bzc(t0, d1); bzc(t1, d2);
          pos.addVectors(d1, d2).multiplyScalar(0.5);
          d2.sub(d1); const sl = d2.length();
          if (sl > 1e-6) q4.setFromUnitVectors(up, d2.multiplyScalar(1 / sl)); else q4.identity();
          const ts = th * (0.55 + 0.9 * tm * tm);
          scl.set(ts, Math.max(1e-4, sl * 1.1), ts);
          strands.setMatrixAt(si * SS + i, m4.compose(pos, q4, scl));
        }
      });
      strands.instanceMatrix.needsUpdate = true;
    }

    // нахил: більше «зверху» з прокруткою + реакція на курсор
    const f = instant ? 1 : Math.min(1, dt * 4);
    ry += ((+mx || 0) * 0.35 - ry) * f; rz += ((+my || 0) * 0.2 - rz) * f;
    tilt.rotation.x = 0.3 + 0.38 * sm(seg(P, 0.04, 0.24)) + 0.12 * e1 + rz;
    root.rotation.y = ry;
    if (instant) sauceMat.color.copy(sauceTarget); else sauceMat.color.lerp(sauceTarget, 1 - Math.pow(0.02, dt));
  }

  return {
    object: root,
    update(fr) {
      try { step(fr || {}); } catch (e) { if (!errLogged) { errLogged = true; console.error('krugle-tisto-shcho-vid-2: update', e); } }
    },
    setColor(hex) { tuneSauce(hex); },
    dispose() {
      root.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.isInstancedMesh) o.dispose(); });
      capGeos.forEach(g => g.dispose());
      if (shTex) shTex.dispose();
      [doughMat, crumbMat, sauceMat, cheeseMat, meltMat, stringMat, salamiMat, basilMat, flourMat, shadowMat, steelMat, handleMat].forEach(m => m.dispose());
    },
  };
}
