// Хмара частинок, що перетікає з фігури у фігуру. p (0..1) проходить через усі фігури по черзі.
// Фігури за замовчуванням: чашка з паром → розсипана хмара → кавове зерно. Можна передати свої (shapes: ['cup','cloud','bean','heart','ring','text:ARVIS']).
export const meta = {
  id: 'particles', name: 'Частинки-перевертні', for: "кав'ярня, бренд, логотип, будь-що «магічне»",
  idea: 'Тисячі крапок складаються в чашку, розсипаються хмарою й збираються в кавове зерно — фігура змінюється, поки гортаєш.',
  colors: ['#5a321f', '#b3743f', '#1f1f1f'], color: '#5a321f',
};

function sampleText(text, n) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160;
  const g = c.getContext('2d'); g.fillStyle = '#000'; g.font = '900 120px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 256, 84);
  const d = g.getImageData(0, 0, 512, 160).data, pts = [];
  for (let y = 0; y < 160; y += 2) for (let x = 0; x < 512; x += 2) if (d[(y * 512 + x) * 4 + 3] > 128) pts.push([x, y]);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const p = pts[(Math.random() * pts.length) | 0] || [256, 80]; out.set([(p[0] - 256) / 70, -(p[1] - 80) / 70, (Math.random() - .5) * .3], i * 3); }
  return out;
}

function shape(name, n) {
  const a = new Float32Array(n * 3), R = Math.random, TAU = Math.PI * 2;
  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0;
    if (name === 'cup') {
      const k = R();
      if (k < 0.62) { const t = R() * TAU, h = R(); const rr = 0.95 + 0.25 * h; x = Math.cos(t) * rr; z = Math.sin(t) * rr; y = -1 + h * 1.6; }
      else if (k < 0.74) { const t = R() * Math.PI * 1.1 - .55, tt = R() * TAU; const rr = 0.42 + 0.1 * Math.cos(tt); x = 1.2 + Math.cos(t) * rr * .9; y = -0.2 + Math.sin(t) * rr; z = 0.1 * Math.sin(tt); }
      else if (k < 0.9) { const t = R() * TAU, rr = Math.sqrt(R()) * 1.9; x = Math.cos(t) * rr; z = Math.sin(t) * rr; y = -1.1 + (rr > 1.5 ? (rr - 1.5) * .3 : 0); }
      else { const h = R(); x = Math.sin(h * 9 + i) * 0.25 * (1 - h) + (R() - .5) * .15; y = 0.8 + h * 1.6; z = (R() - .5) * .25; }
    } else if (name === 'bean') {
      const t = R() * TAU, s = Math.acos(2 * R() - 1);
      x = 1.05 * Math.sin(s) * Math.cos(t); y = 1.55 * Math.cos(s); z = 0.75 * Math.sin(s) * Math.sin(t);
      if (z > 0 && Math.abs(x - 0.18 * Math.sin(y * 2.2)) < 0.09) z *= 0.55; // борозенка на зерні
    } else if (name === 'heart') {
      const t = R() * TAU, s = Math.sqrt(R());
      x = s * 16 * Math.pow(Math.sin(t), 3) / 9; y = s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 9; z = (R() - .5) * .6;
    } else if (name === 'ring') {
      const t = R() * TAU, tt = R() * TAU; x = (1.5 + .35 * Math.cos(tt)) * Math.cos(t); y = (1.5 + .35 * Math.cos(tt)) * Math.sin(t); z = .35 * Math.sin(tt);
    } else { // cloud
      const t = R() * TAU, s = Math.acos(2 * R() - 1), rr = 1.2 + Math.pow(R(), 2) * 1.8;
      x = rr * Math.sin(s) * Math.cos(t) * 1.25; y = rr * Math.cos(s) * .75; z = rr * Math.sin(s) * Math.sin(t);
    }
    a.set([x, y, z], i * 3);
  }
  return a;
}

export function create(THREE, { weak = false, color = meta.color, shapes = ['cup', 'cloud', 'bean'] } = {}) {
  const n = weak ? 3500 : 7000;
  const forms = shapes.map(s => s.startsWith('text:') ? sampleText(s.slice(5), n) : shape(s, n));
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(forms[0]);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const seed = new Float32Array(n); for (let i = 0; i < n; i++) seed[i] = Math.random();
  // круглі м'які крапки замість квадратів
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.55, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  const mat = new THREE.PointsMaterial({ size: weak ? 0.075 : 0.065, color, map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  const root = new THREE.Group(); root.add(pts); root.rotation.y = 0.5;
  const want = new THREE.Color(color);
  return {
    object: root,
    update({ t, dt, p, mx, my }) {
      const seg = Math.max(0, Math.min(0.9999, p)) * (forms.length - 1);
      const i0 = Math.floor(seg), f = seg - i0, A = forms[i0], B = forms[Math.min(i0 + 1, forms.length - 1)];
      for (let i = 0; i < n; i++) {
        // кожна крапка рушає трохи пізніше за сусідню — фігура «перетікає», а не стрибає
        const d = seed[i] * 0.35, k = Math.min(1, Math.max(0, (f - d) / 0.65)), e = k * k * (3 - 2 * k);
        const j = i * 3, w = Math.sin(t * 1.3 + seed[i] * 20) * 0.015;
        pos[j] = A[j] + (B[j] - A[j]) * e + w;
        pos[j + 1] = A[j + 1] + (B[j + 1] - A[j + 1]) * e + w;
        pos[j + 2] = A[j + 2] + (B[j + 2] - A[j + 2]) * e;
      }
      geo.attributes.position.needsUpdate = true;
      root.rotation.y += dt * 0.15 + (mx * 0.6 - root.rotation.y) * Math.min(1, dt * 1.5) * 0.3;
      root.rotation.x = my * 0.2;
      mat.color.lerp(want, 1 - Math.pow(0.02, dt));
    },
    setColor(hex) { want.set(hex); },
    dispose() { geo.dispose(); mat.map.dispose(); mat.dispose(); },
  };
}
