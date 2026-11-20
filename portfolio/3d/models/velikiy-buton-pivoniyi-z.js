// Півонія: тугий бутон у бірюзових чашолистках. p (0..1): чашолистки відгинаються, пелюстки по черзі
// розкриваються ззовні всередину в пишну кулясту головку, квітка нахиляється — видно золоту серцевину;
// наприкінці дві пелюстки обриваються й легко летять убік і вниз, зменшуючись і тануючи.
export const meta = {
  id: 'velikiy-buton-pivoniyi-z', name: 'Бутон півонії',
  for: 'квітковий магазин, весільна студія, салон краси, косметика, кондитерська',
  idea: 'Тугий бутон у бірюзових листках: поки гортаєш, пелюстки одна за одною відкриваються назовні, квітка нахиляється до глядача й показує золоту серцевину, а дві крайні пелюстки зриваються й плавно летять униз.',
  colors: ['#f07a7f', '#f7a99b', '#2fb5a6', '#f2c14e'], color: '#f07a7f',
  bg: '#f5ede6',
};

const clamp = (x) => Math.max(0, Math.min(1, x));
const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

// Вигнута площина: пелюстка (округла, з хвилястим краєм) або листок (загострений, складений по жилці)
// ruffle0 — хвилястість закритого стану; повна ruffle іде морф-ціллю (вмикається при розкритті)
function bladeGeo(THREE, { len, wid, cup = 0.25, cross = 0.9, fold = 0, ruffle = 0, ruffle0 = ruffle, seed = 0, seg = 16, wseg = 0, pointed = false, lo = 0.7, hi = 1, vein = 0 }) {
  const g = new THREE.PlaneGeometry(1, 1, wseg || Math.max(8, Math.round(seg * 0.9)), seg);
  const P = g.attributes.position;
  const col = new Float32Array(P.count * 3);
  const opened = new Float32Array(P.count * 3);
  for (let i = 0; i < P.count; i++) {
    const u = P.getX(i) * 2, v = P.getY(i) + 0.5;
    const w = pointed
      ? Math.pow(Math.sin(Math.PI * v), 0.7) * (1 - 0.25 * v)
      : Math.pow(Math.sin(Math.PI * (0.06 + 0.86 * v)), 0.5) * (0.6 + 0.4 * v);
    const X = u * wid * 0.5 * w;
    // ледь помітна неправильна нерівність краю (не зубці)
    const nick = pointed ? 0 : 0.012 * (1 + Math.sin(u * 11.3 + seed) * Math.sin(u * 7.1 + seed * 1.7)) * v ** 5;
    const Y = v * len * (1 - nick);
    let Z = -cup * len * v * v - cross * X * X / wid - fold * Math.abs(X);
    // хвилястість краю — через згин по Z, дві частоти, щоб не було регулярно
    const wave = Math.sin(u * 6.3 + seed) * 0.8 + Math.sin(u * 11.1 + seed * 2.3) * 0.2;
    const rz = len * wave * v ** 3 * (0.35 + 0.65 * Math.abs(u) ** 0.6);
    P.setXYZ(i, X, Y, Z + ruffle0 * rz);
    opened.set([X, Y, Z + ruffle * rz], i * 3);
    let c = lo + (hi - lo) * smooth(v * 1.3);
    if (vein) c *= 1 - vein * Math.exp(-(u * u) / 0.006) * (1 - 0.6 * v); // темніша центральна жилка
    col.set([c, c, c], i * 3);
  }
  g.computeVertexNormals();
  if (ruffle !== ruffle0) {
    const base = P.array.slice(), nBase = g.attributes.normal.array.slice();
    P.array.set(opened); g.computeVertexNormals();
    const nOpen = g.attributes.normal.array.slice();
    P.array.set(base); g.attributes.normal.array.set(nBase);
    g.morphAttributes.position = [new THREE.BufferAttribute(opened, 3)];
    g.morphAttributes.normal = [new THREE.BufferAttribute(nOpen, 3)];
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const seg = weak ? 10 : 16;
  const root = new THREE.Group();
  const plant = new THREE.Group(); plant.position.y = -1.7; root.add(plant); // погойдування — від основи стебла
  const head = new THREE.Group(); head.position.y = 2.05; plant.add(head);

  const petalMat = new THREE.MeshPhysicalMaterial({ color, vertexColors: true, side: THREE.DoubleSide, roughness: 0.62, sheen: 1, sheenRoughness: 0.35, sheenColor: new THREE.Color('#fff1ea') });
  const fallMat = petalMat.clone(); fallMat.transparent = true; // для зірваних пелюсток — тануть під кінець
  // матовий лист: обидві сторони однаково темні, без білих відблисків
  const leafMat = new THREE.MeshStandardMaterial({ color: '#2fb5a6', vertexColors: true, side: THREE.DoubleSide, roughness: 0.72, envMapIntensity: 0.6 });
  const stemMat = new THREE.MeshStandardMaterial({ color: '#1f8c80', roughness: 0.55 });
  const goldMat = new THREE.MeshStandardMaterial({ color: '#f2c14e', roughness: 0.4, metalness: 0.15 });
  const creamMat = new THREE.MeshStandardMaterial({ color: '#f3d98e', roughness: 0.6 });
  const carpelMat = new THREE.MeshStandardMaterial({ color: '#c6dd98', roughness: 0.5 });
  const mats = [petalMat, fallMat, leafMat, stemMat, goldMat, creamMat, carpelMat];

  // Стебло
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.08, 0.7, 0.04), new THREE.Vector3(-0.03, 1.4, 0), new THREE.Vector3(0, 2.0, 0)]);
  plant.add(new THREE.Mesh(new THREE.TubeGeometry(curve, weak ? 12 : 24, 0.05, weak ? 6 : 10), stemMat));
  const recep = new THREE.Mesh(new THREE.SphereGeometry(0.3, weak ? 12 : 20, weak ? 8 : 12), stemMat);
  recep.scale.set(1, 0.55, 1); recep.position.y = -0.06; head.add(recep);

  // Листки на стеблі
  const leafGeo = bladeGeo(THREE, { len: 1.1, wid: 0.42, cup: -0.2, cross: 0.3, fold: 0.22, seg, pointed: true, lo: 0.68, hi: 0.82, vein: 0.2 });
  const leaves = [];
  [[0.8, 0.3, 1], [0.55, 3.5, -1]].forEach(([y, ang, s]) => {
    // точка кріплення — на самому стеблі (воно вигнуте), листок починається зовні від нього
    const piv = new THREE.Group(); piv.position.copy(curve.getPoint(y / 2)); piv.rotation.y = ang;
    const hinge = new THREE.Group(); hinge.position.z = 0.08; piv.add(hinge);
    hinge.add(new THREE.Mesh(leafGeo, leafMat));
    plant.add(piv); leaves.push({ hinge, s, ph: ang });
  });

  // Чашолистки: обіймають бутон, потім відгинаються вниз
  // довгі (len 1.0): у закритому стані охоплюють нижню третину бутона, лежачи зовні пелюсток
  const sepGeo = bladeGeo(THREE, { len: 1.0, wid: 0.56, cup: 0.28, cross: 0.6, fold: 0.08, seg, pointed: true, lo: 0.68, hi: 0.84, vein: 0.18 });
  const sepals = [];
  for (let i = 0; i < 5; i++) {
    const piv = new THREE.Group(); piv.rotation.y = i / 5 * Math.PI * 2 + 0.3;
    const hinge = new THREE.Group(); hinge.position.set(0, -0.1, 0.36); piv.add(hinge);
    hinge.add(new THREE.Mesh(sepGeo, leafMat));
    head.add(piv); sepals.push({ hinge, ph: i * 1.7 });
  }

  // Пелюстки: 5 кіл. Зовнішні ширші й відкриті, внутрішні — дрібніші, дуже чашоподібні й майже стоять:
  // разом вони дають пишну кулясту головку. step — взаємно простий з n, щоб розкривалися вроздріб.
  // c0 — масштаб у закритому бутоні (внутрішні кола сховані всередині), rot0 — нахил у закритому стані,
  // yaw — поворот навколо власної осі в бутоні: пелюстки лягають черепицею, а не протикають одна одну.
  const rings = [
    { n: 6, step: 1, r: 0.32, len: 1.25, wid: 1.2, open: 1.35, cup: 0.4, ruf: 0.07, flat: 0.15, tint: 1.0, c0: 1, rot0: 0.2, yaw: 0.32 },
    { n: 8, step: 3, r: 0.29, len: 1.1, wid: 1.05, open: 1.15, cup: 0.48, ruf: 0.08, flat: 0.12, tint: 0.97, c0: 0.8, rot0: 0.2, yaw: 0.28 },
    { n: 10, step: 3, r: 0.26, len: 0.96, wid: 0.92, open: 1.05, cup: 0.55, ruf: 0.09, flat: 0.15, tint: 0.93, c0: 0.55, rot0: 0.1, yaw: 0.2 },
    { n: 12, step: 5, r: 0.23, len: 0.8, wid: 0.78, open: 0.95, cup: 0.62, ruf: 0.1, flat: 0.3, tint: 0.89, c0: 0.5, rot0: 0.1, yaw: 0.15 },
    { n: weak ? 10 : 13, step: 3, r: 0.2, len: 0.64, wid: 0.62, open: 0.9, cup: 0.7, ruf: 0.11, flat: 0.35, tint: 0.85, c0: 0.45, rot0: 0.08, yaw: 0.1 },
  ];
  const wseg = Math.round(seg * 1.3); // більше сегментів по ширині — округлий край без зламів
  const petals = [];
  let order = 0;
  rings.forEach((rg, ri) => {
    const geos = [0, 1].map((k) => bladeGeo(THREE, { len: rg.len, wid: rg.wid, cup: rg.cup, cross: 0.85, ruffle: rg.ruf, ruffle0: rg.ruf * 0.15, seed: ri * 2.1 + k * 3.7, seg, wseg, lo: 0.68 * rg.tint, hi: rg.tint }));
    for (let j = 0; j < rg.n; j++) {
      const i = (j * rg.step) % rg.n;
      const piv = new THREE.Group(); piv.rotation.y = (i / rg.n) * Math.PI * 2 + ri * 0.45;
      const hinge = new THREE.Group(); hinge.position.set(0, ri * 0.018, rg.r); piv.add(hinge);
      const m = new THREE.Mesh(geos[i % 2], petalMat);
      const sc = 0.92 + 0.16 * Math.abs(Math.sin(i * 12.9898 + ri * 78.2));
      m.scale.setScalar(sc);
      hinge.add(m); head.add(piv);
      petals.push({ hinge, m, sc, rg, r: rg.r, y: ri * 0.018, order: order++, ph: i * 2.3 + ri, twist: (Math.sin(i * 4.1 + ri) * 0.12), fall: 0, morph: !!m.morphTargetInfluences });
    }
  });
  const N = petals.length;
  // зриваються дві зовнішні пелюстки, що дивляться вбік (≈120° і ≈300°), а не на камеру
  petals[2].fall = 1; petals[5].fall = -1;
  petals[2].m.material = fallMat; petals[5].m.material = fallMat;

  // Серцевина: щільна золота подушка з тичинок (InstancedMesh) і маточки
  const S = weak ? 200 : 380;
  const filGeo = new THREE.CylinderGeometry(0.008, 0.013, 1, 4, 1); filGeo.translate(0, 0.5, 0);
  const antGeo = new THREE.SphereGeometry(0.04, 6, 5); antGeo.scale(0.9, 1.45, 0.9);
  const fil = new THREE.InstancedMesh(filGeo, creamMat, S), ant = new THREE.InstancedMesh(antGeo, goldMat, S);
  head.add(fil, ant);
  // золота основа під тичинками — щоб центр не просвічував
  const pad = new THREE.Mesh(new THREE.SphereGeometry(0.24, weak ? 14 : 22, weak ? 6 : 10, 0, Math.PI * 2, 0, Math.PI / 2), creamMat);
  pad.scale.set(1, 0.35, 1); head.add(pad);
  const sAng = new Float32Array(S), sR = new Float32Array(S), sL = new Float32Array(S);
  for (let i = 0; i < S; i++) {
    const f = (i + 0.5) / S;
    sAng[i] = i * 2.39996; sR[i] = 0.06 + 0.18 * Math.sqrt(f);
    sL[i] = 0.2 + 0.12 * Math.abs(Math.sin(i * 7.31));
  }
  const carpels = [];
  const carpGeo = new THREE.SphereGeometry(0.06, 10, 8);
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Mesh(carpGeo, carpelMat);
    c.scale.set(1, 1.6, 1); head.add(c); carpels.push({ c, a: i / 4 * Math.PI * 2 });
  }

  const q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
  const pos = new THREE.Vector3(), scl = new THREE.Vector3(), m4 = new THREE.Matrix4();
  let lastReveal = -1;
  function core(reveal) {
    if (Math.abs(reveal - lastReveal) < 1e-4) return;
    lastReveal = reveal;
    for (let i = 0; i < S; i++) {
      const tilt = 0.08 + (0.15 + 0.6 * (sR[i] - 0.06) / 0.18) * reveal, a = sAng[i];
      dir.set(Math.sin(tilt) * Math.cos(a), Math.cos(tilt), Math.sin(tilt) * Math.sin(a));
      q.setFromUnitVectors(up, dir);
      const L = sL[i] * (0.25 + 0.75 * reveal);
      pos.set(Math.cos(a) * sR[i], 0.03 + 0.06 * reveal, Math.sin(a) * sR[i]);
      scl.set(1, L, 1); m4.compose(pos, q, scl); fil.setMatrixAt(i, m4);
      const k = 0.5 + 0.5 * reveal; // пиляки «набухають» при розкритті
      pos.addScaledVector(dir, L); scl.set(k, k, k); m4.compose(pos, q, scl); ant.setMatrixAt(i, m4);
    }
    fil.instanceMatrix.needsUpdate = true; ant.instanceMatrix.needsUpdate = true;
    pad.position.y = 0.0 + 0.07 * reveal;
    carpels.forEach(({ c, a }) => {
      const k = 0.15 + 0.35 * reveal;
      c.position.set(Math.cos(a) * 0.05, 0.1 + 0.1 * reveal, Math.sin(a) * 0.05);
      c.rotation.set(Math.sin(a) * k, 0, -Math.cos(a) * k);
      c.visible = reveal > 0.02;
    });
  }

  const want = new THREE.Color(color);
  let shown = 0;
  return {
    object: root,
    update({ t, dt, p, mx, my, instant }) {
      const pp = clamp(p);
      shown = instant ? pp : shown + (pp - shown) * Math.min(1, dt * 3);
      const sepOpen = smooth(shown / 0.22);
      const openP = clamp((shown - 0.08) / 0.72); // усі кола розкриті вже до p≈0.8
      const reveal = smooth((shown - 0.3) / 0.5);
      const d = smooth((shown - 0.8) / 0.2); // відліт двох пелюсток

      sepals.forEach(({ hinge, ph }) => {
        hinge.rotation.x = 0.25 + 1.7 * sepOpen + Math.sin(t * 1.1 + ph) * 0.02;
      });
      leaves.forEach(({ hinge, s, ph }) => {
        hinge.rotation.x = 0.75 + 0.35 * shown + Math.sin(t * 0.9 + ph) * 0.04;
        hinge.rotation.z = s * 0.15;
      });

      for (let k = 0; k < N; k++) {
        const pt = petals[k], rg = pt.rg;
        const start = (pt.order / (N - 1)) * 0.62;
        const e = smooth((openP - start) / 0.38);
        const fl = Math.sin(t * 1.6 + pt.ph) * 0.025 * (0.3 + e);
        pt.hinge.rotation.x = rg.rot0 + (rg.open - rg.rot0) * e + fl;
        pt.hinge.rotation.y = rg.yaw * (1 - e);
        pt.hinge.rotation.z = pt.twist * e;
        if (pt.morph) pt.m.morphTargetInfluences[0] = e; // хвилястий край — тільки в розкритої пелюстки
        // закритий бутон: внутрішні кола менші й сховані, розмір вирівнюється при розкритті
        let s = (1 + (pt.sc - 1) * (0.3 + 0.7 * e)) * (rg.c0 + (1 - rg.c0) * e);
        if (pt.fall) {
          // легка пелюстка: трохи назовні, вбік і вниз, у межах кадру; менша й прозоріша під кінець
          const sway = Math.sin(t * 1.2 + pt.ph) * 0.12 * d;
          pt.hinge.position.set((0.35 * pt.fall + sway) * d, pt.y - 0.85 * d, pt.r + 0.4 * d);
          pt.hinge.rotation.x += d * 0.9;
          pt.hinge.rotation.z += d * 0.8 * pt.fall + Math.sin(t * 1.3 + pt.ph) * 0.15 * d;
          s *= 1 - 0.45 * d;
        }
        pt.m.scale.set(s, s, s * (1 - rg.flat * e)); // трохи розпрямляються, але лишаються м'якими чашами
      }
      fallMat.opacity = 1 - 0.5 * d;
      fallMat.depthWrite = d < 0.05;
      core(reveal);
      pad.visible = reveal > 0.02;

      // легке погойдування від основи стебла + курсор
      plant.rotation.z = Math.sin(t * 0.7) * 0.045 + mx * 0.18;
      plant.rotation.x = Math.sin(t * 0.53 + 1) * 0.03;
      head.rotation.y += dt * 0.07;
      // квітка нахиляється до глядача, показуючи серцевину
      // повний нахил уже до p≈0.7, щоб серцевину було видно ще до відльоту пелюсток
      root.rotation.x = 0.12 + 0.85 * smooth(shown / 0.7) + my * 0.15;
      root.position.y = -0.25 * smooth(shown);
      petalMat.color.lerp(want, instant ? 1 : 1 - Math.pow(0.02, dt));
      fallMat.color.copy(petalMat.color);
    },
    setColor(hex) { want.set(hex); },
    dispose() {
      const seen = new Set();
      root.traverse((o) => { if (o.geometry && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); } });
      mats.forEach((m) => m.dispose());
    },
  };
}
