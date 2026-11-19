// Димове кільце для кальянної. М'які напівпрозорі клуби диму зливаються в об'ємне кільце-вихор,
// що крутиться всередину, як справжнє димове кільце. На прокрутці кільце розвіюється згори вниз:
// пасма тягнуться й завихрюються, верх стікає у верхній шар, боки — у середній, низ — у нижній;
// дим осідає в три рвані пласти різної товщини, а від кільця лишається слабкий слід.
// Уся анімація — у вершинному шейдері (GPU), на CPU тільки кілька чисел за кадр.
export const meta = {
  id: 'dlya-kalyannoyi-dim-iz', name: 'Димове кільце', for: 'кальянна, лаунж-бар, тютюнова крамниця, вейп-шоп, чайна',
  idea: 'М’який дим зливається в об’ємне кільце-вихор із теплими іскрами жару. Поки гортаєш, кільце розтягується пасмами, завихрюється й осідає в три рвані пелени диму, що повільно хвилюються.',
  colors: ['#6f6258', '#c9bcab', '#d89a62'], color: '#6f6258',
};

const VERT = /* glsl */`
uniform float uT, uP, uIntro, uScale, uSize;
attribute vec4 aA;   // кут по кільцю, кут по трубці, товщина (0..1), номер шару (0 верх .. 2 низ)
attribute vec4 aS;   // випадкові числа частинки
attribute vec2 aE;   // віддаленість від центру пласта (0..1), чи лишається слідом на кільці
varying float vAlpha, vTone, vWarm;
const float R = 1.4;
const float TUBE = 0.4;
const float PI = 3.14159265;

void main() {
  float keep = step(0.9, aE.y);           // ~10% частинок — слабкий слід кільця наприкінці
  float th = aA.x + uT * 0.035;
  // частинки крутяться навколо трубки — як у справжньому вихровому кільці
  float ph = aA.y + uT * (0.3 + aS.x * 0.45);
  float grow = 1.0 + keep * uP * 0.2;     // слід трохи розходиться
  float r = aA.z * TUBE * (1.0 + 0.22 * sin(th * 5.0 + uT * 0.55 + aS.y * 6.0) + 0.1 * sin(th * 2.0 - uT * 0.37));
  float rr = R * grow + r * cos(ph);
  vec3 dirO = vec3(cos(th), sin(th), 0.0);
  vec3 tang = vec3(-sin(th), cos(th), 0.0);
  vec3 ring = vec3(rr * dirO.xy, r * sin(ph));

  // світло на трубці: верх-перед світлий, низ-зад темний — читається тор
  vec3 nrm = vec3(cos(ph) * dirO.xy, sin(ph));
  float lit = smoothstep(-0.65, 0.85, dot(nrm, normalize(vec3(-0.35, 0.7, 0.62))));
  float core = 1.0 - aA.z;
  float ringTone = mix(mix(0.38, 1.7, lit), 0.62, core * core * 0.7);

  // тонкі пасма, що відриваються від кільця й тануть
  float wisp = step(0.88, aS.w);
  float life = fract(uT * 0.06 + aS.z * 7.0);
  ring += wisp * life * (dirO * 0.3 + vec3(0.12 * sin(life * 5.0 + aS.y * 9.0), 0.45, 0.2 * (aS.x - 0.5)));
  float wispA = mix(1.0, (1.0 - life) * smoothstep(0.0, 0.15, life), wisp);

  // розвіювання: верх іде першим, боки — потім, низ тримає форму найдовше; перехід довгий
  float band = aA.w;
  float d = 0.5 - 0.5 * sin(th);
  float start = 0.02 + band * 0.19 + d * 0.1 + aS.x * 0.05;
  float k = smoothstep(start, start + 0.42, uP) * (1.0 - keep);
  float ek = k * k * (3.0 - 2.0 * k);

  // пласт: позиція з JS + повільні хвилі й дрейф
  float sx = position.x, sz = position.z;
  vec3 sheet = vec3(sx + 0.1 * sin(uT * 0.18 + band * 1.7),
                    position.y + 0.11 * sin(sx * 1.3 - uT * 0.4 + band * 2.1) + 0.05 * sin(sz * 2.6 + uT * 0.55 + sx),
                    sz);

  vec3 pos = mix(ring, sheet, ek);
  // по дорозі дим здіймається, тягнеться вздовж кільця й закручується
  float arc = sin(k * PI);
  vec3 turb = vec3(sin(uT * 0.5 + aS.y * 20.0 + pos.y * 1.7),
                   sin(uT * 0.37 + aS.z * 20.0 + pos.x * 1.3),
                   sin(uT * 0.43 + aS.x * 20.0 + pos.y));
  float sw = th * 2.0 + aS.y * 6.2832 + k * 7.0 + uT * 0.5;
  vec3 curl = vec3(cos(sw), 0.6 * sin(sw * 1.3), sin(sw)) * (0.25 + 0.35 * aS.z);
  pos += arc * (vec3(0.0, 0.3, 0.0) + turb * 0.42 + curl + tang * (aS.w - 0.5) * 0.9) + turb * 0.04;

  // поява: дим стікається з розсипаної хмари
  float ik = smoothstep(aS.x * 0.5, aS.x * 0.5 + 0.5, uIntro);
  vec3 scatter = vec3(sx * 1.1, (aS.y - 0.5) * 3.0, sz * 1.2) + turb * 0.3;
  pos = mix(scatter, pos, ik * ik * (3.0 - 2.0 * ik));

  // теплі частинки жару
  float warm = step(0.95, aS.x);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float ps = uSize * (0.6 + aS.z * 0.8) * (1.0 + 0.55 * ek + 0.5 * arc + wisp * life * 0.8) * mix(1.0, 0.8, warm);
  gl_PointSize = min(ps * uScale / max(0.1, -mv.z), 180.0);
  gl_Position = projectionMatrix * mv;

  // пласт: щільність спадає до рваного краю; верхній світліший, нижній темніший
  float edge = 1.0 - smoothstep(0.25, 1.0, aE.x);
  float sheetTone = (1.28 - band * 0.3) + 0.25 * aE.x;
  float sheetA = (0.085 + band * 0.025) * edge;
  // ядро трубки щільне, край м'який; слід кільця блякне
  float ringA = mix(0.13, 0.05, aA.z * aA.z) * mix(1.0, 0.45, keep * smoothstep(0.3, 0.9, uP));
  float a = (0.8 + 0.4 * aS.y) * mix(ringA, sheetA, ek) * (1.0 - 0.3 * arc);
  float vis = wispA * (0.35 + 0.65 * ik);
  vWarm = warm * (1.0 - 0.55 * ek);
  vAlpha = mix(a, 0.34 * edge, vWarm) * vis;
  vTone = mix(ringTone, sheetTone, ek) * (0.9 + 0.2 * aS.y);
}`;

const FRAG = /* glsl */`
uniform vec3 uColor, uWarm;
varying float vAlpha, vTone, vWarm;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  // широкий м'який спад — клуби зливаються в пелену; жар трохи щільніший
  float soft = exp(-d * d * 2.4) * (1.0 - smoothstep(0.5, 1.0, d));
  float ember = exp(-d * d * 4.5) * (1.0 - smoothstep(0.7, 1.0, d));
  float a = mix(soft, ember, vWarm) * vAlpha;
  if (a < 0.002) discard;
  vec3 col = mix(uColor * vTone, uWarm * 1.08, vWarm * 0.9);
  gl_FragColor = vec4(col, min(1.0, a));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function create(THREE, { weak = false, color = meta.color, renderer = null } = {}) {
  const n = weak ? 1400 : 2800;
  const R = Math.random, TAU = Math.PI * 2;
  // гаусове число, обрізане до ±2
  const g = () => { let u = 0; while (!u) u = R(); return Math.max(-2, Math.min(2, Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * R()))); };
  // три пласти: різна довжина, товщина й зсув, щоб не було «тарілок» одна під одною
  const SH = [
    { cx: -0.4, cy: 1.15, sx: 0.78, sy: 0.12, sz: 0.42 },
    { cx: 0.35, cy: 0.1, sx: 0.66, sy: 0.2, sz: 0.5 },
    { cx: -0.12, cy: -1.0, sx: 0.84, sy: 0.27, sz: 0.58 },
  ].map(s => ({ ...s, f1: R() * TAU, f2: R() * TAU, f3: R() * TAU }));

  const pos = new Float32Array(n * 3), aA = new Float32Array(n * 4), aS = new Float32Array(n * 4), aE = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const th = R() * TAU, s = Math.sin(th);
    // шар залежить від місця на кільці: верх → верхній, боки → середній, низ → нижній
    const band = s > 0.5 ? 0 : s < -0.5 ? 2 : 1;
    // товщина трубки: більшість частинок у ядрі, мало — на краю
    aA.set([th, R() * TAU, Math.pow(R(), 1.1), band], i * 4);
    aS.set([R(), R(), R(), R()], i * 4);
    // ціль у пласті: гаусова хмара з рваним краєм (пелюстки шуму по куту)
    const S = SH[band], gx = g(), gz = g(), a = Math.atan2(gz, gx);
    const lobe = 1 + 0.28 * Math.sin(3 * a + S.f1) + 0.16 * Math.sin(7 * a + S.f2) + 0.08 * Math.sin(13 * a + S.f3);
    const x = S.cx + S.sx * gx * lobe, z = S.sz * gz * lobe;
    // товщина змінюється вздовж пласта й тоншає до країв
    const tw = S.sy * (1 - 0.55 * Math.min(1, (gx / 2) ** 2)) * (0.6 + 0.8 * (0.5 + 0.5 * Math.sin(gx * 2.1 + S.f1)));
    const y = S.cy + tw * g() + 0.12 * Math.sin(gx * 1.7 + S.f2) - 0.05 * gx * gx;
    pos.set([x, y, z], i * 3);
    aE.set([Math.min(1, Math.hypot(gx, gz) * lobe / 2.4), R()], i * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aA', new THREE.BufferAttribute(aA, 4));
  geo.setAttribute('aS', new THREE.BufferAttribute(aS, 4));
  geo.setAttribute('aE', new THREE.BufferAttribute(aE, 2));

  const uni = {
    uT: { value: 0 }, uP: { value: 0 }, uIntro: { value: 0 },
    uScale: { value: 500 }, uSize: { value: weak ? 0.46 : 0.4 },
    uColor: { value: new THREE.Color(color) }, uWarm: { value: new THREE.Color('#d89a62') },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, toneMapped: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  const root = new THREE.Group(); root.add(pts);

  const want = new THREE.Color(color), buf = new THREE.Vector2();
  let shown = 0, intro = 0;
  return {
    object: root,
    update({ t, dt, p, mx, my, instant, reduce }) {
      p = Math.max(0, Math.min(1, p || 0));
      const still = instant || reduce;
      shown = still ? p : shown + (p - shown) * Math.min(1, dt * 3);
      intro = still ? 1 : Math.min(1, intro + dt / 3.5);
      if (renderer) { renderer.getDrawingBufferSize(buf); uni.uScale.value = buf.y * 0.5; }
      uni.uT.value = t; uni.uP.value = shown; uni.uIntro.value = intro;
      // кільце нахилене до нас — видно тор; коли дим осідає — дивимось трохи згори на пласти
      const k = still ? 1 : Math.min(1, dt * 2);
      root.rotation.x += (0.42 + 0.12 * shown + my * 0.2 - root.rotation.x) * k;
      root.rotation.y += (mx * 0.4 + Math.sin(t * 0.12) * 0.1 - root.rotation.y) * k;
      uni.uColor.value.lerp(want, still ? 1 : 1 - Math.pow(0.02, dt));
    },
    setColor(hex) { want.set(hex); },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}
