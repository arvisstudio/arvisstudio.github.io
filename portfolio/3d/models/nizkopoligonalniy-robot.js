// Низькополігональний робот-кубик на острівці 6×6. p (0..1): робот проходить маршрут —
// кроки, поворот, стрибок на сходинку, збирає монети-кільця, піднімає прапорець і робить святковий стрибок-пірует.
// Клітинки, якими він пройшов, світлішають — маршрут «малюється» на острівці.
export const meta = {
  id: 'nizkopoligonalniy-robot', name: 'Робот на острівці', for: 'IT-школа, дитячий центр, ігрова студія, робототехніка, онлайн-курси, застосунки',
  idea: 'Бірюзовий робот-кубик крокує острівцем із коралових клітинок: повертає, стрибає на сходинку, збирає монети й піднімає прапорець на фініші. Пройдений шлях світлішає.',
  colors: ['#2ec4b6', '#ffc53d', '#ff7f6b'], color: '#2ec4b6', scale: 0.9, bg: '#132a33',
};

export function create(THREE, { weak = false, color = meta.color, scene = null, bg = meta.bg } = {}) {
  const C = 0.5, H = 0.22, N = 6, PI = Math.PI, R = 1.4; // R — масштаб робота
  // рівні клітинок: сходинка (1) і вершина з прапорцем (2)
  const lvl = (i, j) => (i === 5 && j <= 1) ? 2 : (i >= 2 && j <= 1) ? 1 : 0;
  const cx = i => (i - 2.5) * C, cz = j => (j - 2.5) * C;
  const clamp = x => Math.max(0, Math.min(1, x));
  const sm = x => { x = clamp(x); return x * x * (3 - 2 * x); };

  const root = new THREE.Group(), tilt = new THREE.Group(), spin = new THREE.Group();
  root.add(tilt); tilt.add(spin); root.position.y = 0.3; // скеля довга — центруємо силует

  // матеріали
  const teal = new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.15, flatShading: true });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1d2b36, roughness: 0.3, metalness: 0.2, flatShading: true });
  const screen = new THREE.MeshStandardMaterial({ color: 0xc9fbf2, emissive: 0x4fd6c4, emissiveIntensity: 0.55, roughness: 0.25 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc53d, roughness: 0.28, metalness: 0.65, flatShading: true });
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xffc53d, roughness: 0.55, flatShading: true, side: THREE.DoubleSide });
  const pale = new THREE.MeshStandardMaterial({ color: 0xece6dc, roughness: 0.5, flatShading: true });
  const tile = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.62, flatShading: true });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x9a6a52, roughness: 0.85, flatShading: true });
  const earthMat = new THREE.MeshStandardMaterial({ color: 0xc08a62, roughness: 0.8, flatShading: true });
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x2a1512, transparent: true, opacity: 0.22, depthWrite: false });
  const mats = [teal, dark, screen, gold, flagMat, pale, tile, rockMat, earthMat, shadowMat];

  // --- острівець: стовпчики клітинок (верх — кораловий, низ темніший)
  const cellGeo = new THREE.BoxGeometry(C * 0.94, 1, C * 0.94);
  cellGeo.translate(0, -0.5, 0);
  const cp = cellGeo.attributes.position, cols = new Float32Array(cp.count * 3);
  for (let i = 0; i < cp.count; i++) { const v = cp.getY(i) > -0.01 ? 1 : 0.42; cols.set([v, v, v], i * 3); }
  cellGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const cells = new THREE.InstancedMesh(cellGeo, tile, N * N);
  cells.frustumCulled = false; // межі інстансів змінюються — не відсікаємо
  const baseCol = [], visitCol = new THREE.Color(0xffe6a8), tmpC = new THREE.Color();
  const tiles = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = tiles.length;
    baseCol.push(new THREE.Color((i + j) % 2 ? 0xff8a72 : 0xd9503f));
    cells.setColorAt(k, baseCol[k]);
    tiles.push({ i, j, l: lvl(i, j), uv: 2, dip: 0 });
  }
  spin.add(cells);

  // скеля знизу: шар землі під плитками + низькополігональний конус із «нерівностями»
  const cap = new THREE.CylinderGeometry(2.0, 1.85, 0.32, 8, 1); cap.rotateY(PI / 8);
  cap.translate(0, -0.36 - 0.16, 0);
  spin.add(new THREE.Mesh(cap, earthMat));
  const RH = 1.9;
  const rock = new THREE.ConeGeometry(1.85, RH, 8, 3); rock.rotateX(PI); rock.rotateY(PI / 8);
  const rp = rock.attributes.position;
  for (let i = 0; i < rp.count; i++) {
    const x = rp.getX(i), y = rp.getY(i), z = rp.getZ(i);
    const h = Math.sin(x * 12.9 + y * 78.2 + z * 37.7) * 43758.5, r = h - Math.floor(h);
    const top = y > RH / 2 - 0.01, mid = !top && y > -RH / 2 + 0.01;
    const s = top ? 1 : 0.8 + r * 0.4;
    rp.setXYZ(i, x * s, y + (mid ? (r - 0.5) * 0.25 : 0), z * s);
  }
  rock.translate(0, -0.68 - RH / 2, 0);
  spin.add(new THREE.Mesh(rock, rockMat));

  // --- робот (дивиться вздовж +z)
  const robot = new THREE.Group(), body = new THREE.Group();
  robot.add(body);
  const hip = 0.12, hy = hip + 0.2;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.38), teal); head.position.y = hy;
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.24, 0.02), dark); face.position.set(0, hy + 0.02, 0.195);
  const eyes = new THREE.Group(); eyes.position.set(0, hy + 0.04, 0.208);
  const eyeGeo = new THREE.BoxGeometry(0.07, 0.09, 0.012);
  const eyeL = new THREE.Mesh(eyeGeo, screen), eyeR = new THREE.Mesh(eyeGeo, screen);
  eyeL.position.x = -0.075; eyeR.position.x = 0.075; eyes.add(eyeL, eyeR);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.012), screen); mouth.position.set(0, hy - 0.055, 0.208);
  const earGeo = new THREE.BoxGeometry(0.04, 0.12, 0.12);
  const earL = new THREE.Mesh(earGeo, dark), earR = new THREE.Mesh(earGeo, dark);
  earL.position.set(-0.23, hy + 0.02, 0); earR.position.set(0.23, hy + 0.02, 0);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 5), dark); stick.position.y = hy + 0.25;
  const ballMat = new THREE.MeshStandardMaterial({ color: 0x8a9399, roughness: 0.3, metalness: 0.5, flatShading: true }); mats.push(ballMat);
  const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0), ballMat); ball.position.y = hy + 0.33;
  body.add(head, face, eyes, mouth, earL, earR, stick, ball);
  // ноги й ручки на шарнірах
  const legGeo = new THREE.BoxGeometry(0.08, 0.09, 0.08); legGeo.translate(0, -0.045, 0);
  const footGeo = new THREE.BoxGeometry(0.11, 0.035, 0.14); footGeo.translate(0, -0.1, 0.02);
  const armGeo = new THREE.BoxGeometry(0.05, 0.13, 0.05); armGeo.translate(0, -0.065, 0);
  const legs = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * 0.1, hip, 0);
    g.add(new THREE.Mesh(legGeo, dark), new THREE.Mesh(footGeo, teal)); robot.add(g); return g;
  });
  const arms = [-1, 1].map(s => {
    const g = new THREE.Group(); g.position.set(s * 0.245, hy - 0.06, 0);
    g.add(new THREE.Mesh(armGeo, dark)); body.add(g); return g;
  });
  robot.scale.setScalar(R); spin.add(robot);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), shadowMat); shadow.rotation.x = -PI / 2;
  spin.add(shadow);

  // --- прапорець на вершині (5,0)
  const flagT = { x: cx(5) + 0.08, y: 2 * H, z: cz(0) - 0.08 };
  const flag = new THREE.Group(); flag.position.set(flagT.x, flagT.y, flagT.z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.9, 6), pale); pole.position.y = 0.45;
  const knob = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), gold); knob.position.y = 0.91;
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 6), dark); foot.position.y = 0.025;
  const clothGeo = new THREE.PlaneGeometry(0.34, 0.22, weak ? 5 : 8, 3); clothGeo.translate(0.17, 0, 0);
  const cloth = new THREE.Mesh(clothGeo, flagMat); cloth.frustumCulled = false;
  const clothBase = clothGeo.attributes.position.array.slice();
  flag.add(pole, knob, foot, cloth); spin.add(flag);

  // --- маршрут: сегменти з тривалістю
  const segs = []; let total = 0;
  let cur = { x: cx(0), y: 0, z: cz(4), yaw: PI / 2 };
  const add = (t, d, b) => { const s = { t, d, t0: total, a: { ...cur }, b: { ...cur, ...b } }; segs.push(s); total += d; cur = s.b; return s; };
  const at = (i, j) => ({ x: cx(i), y: lvl(i, j) * H, z: cz(j) });
  add('walk', 3, at(3, 4));
  add('turn', 0.8, { yaw: PI });
  add('walk', 2, at(3, 2));
  add('jump', 1.4, at(3, 1));
  add('turn', 0.8, { yaw: PI / 2 });
  add('walk', 1, at(4, 1));
  add('jump', 1.4, at(5, 1));
  add('turn', 0.8, { yaw: PI });
  const raiseSeg = add('raise', 1.4, {});
  add('hop', 1.4, {});

  const st = { x: 0, y: 0, z: 0, yaw: 0, swing: 0, arm: 0, tuck: 0, sq: 1, air: 0, bob: 0 };
  function pose(u) {
    const T = clamp(u) * total;
    let s = segs[segs.length - 1], k = 1;
    for (let n = 0; n < segs.length; n++) { const g = segs[n]; if (T <= g.t0 + g.d) { s = g; k = clamp((T - g.t0) / g.d); break; } }
    const a = s.a, b = s.b;
    st.x = a.x; st.y = a.y; st.z = a.z; st.yaw = a.yaw;
    st.swing = 0; st.arm = 0; st.tuck = 0; st.sq = 1; st.air = 0; st.bob = 0; st.alt = 0;
    if (s.t === 'walk') {
      st.x = a.x + (b.x - a.x) * k; st.z = a.z + (b.z - a.z) * k;
      const ph = Math.sin(k * s.d * 2 * PI);
      st.swing = ph * 0.6; st.arm = -ph * 0.7; st.bob = Math.abs(ph) * 0.03; st.alt = 1;
    } else if (s.t === 'turn') {
      st.yaw = a.yaw + (b.yaw - a.yaw) * sm(k);
      const ph = Math.sin(k * 2 * PI); st.swing = ph * 0.3; st.bob = Math.abs(ph) * 0.02;
    } else if (s.t === 'jump' || s.t === 'hop') {
      const hgt = s.t === 'hop' ? 0.38 : 0.42;
      if (k < 0.22) { const c = k / 0.22; st.sq = 1 - 0.2 * sm(c); st.arm = 0.6 * c; }
      else if (k < 0.82) {
        const e = (k - 0.22) / 0.6, arc = Math.sin(PI * e);
        st.x = a.x + (b.x - a.x) * e; st.z = a.z + (b.z - a.z) * e;
        st.y = a.y + (b.y - a.y) * e + arc * hgt;
        st.sq = 1 + 0.1 * arc; st.air = 1; st.tuck = arc; st.arm = -2.4 * arc;
        if (s.t === 'hop') st.yaw = a.yaw + 2 * PI * sm(e); // піруєт на фініші
      } else { const c = (k - 0.82) / 0.18; st.x = b.x; st.y = b.y; st.z = b.z; st.sq = 1 - 0.18 * Math.sin(c * PI); }
    }
    return st;
  }

  // коли робот уперше стає на клітинку і проходить біля монети — рахуємо заздалегідь
  const coinCells = [[2, 4], [3, 3], [3, 1]];
  const coinGeo = new THREE.TorusGeometry(0.13, 0.042, 5, 12);
  const coins = coinCells.map(([i, j], n) => {
    const m = new THREE.Mesh(coinGeo, gold); spin.add(m);
    return { m, x: cx(i), z: cz(j), y: lvl(i, j) * H + 0.5, uc: 2, n };
  });
  for (let q = 0; q <= 800; q++) {
    const u = q / 800; pose(u);
    if (!st.air) {
      const ti = Math.round(st.x / C + 2.5), tj = Math.round(st.z / C + 2.5), td = tiles[tj * N + ti];
      if (td && td.uv > 1) td.uv = u;
    }
    coins.forEach(c => { if (c.uc > 1 && Math.hypot(st.x - c.x, st.z - c.z) < 0.12) c.uc = u; });
  }

  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();
  const want = new THREE.Color(color), grey = new THREE.Color(0x8a9399), yel = new THREE.Color(0xffc53d);
  let shown = 0, mxs = 0, mys = 0;

  // сцена задумана на темному тлі: ставимо фон самі (сайт може вимкнути: bg: null)
  const oldBg = scene ? scene.background : null;
  if (scene && bg) scene.background = new THREE.Color(bg);

  function step(f = {}) {
      // захист від undefined/NaN: інакше NaN в обертанні ховає всю сцену
      const num = (v, d) => (typeof v === 'number' && isFinite(v) ? v : d);
      const instant = !!f.instant, t = num(f.t, 0);
      const dt = Math.min(0.1, Math.max(0, num(f.dt, 0.016)));
      const mx = num(f.mx, 0), my = num(f.my, 0);
      const pp = clamp(num(f.p, 0));
      if (!isFinite(shown)) shown = pp;
      if (!isFinite(mxs) || !isFinite(mys)) mxs = mys = 0;
      shown = instant ? pp : shown + (pp - shown) * Math.min(1, dt * 3);
      mxs = instant ? mx : mxs + (mx - mxs) * Math.min(1, dt * 4);
      mys = instant ? my : mys + (my - mys) * Math.min(1, dt * 4);
      const u = clamp((shown - 0.04) / 0.9);
      pose(u);

      // острівець повільно обертається разом із маршрутом
      tilt.rotation.x = 0.36 + mys * 0.1;
      spin.rotation.y = -0.6 + u * 0.75 + mxs * 0.4;

      // робот
      robot.position.set(st.x, st.y + st.bob, st.z);
      robot.rotation.y = st.yaw;
      body.scale.set(1 / Math.sqrt(st.sq), st.sq, 1 / Math.sqrt(st.sq));
      legs[0].rotation.x = st.swing - st.tuck * 0.5;
      legs[1].rotation.x = -st.swing - st.tuck * 0.5;
      arms[0].rotation.x = st.arm; arms[1].rotation.x = st.alt ? -st.arm : st.arm;
      arms[0].rotation.z = -0.15 - st.tuck * 0.3; arms[1].rotation.z = 0.15 + st.tuck * 0.3;

      // прапорець піднімається, робот радіє
      const raise = sm((u * total - raiseSeg.t0) / raiseSeg.d);
      const happy = sm((u * total - raiseSeg.t0 - raiseSeg.d * 0.4) / (raiseSeg.d * 0.6));
      const blink = (t % 3.7) < 0.12 && !happy ? 0.12 : 1;
      eyeL.scale.y = eyeR.scale.y = blink * (1 - happy * 0.7);
      eyes.position.x = mxs * 0.04; eyes.position.y = hy + 0.04 + happy * 0.015;
      mouth.scale.x = 1 + happy * 0.9;
      cloth.position.y = 0.3 + raise * 0.47;
      const ca = cloth.geometry.attributes.position, amp = 0.012 + raise * 0.03;
      for (let i = 0; i < ca.count; i++) {
        const x = clothBase[i * 3];
        ca.setZ(i, Math.sin(x * 14 - t * 6) * amp * (x / 0.34));
      }
      ca.needsUpdate = true; cloth.geometry.computeVertexNormals();

      // клітинки: пройдені світлішають, під кроком трохи просідають
      const ti = Math.round(st.x / C + 2.5), tj = Math.round(st.z / C + 2.5);
      for (let k = 0; k < tiles.length; k++) {
        const c = tiles[k];
        const under = !st.air && c.i === ti && c.j === tj ? 1 : 0;
        c.dip = instant ? under : c.dip + (under - c.dip) * Math.min(1, dt * 10);
        const top = c.l * H - c.dip * 0.025;
        v3.set(cx(c.i), top, cz(c.j)); s3.set(1, 0.35 + c.l * H - c.dip * 0.025, 1);
        m4.compose(v3, q4, s3); cells.setMatrixAt(k, m4);
        tmpC.copy(baseCol[k]).lerp(visitCol, sm((u - c.uv) / 0.03) * 0.92);
        cells.setColorAt(k, tmpC);
      }
      cells.instanceMatrix.needsUpdate = true; cells.instanceColor.needsUpdate = true;

      // тінь під роботом
      const gt = tiles[Math.min(N - 1, Math.max(0, tj)) * N + Math.min(N - 1, Math.max(0, ti))];
      const ground = Math.min(st.y, gt.l * H);
      const press = st.air ? 0 : 0.025 * gt.dip;
      shadow.position.set(st.x, ground + 0.006 - press, st.z);
      robot.position.y -= press;
      const sh = 1 - Math.min(0.6, (st.y - ground) * 1.2);
      shadow.scale.setScalar(sh * R); shadowMat.opacity = 0.3 * sh;

      // монети: висять і крутяться; при зборі злітають і зникають
      let got = 0;
      coins.forEach(c => {
        const a = clamp((u - c.uc) / 0.05);
        got += a;
        c.m.visible = a < 1;
        c.m.position.set(c.x, c.y + Math.sin(t * 2 + c.n * 2) * 0.03 + a * 0.6, c.z);
        c.m.rotation.y = t * 1.8 + c.n + a * 12;
        c.m.scale.setScalar(Math.max(0.001, (1 - a) * (1 + 0.6 * Math.sin(PI * a))));
      });
      // антена жовтіє з кожною монетою
      ballMat.color.lerpColors(grey, yel, got / coins.length);

      teal.color.lerp(want, instant ? 1 : 1 - Math.pow(0.02, dt));
  }

  // початковий стан — одразу, щоб перший кадр не був порожнім
  step({ t: 0, dt: 0, p: 0, instant: true });

  return {
    object: root,
    update(f) {
      // помилка в кадрі не повинна зупиняти рендер
      try { step(f || {}); } catch (e) { if (!step.warned) { step.warned = true; console.error('robot update:', e); } }
    },
    setColor(hex) { want.set(hex); },
    dispose() {
      if (scene && bg && scene.background && scene.background.isColor) scene.background = oldBg;
      root.traverse(o => { o.geometry && o.geometry.dispose(); });
      mats.forEach(m => m.dispose());
    },
  };
}
