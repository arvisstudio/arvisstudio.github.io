// Квітка, що розкривається. p (0..1): 0 — бутон, 1 — повністю відкрита.
export const meta = {
  id: 'bloom', name: 'Квітка розкривається', for: 'квітковий магазин, салон краси, весільна студія, косметика',
  idea: 'Бутон із десятків пелюсток повільно розкривається, поки гортаєш; колір пелюсток можна міняти.',
  colors: ['#e86a8a', '#f3b7c6', '#c9302c', '#f2d16b'], color: '#e86a8a',
};

function petalGeometry(THREE, len, wid, seg) {
  const g = new THREE.PlaneGeometry(wid, len, Math.max(4, seg / 2), seg);
  g.translate(0, len / 2, 0);
  const P = g.attributes.position;
  for (let i = 0; i < P.count; i++) {
    let x = P.getX(i), y = P.getY(i);
    const v = y / len, w = Math.pow(Math.sin(Math.PI * Math.min(1, v * 0.92 + 0.04)), 0.75) * (1 - 0.35 * v * v);
    x *= w * 1.1;
    const z = 0.28 * v * v * len - 0.9 * x * x / wid; // пелюстка вигнута човником
    P.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  const col = new Float32Array(P.count * 3);
  for (let i = 0; i < P.count; i++) { const v = P.getY(i) / len; col.set([0.55 + 0.45 * v, 0.55 + 0.45 * v, 0.55 + 0.45 * v], i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const root = new THREE.Group();
  root.rotation.x = 0.55;
  const mat = new THREE.MeshPhysicalMaterial({ color, vertexColors: true, side: THREE.DoubleSide, roughness: 0.55, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xffffff) });
  const seg = weak ? 10 : 18;
  const rings = [
    { n: 5, len: 0.9, wid: 0.62, open: 0.85, closed: 0.08, tw: 0.0 },
    { n: 8, len: 1.15, wid: 0.78, open: 1.15, closed: 0.18, tw: 0.4 },
    { n: 13, len: 1.35, wid: 0.9, open: 1.42, closed: 0.32, tw: 0.9 },
  ];
  const petals = [];
  rings.forEach((rg, ri) => {
    const geo = petalGeometry(THREE, rg.len, rg.wid, seg);
    for (let i = 0; i < rg.n; i++) {
      const pivot = new THREE.Group();
      pivot.rotation.y = (i / rg.n) * Math.PI * 2 + rg.tw;
      const m = new THREE.Mesh(geo, mat);
      pivot.add(m);
      root.add(pivot);
      petals.push({ m, rg, ri, lag: ri * 0.18 + (i / rg.n) * 0.08 });
    }
  });
  // серединка: насіння по спіралі соняшника
  const N = weak ? 50 : 90, seeds = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshStandardMaterial({ color: 0xf2c94c, roughness: 0.6 }), N);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < N; i++) {
    const a = i * 2.39996, rr = 0.032 * Math.sqrt(i) * 1.6;
    m4.makeTranslation(Math.cos(a) * rr, 0.08 + 0.12 * (1 - rr / 0.5), Math.sin(a) * rr);
    seeds.setMatrixAt(i, m4);
  }
  root.add(seeds);

  const want = new THREE.Color(color);
  let shown = 0;
  return {
    object: root,
    update({ t, dt, p, mx, my, instant }) {
      shown = instant ? Math.max(0, Math.min(1, p)) : shown + (Math.max(0, Math.min(1, p)) - shown) * Math.min(1, dt * 3);
      petals.forEach(({ m, rg, lag }) => {
        const k = Math.min(1, Math.max(0, (shown - lag * 0.5) / (1 - lag * 0.5)));
        const e = k * k * (3 - 2 * k);
        m.rotation.x = -(rg.closed + (rg.open - rg.closed) * e) - Math.sin(t * 1.2 + lag * 9) * 0.02;
      });
      seeds.scale.setScalar(0.6 + 0.4 * shown);
      root.rotation.y += dt * 0.12;
      root.rotation.z = mx * 0.15;
      root.rotation.x = 0.55 + my * 0.2;
      mat.color.lerp(want, 1 - Math.pow(0.02, dt));
    },
    setColor(hex) { want.set(hex); },
    dispose() { root.traverse(o => { o.geometry && o.geometry.dispose(); }); mat.dispose(); },
  };
}
