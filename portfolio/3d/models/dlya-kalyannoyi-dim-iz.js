// Димове кільце для кальянної. Тисячі м'яких частинок клубочаться й збираються в кільце-логотип,
// що крутиться всередину, як справжнє димове кільце (вихор). На прокрутці кільце розвіюється трьома
// хвилями — згори вниз — і дим осідає в три повільні шари, що хвилюються, як дим під стелею лаунжу.
// Уся анімація — у вершинному шейдері (GPU), на CPU тільки кілька чисел за кадр.
export const meta = {
  id: 'dlya-kalyannoyi-dim-iz', name: 'Димове кільце', for: 'кальянна, лаунж-бар, тютюнова крамниця, вейп-шоп, чайна',
  idea: 'Дим із тисяч частинок клубочиться й збирається в кільце-логотип, що закручується всередину. Поки гортаєш, кільце розвіюється трьома хвилями й осідає в м’які шари диму, які повільно хвилюються.',
  colors: ['#c9bcab', '#6f6258', '#d89a62'], color: '#c9bcab',
};

const VERT = /* glsl */`
uniform float uT, uP, uIntro, uScale, uSize;
attribute vec4 aA;   // кут по кільцю, кут по трубці, товщина, номер хвилі (0..2)
attribute vec4 aS;   // випадкові числа частинки
varying float vAlpha, vTone, vWarm;
const float R = 1.45;
const float PI = 3.14159265;

void main() {
  float th = aA.x + uT * 0.035;
  // частинки крутяться навколо трубки — як у справжньому вихровому кільці
  float ph = aA.y + uT * (0.3 + aS.x * 0.45);
  // кільце «дихає» й клубочиться
  float r = aA.z * (1.0 + 0.3 * sin(th * 5.0 + uT * 0.55 + aS.y * 6.0) + 0.16 * sin(th * 2.0 - uT * 0.37));
  float rr = R + r * cos(ph);
  vec3 ring = vec3(rr * cos(th), rr * sin(th), r * sin(ph));

  // тонкі пасма, що постійно відриваються від кільця й тануть
  float wisp = step(0.84, aS.w);
  float life = fract(uT * 0.06 + aS.z * 7.0);
  vec3 dirO = vec3(cos(th), sin(th), 0.0);
  ring += wisp * life * (dirO * 0.45 + vec3(0.18 * sin(life * 5.0 + aS.y * 9.0), 0.75, 0.35 * (aS.x - 0.5)));
  float wispA = mix(1.0, (1.0 - life) * smoothstep(0.0, 0.15, life), wisp);

  // розвіювання: три хвилі, кожна йде від верхівки кільця донизу
  float band = aA.w;
  float d = 0.5 - 0.5 * sin(th);
  float start = 0.05 + band * 0.2 + d * 0.16 + aS.x * 0.06;
  float k = smoothstep(start, start + 0.32, uP);
  float ek = k * k * (3.0 - 2.0 * k);

  // куди осідає дим: три пласти, що хвилюються
  float sx = position.x, sz = position.z;
  float ly = (1.0 - band) * 1.05;
  vec3 sheet = vec3(sx, ly + position.y + 0.24 * sin(sx * 1.4 - uT * 0.45 + band * 2.1) + 0.08 * sin(sz * 3.0 + uT * 0.6), sz);

  vec3 pos = mix(ring, sheet, ek);
  // по дорозі дим здіймається й завихрюється
  float arc = sin(k * PI);
  vec3 turb = vec3(sin(uT * 0.5 + aS.y * 20.0 + pos.y * 1.7),
                   sin(uT * 0.37 + aS.z * 20.0 + pos.x * 1.3),
                   sin(uT * 0.43 + aS.x * 20.0 + pos.y));
  pos += arc * (vec3(0.0, 0.55, 0.0) + turb * 0.55) + turb * 0.035;

  // поява: дим стікається з розсипаної хмари
  float ik = smoothstep(aS.x * 0.5, aS.x * 0.5 + 0.5, uIntro);
  vec3 scatter = vec3(sx * 1.5, (aS.y - 0.5) * 4.0, sz * 1.6) + turb * 0.4;
  pos = mix(scatter, pos, ik * ik * (3.0 - 2.0 * ik));

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float ps = uSize * (0.6 + aS.z * 0.9) * (1.0 + 1.3 * ek + 0.6 * arc + wisp * life * 1.6);
  gl_PointSize = ps * uScale / max(0.1, -mv.z);
  gl_Position = projectionMatrix * mv;

  vAlpha = (0.26 + 0.22 * aS.y) * wispA * mix(1.0, 0.6, ek) * (0.25 + 0.75 * ik);
  vTone = aS.y;
  vWarm = step(0.955, aS.x) * (1.0 - ek);
}`;

const FRAG = /* glsl */`
uniform vec3 uColor, uWarm;
varying float vAlpha, vTone, vWarm;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = exp(-d * d * 3.5) * (1.0 - smoothstep(0.85, 1.0, d));
  if (a < 0.01) discard;
  vec3 col = uColor * (0.68 + 0.5 * vTone);
  col = mix(col, uWarm, vWarm * 0.65); // зрідка — теплий відтінок жару
  gl_FragColor = vec4(col, a * vAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function create(THREE, { weak = false, color = meta.color, renderer = null } = {}) {
  const n = weak ? 3500 : 7000;
  const R = Math.random, TAU = Math.PI * 2;
  const pos = new Float32Array(n * 3), aA = new Float32Array(n * 4), aS = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    // товщина трубки: щільне ядро й пухкий край
    const tube = 0.38 * Math.pow(R(), 0.6);
    aA.set([R() * TAU, R() * TAU, tube, Math.floor(R() * 3)], i * 4);
    aS.set([R(), R(), R(), R()], i * 4);
    // ціль у пласті диму: ширина й глибина, мала товщина
    pos.set([(R() - 0.5) * 4.8, (R() - 0.5) * 0.14, (R() - 0.5) * 2.4], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aA', new THREE.BufferAttribute(aA, 4));
  geo.setAttribute('aS', new THREE.BufferAttribute(aS, 4));

  const uni = {
    uT: { value: 0 }, uP: { value: 0 }, uIntro: { value: 0 },
    uScale: { value: 500 }, uSize: { value: weak ? 0.15 : 0.12 },
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
      // кільце дивиться на нас; коли дим осідає — камера ніби дивиться трохи згори на пласти
      root.rotation.x += (0.12 + 0.38 * shown + my * 0.2 - root.rotation.x) * (still ? 1 : Math.min(1, dt * 2));
      root.rotation.y += (mx * 0.45 + Math.sin(t * 0.12) * 0.12 - root.rotation.y) * (still ? 1 : Math.min(1, dt * 2));
      uni.uColor.value.lerp(want, still ? 1 : 1 - Math.pow(0.02, dt));
    },
    setColor(hex) { want.set(hex); },
    dispose() { geo.dispose(); mat.dispose(); },
  };
}
