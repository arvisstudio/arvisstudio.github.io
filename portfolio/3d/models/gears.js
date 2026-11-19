// Механізм із шестерень, що зчеплені й крутяться. p (0..1): 0 — зібраний, 1 — розібраний «вибухом», як на кресленні.
export const meta = {
  id: 'gears', name: 'Механізм', for: 'СТО, виробництво, ремонт, інженерна компанія, IT-послуги',
  idea: 'Металеві шестерні крутяться разом; на прокрутці механізм розʼїжджається шарами, як у розборі мотора.',
  colors: ['#f0b92b', '#c8792b', '#3a7bd5'], color: '#f0b92b', scale: 0.62,
};

function gearShape(THREE, teeth, m, holeR) {
  const r = m * teeth / 2, ro = r + m, rr = r - 1.25 * m, s = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step, pts = [[rr, a], [rr, a + step * 0.12], [ro, a + step * 0.3], [ro, a + step * 0.55], [rr, a + step * 0.73], [rr, a + step]];
    pts.forEach(([rad, ang], k) => { const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad; (i === 0 && k === 0) ? s.moveTo(x, y) : s.lineTo(x, y); });
  }
  const hole = new THREE.Path(); hole.absarc(0, 0, holeR, 0, Math.PI * 2, true); s.holes.push(hole);
  // вікна в тілі шестерні — щоб вона виглядала справжньою, а не «таблеткою»
  if (teeth >= 14) for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2, c = (holeR + rr) / 2, w = new THREE.Path();
    w.absarc(Math.cos(a) * c, Math.sin(a) * c, (rr - holeR) * 0.28, 0, Math.PI * 2, true); s.holes.push(w);
  }
  return { shape: s, r };
}

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const m = 0.13;
  const steel = new THREE.MeshStandardMaterial({ color: 0xb9bec6, metalness: 1, roughness: 0.32 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2b2d31, metalness: 0.9, roughness: 0.45 });
  const accent = new THREE.MeshStandardMaterial({ color, metalness: 0.85, roughness: 0.28 });
  const defs = [
    { teeth: 18, mat: accent, z: 0, ez: 0 },
    { teeth: 10, mat: steel, z: 0, ez: 1.5 },
    { teeth: 26, mat: steel, z: 0, ez: -1.6 },
    { teeth: 8, mat: dark, z: 0, ez: 2.6 },
  ];
  const root = new THREE.Group(), inner = new THREE.Group(); root.add(inner);
  const gears = [];
  defs.forEach(d => {
    const { shape, r } = gearShape(THREE, d.teeth, m, m * 2.2);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.28, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: weak ? 1 : 2, curveSegments: weak ? 6 : 10 });
    geo.translate(0, 0, -0.14);
    const g = new THREE.Group(), mesh = new THREE.Mesh(geo, d.mat);
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(m * 1.9, m * 1.9, 0.5, 20), dark); axle.rotation.x = Math.PI / 2;
    g.add(mesh, axle); inner.add(g);
    gears.push({ ...d, r, g, mesh });
  });
  // розставляємо так, щоб зуби зчіплювались: відстань між центрами = сума радіусів
  const [A, B, C, D] = gears;
  const place = (child, parent, ang) => { const dist = parent.r + child.r; child.x = parent.x + Math.cos(ang) * dist; child.y = parent.y + Math.sin(ang) * dist; child.ang = ang; };
  A.x = 0.2; A.y = 0.1;
  place(B, A, -0.35); place(C, A, Math.PI * 0.82); place(D, B, 0.95);
  // фазові зсуви, щоб зуб входив у западину
  A.dir = 1; A.ph = 0;
  const link = (c, p) => { c.dir = -p.dir; c.ratio = p.teeth / c.teeth * (p.ratio || 1); c.ph = Math.PI / c.teeth; };
  A.ratio = 1; link(B, A); link(C, A); link(D, B);
  gears.forEach(g => g.g.position.set(g.x, g.y, 0));
  inner.position.set(-0.15, 0, 0);

  let angle = 0, shown = 0, lastP = 0;
  const want = new THREE.Color(color);
  return {
    object: root,
    update({ t, dt, p, mx, my, instant }) {
      const pp = Math.max(0, Math.min(1, p));
      const speed = 0.6 + Math.min(6, Math.abs(pp - lastP) / Math.max(dt, 0.001) * 3); lastP = pp;
      angle += dt * speed;
      shown = instant ? pp : shown + (pp - shown) * Math.min(1, dt * 3);
      const e = shown * shown * (3 - 2 * shown);
      gears.forEach(g => {
        g.mesh.rotation.z = g.ph + g.dir * angle * g.ratio;
        g.g.position.z = g.ez * e;
      });
      root.rotation.y = -0.15 + e * 0.95 + mx * 0.3;
      root.rotation.x = 0.1 + e * 0.35 + my * 0.2;
      accent.color.lerp(want, 1 - Math.pow(0.02, dt));
    },
    setColor(hex) { want.set(hex); },
    dispose() { root.traverse(o => { o.geometry && o.geometry.dispose(); }); [steel, dark, accent].forEach(x => x.dispose()); },
  };
}
