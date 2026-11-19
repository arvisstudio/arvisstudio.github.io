// Шовкова хвиля: блискуча тканина, що повільно хвилюється й відгукується на курсор. p (0..1): 0 — штиль, 1 — сильні хвилі.
export const meta = {
  id: 'silk', name: 'Шовкова хвиля', for: 'спа, косметика, салон краси, одяг, преміум-бренд',
  idea: 'Гладка блискуча тканина хвилюється, під курсором здіймається хвиля; на прокрутці штиль переходить у шторм.',
  colors: ['#c9a7e8', '#e8c4a7', '#a7d8e8', '#2b2b2b'], color: '#c9a7e8',
};

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const S = weak ? 70 : 120;
  const geo = new THREE.PlaneGeometry(7, 5, S, Math.round(S * 5 / 7));
  const P = geo.attributes.position, base = Float32Array.from(P.array);
  const mat = new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 1, sheenColor: new THREE.Color(0xffffff), side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  const root = new THREE.Group(); root.add(mesh);
  root.rotation.x = -0.85; root.rotation.z = 0.18;
  let calm = 0, cx = 0, cy = 0, frame = 0;
  const want = new THREE.Color(color);
  return {
    object: root,
    update({ t, dt, p, mx, my, weak: w, instant }) {
      calm = instant ? Math.max(0, Math.min(1, p)) : calm + (Math.max(0, Math.min(1, p)) - calm) * Math.min(1, dt * 2);
      cx += (mx * 7 - cx) * Math.min(1, dt * 3); cy += (-my * 5 - cy) * Math.min(1, dt * 3);
      if (w && (frame++ & 1)) return; // на слабких телефонах хвиля рахується через кадр
      const amp = 0.12 + calm * 0.35;
      for (let i = 0; i < P.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1];
        const d = Math.hypot(x - cx, y - cy);
        const z = amp * Math.sin(x * 1.1 + t * 0.9) * Math.cos(y * 0.9 - t * 0.6)
          + amp * 0.5 * Math.sin((x + y) * 1.9 - t * 1.4)
          + 0.45 * Math.exp(-d * d * 0.6) * Math.cos(d * 3 - t * 3);
        P.array[i * 3 + 2] = z;
      }
      P.needsUpdate = true;
      geo.computeVertexNormals();
      mat.color.lerp(want, 1 - Math.pow(0.02, dt));
    },
    setColor(hex) { want.set(hex); },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}
