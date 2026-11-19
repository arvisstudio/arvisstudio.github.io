// Пончик з глазур'ю і посипкою. p (0..1): 0 — цілий, 1 — посипка розлітається навколо.
export const meta = {
  id: 'donut', name: 'Пончик', for: "пончикова, кондитерська, кав'ярня, дитяче свято",
  idea: 'Глянцевий пончик крутиться; глазур змінює колір під смак, на прокрутці посипка розлітається.',
  colors: ['#f27aa0', '#5b2d1e', '#a9c46c', '#d98f3a'], color: '#f27aa0',
};

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const R = 1, r = 0.46, TS = weak ? 120 : 200, RS = weak ? 48 : 72;
  const root = new THREE.Group(), spin = new THREE.Group();
  root.add(spin);
  root.rotation.x = -0.9;

  const dough = new THREE.Mesh(new THREE.TorusGeometry(R, r, RS, TS), new THREE.MeshStandardMaterial({ color: 0xd9965a, roughness: 0.78 }));
  spin.add(dough);

  const edge = u => -0.12 + 0.13 * Math.sin(5 * u) + 0.06 * Math.sin(11 * u + 1.3) + 0.03 * Math.sin(23 * u);
  const gGeo = new THREE.TorusGeometry(R, r, RS, TS), P = gGeo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) {
    v.fromBufferAttribute(P, i);
    const u = Math.atan2(v.y, v.x), cx = R * Math.cos(u), cy = R * Math.sin(u);
    const nx = v.x - cx, ny = v.y - cy, nz = v.z, len = Math.hypot(nx, ny, nz);
    const s = nz / len, e = edge(u);
    const k = THREE.MathUtils.smoothstep(s, e - 0.02, e + 0.14);
    const rad = THREE.MathUtils.lerp(r - 0.05, r + 0.035, k) + k * 0.012 * Math.sin(9 * u + 3 * s);
    P.setXYZ(i, cx + nx / len * rad, cy + ny / len * rad, nz / len * rad);
  }
  gGeo.computeVertexNormals();
  const glaze = new THREE.MeshPhysicalMaterial({ color, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  spin.add(new THREE.Mesh(gGeo, glaze));

  const N = weak ? 110 : 170;
  const spr = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.022, 0.085, 3, 6), new THREE.MeshStandardMaterial({ roughness: 0.45 }), N);
  const pal = [0xffffff, 0xffd34d, 0x6cc4ff, 0xff8fb1, 0x8bd17c, 0xff7a45].map(c => new THREE.Color(c));
  const base = [], up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < N; i++) {
    let u, s;
    do { u = Math.random() * Math.PI * 2; s = Math.random(); } while (s < edge(u) + 0.2);
    const vv = Math.asin(s);
    const c = new THREE.Vector3(R * Math.cos(u), R * Math.sin(u), 0);
    const n = new THREE.Vector3(Math.cos(vv) * Math.cos(u), Math.cos(vv) * Math.sin(u), Math.sin(vv));
    const t = new THREE.Vector3().crossVectors(n, new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5)).normalize();
    base.push({ c, n, q: new THREE.Quaternion().setFromUnitVectors(up, t), f: 0.4 + Math.random() * 0.9 });
    spr.setColorAt(i, pal[i % pal.length]);
  }
  spin.add(spr);
  const m4 = new THREE.Matrix4(), one = new THREE.Vector3(1, 1, 1), p3 = new THREE.Vector3();
  let burst = -1;
  function place(b) {
    base.forEach((s, i) => { p3.copy(s.n).multiplyScalar(r + 0.05 + b * s.f).add(s.c); m4.compose(p3, s.q, one); spr.setMatrixAt(i, m4); });
    spr.instanceMatrix.needsUpdate = true;
  }
  place(0);

  const want = new THREE.Color(color);
  return {
    object: root,
    update({ dt, p, mx, my }) {
      const b = Math.max(0, Math.min(1, p)) * 0.6;
      if (Math.abs(b - burst) > 0.002) { burst = b; place(b); }
      spin.rotation.z += dt * 0.35;
      root.rotation.y += ((mx * 0.35) - root.rotation.y) * Math.min(1, dt * 4);
      glaze.color.lerp(want, 1 - Math.pow(0.02, dt));
    },
    setColor(hex) { want.set(hex); },
    dispose() { root.traverse(o => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); }); },
  };
}
