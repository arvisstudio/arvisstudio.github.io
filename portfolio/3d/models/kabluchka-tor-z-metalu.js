// Каблучка з каменем у лапках на подіумі-вітрині. p (0..1): ювелір «переоправляє» камінь — лапки розкриваються,
// камінь злітає, робить сальто й сідає вже іншим: смарагд (східчаста восьмикутна огранка) у жовтому золоті →
// сапфір (овал) у білому → рубін (круглий діамантовий) у рожевому. Ракурс за прокрутку: анфас → профіль → три чверті згори.
export const meta = {
  id: 'kabluchka-tor-z-metalu', name: 'Каблучка з каменем',
  for: 'ювелірний магазин, ювелірна майстерня, весільний салон, ломбард, подарунки, годинники',
  idea: 'Каблучка з огранованим каменем стоїть на темному подіумі під м’яким світлом; на прокрутці лапки розкриваються, камінь злітає, перевертається і сідає назад іншим — смарагд, сапфір, рубін, кожен зі своєю огранкою, а метал стає жовтим, білим, рожевим золотом.',
  colors: ['#0b6b45', '#12308f', '#9e0b2c', '#e8b85a', '#dfe3e8', '#e3a08a'], color: '#0b6b45',
  scale: 0.92,
  bg: '#1a1614',
};

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const gems = [new THREE.Color(color), new THREE.Color('#12308f'), new THREE.Color('#9e0b2c')];
  const metals = [new THREE.Color('#e8b85a'), new THREE.Color('#dfe3e8'), new THREE.Color('#e3a08a')];
  const metalRough = [0.16, 0.07, 0.14], metalEnv = [1.6, 2.6, 1.7];
  const bandW = [1.7, 1.25, 2.05]; // ширина шинки під кожен камінь
  const geos = [], mats = [], texs = [];
  const keep = (g) => (geos.push(g), g);

  const root = new THREE.Group(), spin = new THREE.Group(), ring = new THREE.Group();
  // композиція трохи піднята, щоб подіум не різався низом кадру
  root.add(spin); spin.add(ring); spin.position.y = 0.15;
  const RY = -0.3 + 0.2; // каблучка чесно висить над подіумом (вітринне «левітування»), під нею — тінь
  ring.position.y = RY;

  // ---- подіум: темний камінь, світлова пляма й контактна тінь ----
  const canvasTex = (size, draw) => {
    const c = document.createElement('canvas'); c.width = c.height = size;
    draw(c.getContext('2d'), size);
    const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; texs.push(tx); return tx;
  };
  const radial = (stops) => canvasTex(128, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, s, s);
  });
  const PY = -1.41; // верх подіуму — на 0.2 нижче низу шинки (ring.y −0.1, радіус тора 1.11)
  const podMat = new THREE.MeshStandardMaterial({ color: '#2b2421', roughness: 0.38, metalness: 0.05, envMapIntensity: 0.6 });
  const rimMat = new THREE.MeshStandardMaterial({ color: '#8a6a45', roughness: 0.3, metalness: 1, envMapIntensity: 1.2 });
  mats.push(podMat, rimMat);
  const pod = new THREE.Mesh(keep(new THREE.CylinderGeometry(1.2, 1.24, 0.16, weak ? 40 : 72)), podMat);
  pod.position.y = PY - 0.08;
  const rim = new THREE.Mesh(keep(new THREE.TorusGeometry(1.21, 0.012, 6, weak ? 64 : 120)), rimMat);
  rim.rotation.x = Math.PI / 2; rim.position.y = PY + 0.001;
  const poolMat = new THREE.MeshBasicMaterial({
    map: radial([[0, 'rgba(255,236,210,0.42)'], [0.45, 'rgba(255,226,190,0.16)'], [1, 'rgba(255,220,180,0)']]),
    transparent: true, depthWrite: false,
  });
  const shadowMat = new THREE.MeshBasicMaterial({
    map: radial([[0, 'rgba(8,5,4,0.7)'], [0.45, 'rgba(8,5,4,0.3)'], [1, 'rgba(8,5,4,0)']]),
    transparent: true, depthWrite: false,
  });
  mats.push(poolMat, shadowMat);
  const flat = keep(new THREE.PlaneGeometry(1, 1));
  const pool = new THREE.Mesh(flat, poolMat); pool.rotation.x = -Math.PI / 2; pool.scale.set(2.4, 2.4, 1); pool.position.y = PY + 0.003;
  const shadow = new THREE.Mesh(flat, shadowMat); shadow.rotation.x = -Math.PI / 2; shadow.position.y = PY + 0.006;
  spin.add(pod, rim, pool, shadow);

  // ---- метал ----
  const metal = new THREE.MeshStandardMaterial({ color: metals[0], metalness: 1, roughness: metalRough[0], envMapIntensity: metalEnv[0] });
  mats.push(metal);

  // шинка — тор, розплющений у широкий обідок
  const band = new THREE.Mesh(keep(new THREE.TorusGeometry(1, 0.11, weak ? 14 : 24, weak ? 64 : 120)), metal);
  band.scale.set(1, 1, bandW[0]);
  ring.add(band);

  // галерея під каменем
  const GY = 1.1;
  const gallery = new THREE.Mesh(keep(new THREE.TorusGeometry(0.3, 0.03, 8, weak ? 32 : 48)), metal);
  gallery.rotation.x = Math.PI / 2; gallery.position.y = GY + 0.24;
  const collar = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.16, 0.2, 0.12, weak ? 16 : 24)), metal);
  collar.position.y = GY + 0.02;
  ring.add(gallery, collar);

  // лапки
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, 0, 0), new THREE.Vector3(0.36, 0.22, 0),
    new THREE.Vector3(0.45, 0.45, 0), new THREE.Vector3(0.36, 0.58, 0),
  ]);
  const prongGeo = keep(new THREE.TubeGeometry(curve, weak ? 12 : 20, 0.03, weak ? 5 : 8, false));
  const tipGeo = keep(new THREE.SphereGeometry(0.042, weak ? 8 : 12, weak ? 6 : 10));
  const tipPos = curve.getPoint(1);
  const NP = 6, prongs = [], pivots = [], angs = [];
  for (let i = 0; i < NP; i++) {
    const a = (i / NP) * Math.PI * 2 + Math.PI / NP;
    const pivot = new THREE.Group(); pivot.position.y = GY; pivot.rotation.y = a;
    const arm = new THREE.Group(); arm.position.x = 0.12;
    const tube = new THREE.Mesh(prongGeo, metal); tube.position.x = -0.12;
    const tip = new THREE.Mesh(tipGeo, metal); tip.position.copy(tipPos).x -= 0.12;
    arm.add(tube, tip); pivot.add(arm); ring.add(pivot);
    prongs.push(arm); pivots.push(pivot); angs.push(a);
  }

  // ---- камінь: три огранки ----
  // коштовність, а не скло: майже непрозора, відблиски тоновані кольором каменя
  const gemMat = new THREE.MeshPhysicalMaterial({
    color: gems[0].clone(), metalness: 0.2, roughness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.05,
    flatShading: true, envMapIntensity: 2, transparent: true, opacity: 0.97,
    specularIntensity: 1, specularColor: gems[0].clone(),
    emissive: gems[0].clone(), emissiveIntensity: 0.15,
  });
  // глибина каменя — темне насичене ядро
  const coreMat = new THREE.MeshStandardMaterial({
    color: gems[0].clone().multiplyScalar(0.45), side: THREE.BackSide, metalness: 0.7, roughness: 0.12,
    flatShading: true, envMapIntensity: 1.4, emissive: gems[0].clone().multiplyScalar(0.5), emissiveIntensity: 0.3,
  });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 });
  mats.push(gemMat, coreMat, edgeMat);

  const gemHold = new THREE.Group(); gemHold.position.y = GY + 0.47; ring.add(gemHold);
  const gem = new THREE.Group(); gemHold.add(gem);
  const V = (arr) => arr.map(([r, y]) => new THREE.Vector2(r, y));
  const cutDefs = [
    // смарагд: східчаста восьмикутна, витягнута вздовж пальця, широка площадка
    { prof: V([[0.0001, -0.34], [0.16, -0.27], [0.3, -0.15], [0.41, -0.02], [0.41, 0.03], [0.37, 0.1], [0.31, 0.16], [0.27, 0.19], [0.0001, 0.19]]),
      seg: 8, phi: Math.PI / 8, sx: 1, sz: 1.25, rx: 0.39, rz: 0.49 },
    // сапфір: овал
    { prof: V([[0.0001, -0.44], [0.24, -0.22], [0.42, -0.01], [0.42, 0.03], [0.33, 0.14], [0.22, 0.2], [0.0001, 0.2]]),
      seg: 16, phi: 0, sx: 0.9, sz: 1.3, rx: 0.38, rz: 0.55 },
    // рубін: круглий діамантовий
    { prof: V([[0.0001, -0.46], [0.25, -0.22], [0.43, -0.01], [0.43, 0.03], [0.36, 0.12], [0.23, 0.21], [0.0001, 0.21]]),
      seg: weak ? 16 : 20, phi: 0, sx: 1, sz: 1, rx: 0.43, rz: 0.43 },
  ];
  const cuts = cutDefs.map((d) => {
    const g = keep(new THREE.LatheGeometry(d.prof, d.seg, d.phi).toNonIndexed());
    g.computeVertexNormals();
    const grp = new THREE.Group();
    const core = new THREE.Mesh(g, coreMat); core.scale.setScalar(0.95);
    grp.add(new THREE.Mesh(g, gemMat), core, new THREE.LineSegments(keep(new THREE.EdgesGeometry(g, 1)), edgeMat));
    gem.add(grp); return grp;
  });
  // радіус каменя в напрямку кожної лапки — щоб лапки трималися краю будь-якої огранки
  const reach = cutDefs.map((d) => angs.map((a) => {
    const c = Math.cos(a), s = Math.sin(a);
    return 1 / Math.sqrt((c * c) / (d.rx * d.rx) + (s * s) / (d.rz * d.rz)) / 0.43;
  }));

  // іскри на гранях
  const sparkTex = canvasTex(64, (g, s) => {
    const h = s / 2, gr = g.createRadialGradient(h, h, 0, h, h, h * 0.45);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(h, 2); g.lineTo(h, s - 2); g.moveTo(2, h); g.lineTo(s - 2, h); g.stroke();
  });
  const NS = weak ? 4 : 7, sparks = [];
  for (let i = 0; i < NS; i++) {
    const m = new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
    mats.push(m);
    const sp = new THREE.Sprite(m), a = i * 2.39 + 0.4, r = 0.12 + (i % 3) * 0.1;
    sp.position.set(Math.cos(a) * r, 0.2 - (i % 3) * 0.035, Math.sin(a) * r);
    gem.add(sp); sparks.push(sp);
  }

  // німб за каменем — тепле м'яке світло, не крутиться разом із каблучкою
  const haloMat = new THREE.SpriteMaterial({
    map: radial([[0, 'rgba(255,232,200,0.42)'], [0.35, 'rgba(255,220,180,0.14)'], [1, 'rgba(255,210,170,0)']]),
    transparent: true, depthWrite: false, opacity: 0.6,
  });
  mats.push(haloMat);
  const halo = new THREE.Sprite(haloMat); halo.scale.setScalar(1.35); root.add(halo);

  // світло, що кружляє біля каменю
  const glint = new THREE.PointLight(0xffffff, weak ? 3 : 4, 4, 2);
  ring.add(glint);

  const tmpG = new THREE.Color(), tmpM = new THREE.Color(), tint = new THREE.Color(), v = new THREE.Vector3();
  const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const L = (a, b, k) => a + (b - a) * k;
  let shown = 0;

  return {
    object: root,
    update({ t = 0, dt = 0, p = 0, mx = 0, my = 0, instant = false } = {}) {
      // захист від NaN/undefined: будь-яке погане число → безпечне значення
      const fin = (x, d) => (Number.isFinite(x) ? x : d);
      t = fin(t, 0); dt = Math.max(0, fin(dt, 0)); mx = fin(mx, 0); my = fin(my, 0);
      const pp = Math.max(0, Math.min(1, fin(p, 0)));
      shown = instant ? pp : shown + (pp - shown) * Math.min(1, dt * 3);
      if (!Number.isFinite(shown)) shown = pp;

      // три зупинки: 0 — смарагд, 0.5 — сапфір, 1 — рубін; i — 0 або 1, f — рівно 0..1 (при p=1: i=1, f=1)
      const k = shown * 2, i = k >= 1 ? 1 : 0, f = Math.min(1, k - i);
      const m = f >= 1 ? 1 : sm(0.22, 0.78, f);
      const lift = m >= 1 || m <= 0 ? 0 : Math.sin(m * Math.PI);
      const swap = sm(0.38, 0.62, m);
      const mm = sm(0.15, 0.85, m);

      tmpG.copy(gems[i]).lerp(gems[i + 1], swap);
      tmpM.copy(metals[i]).lerp(metals[i + 1], mm);
      const a = instant ? 1 : 1 - Math.pow(0.001, dt);
      gemMat.color.lerp(tmpG, a); gemMat.emissive.copy(gemMat.color); gemMat.specularColor.copy(gemMat.color);
      coreMat.color.lerp(tint.copy(tmpG).multiplyScalar(0.45), a);
      coreMat.emissive.copy(coreMat.color);
      metal.color.lerp(tmpM, a);
      metal.roughness = L(metalRough[i], metalRough[i + 1], mm);
      metal.envMapIntensity = L(metalEnv[i], metalEnv[i + 1], mm);
      band.scale.z = L(bandW[i], bandW[i + 1], mm);

      // огранка змінюється, поки камінь у повітрі
      for (let j = 0; j < 3; j++) {
        const w = j === i ? 1 - swap : j === i + 1 ? swap : 0;
        const c = cuts[j], d = cutDefs[j];
        c.visible = w > 0.01;
        const ws = Math.max(w, 0.001); // не нульовий масштаб — без виродженої матриці нормалей
        c.scale.set(d.sx * ws, ws, d.sz * ws);
      }
      const dA = cutDefs[i], dB = cutDefs[i + 1];
      gallery.scale.set(L(dA.rx, dB.rx, swap) / 0.43, L(dA.rz, dB.rz, swap) / 0.43, 1);

      // лапки розкриваються, як пелюстки, і підлаштовуються під край каменю
      const open = lift * 0.75;
      for (let j = 0; j < NP; j++) {
        prongs[j].rotation.z = -open * (0.9 + 0.2 * (j % 2));
        pivots[j].scale.x = L(reach[i][j], reach[i + 1][j], swap);
      }

      // камінь злітає й робить сальто; у посадці — стоїть рівно в лапках
      gemHold.position.y = GY + 0.47 + lift * 0.5 + Math.sin(t * 1.4) * 0.01 * lift;
      gem.rotation.x = m * Math.PI * 2;
      gem.rotation.y = m * Math.PI * 2;
      cuts.forEach((c) => { c.children[1].rotation.y = Math.sin(t * 0.6) * 0.25; });

      // іскри спалахують по черзі
      for (let j = 0; j < NS; j++) {
        const s = Math.max(0, Math.sin(t * 1.9 + j * 1.7));
        const q = s * s * s * s * s * s;
        sparks[j].material.opacity = q * 0.95;
        sparks[j].scale.setScalar(0.06 + q * 0.16);
      }

      // ракурс: анфас згори → профіль → три чверті з видом на камінь згори
      spin.rotation.y = shown * Math.PI * 1.25 + Math.sin(t * 0.4) * 0.12 + mx * 0.45;
      spin.rotation.x = 0.3 + shown * 0.35 + my * 0.2;
      spin.rotation.z = -mx * 0.1;

      // каблучка ширяє над подіумом; тінь під нею м'якшає й ширшає, коли вона вище
      const bob = Math.sin(t * 1.1) * 0.03;
      ring.position.y = RY + bob;
      const gap = 0.2 + bob, sc = 1 + gap * 0.8;
      shadow.scale.set(0.75 * sc, 0.32 * band.scale.z * sc, 1);
      shadowMat.opacity = Math.max(0.3, 1.05 - gap * 1.6);

      // німб позаду каменя
      gemHold.getWorldPosition(v); root.worldToLocal(v);
      halo.position.set(v.x, v.y, v.z - 1);
      haloMat.opacity = 0.55 + lift * 0.25;

      const ga = t * 1.3;
      glint.position.set(Math.cos(ga) * 1.1, gemHold.position.y + 0.6, Math.sin(ga) * 1.1);
      glint.intensity = (weak ? 3 : 4) * (1 + lift * 0.8);
    },
    setColor(hex) { gems[0].set(hex); },
    dispose() {
      geos.forEach(g => g.dispose()); mats.forEach(x => x.dispose()); texs.forEach(x => x.dispose());
      glint.dispose && glint.dispose();
    },
  };
}
