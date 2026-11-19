// Діамант діамантової огранки, крізь який видно світло. p (0..1): обертається і «спалахує» гранями.
export const meta = {
  id: 'gem', name: 'Діамант', for: 'ювелірний, преміум-салон, нерухомість, подарунки, весільна студія',
  idea: 'Прозорий камінь з гранями ловить світло й переливається; на прокрутці повертається іншою гранню та спалахує.',
  colors: ['#d8f1ff', '#ffd1e3', '#bff5d3', '#ffe7a8'], color: '#d8f1ff',
};

export function create(THREE, { weak = false, color = meta.color } = {}) {
  const pts = [
    new THREE.Vector2(0.0001, -1.05), new THREE.Vector2(1.0, 0.0), new THREE.Vector2(1.0, 0.06),
    new THREE.Vector2(0.78, 0.36), new THREE.Vector2(0.52, 0.5), new THREE.Vector2(0.0001, 0.5),
  ];
  const geo = new THREE.LatheGeometry(pts, 16).toNonIndexed();
  geo.computeVertexNormals();
  const mat = new THREE.MeshPhysicalMaterial({
    color, metalness: 0.25, roughness: 0.03, flatShading: true, envMapIntensity: 3.2, clearcoat: 1, clearcoatRoughness: 0,
    iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [200, 900], transparent: true, opacity: 0.9,
  });
  const core = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color, side: THREE.BackSide, metalness: 0.6, roughness: 0.1, flatShading: true, envMapIntensity: 2.5 }));
  core.scale.setScalar(0.985);
  const gem = new THREE.Mesh(geo, mat);
  gem.add(core);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 }));
  const root = new THREE.Group(); root.add(gem, edges); root.scale.setScalar(1.25);
  root.rotation.x = 0.35;

  // іскри навколо — маленькі зірочки, що спалахують
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); g.fillStyle = '#fff';
  g.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r = i % 2 ? 6 : 32; g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.fill();
  const N = weak ? 14 : 26, sp = new THREE.BufferGeometry(), sPos = new Float32Array(N * 3), phase = [];
  for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, r = 1.3 + Math.random() * 0.9; sPos.set([Math.cos(a) * r, (Math.random() - .5) * 2, Math.sin(a) * r], i * 3); phase.push(Math.random() * 10); }
  sp.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  const sMat = new THREE.PointsMaterial({ size: 0.22, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: 0.8 });
  const sparks = new THREE.Points(sp, sMat); root.add(sparks);

  const want = new THREE.Color(color);
  let shown = 0;
  return {
    object: root,
    update({ t, dt, p, mx, my, instant }) {
      shown = instant ? Math.max(0, Math.min(1, p)) : shown + (Math.max(0, Math.min(1, p)) - shown) * Math.min(1, dt * 3);
      gem.rotation.y = edges.rotation.y = t * 0.35 + shown * Math.PI * 1.5;
      root.rotation.x = 0.35 + Math.sin(shown * Math.PI) * 0.45 + my * 0.25;
      root.rotation.z = mx * 0.2;
      sMat.opacity = 0.35 + 0.5 * Math.abs(Math.sin(t * 2.3 + shown * 6));
      sparks.rotation.y = -t * 0.2;
      mat.color.lerp(want, 1 - Math.pow(0.02, dt)); core.material.color.copy(mat.color);
    },
    setColor(hex) { want.set(hex); },
    dispose() { geo.dispose(); mat.dispose(); sp.dispose(); sMat.map.dispose(); sMat.dispose(); },
  };
}
