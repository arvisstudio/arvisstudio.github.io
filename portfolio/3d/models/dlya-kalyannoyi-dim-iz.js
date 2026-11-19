// Димове кільце для кальянної на темному лаунж-тлі. Клуби тепло-кремового диму
// складаються в об'ємне кільце-вихор (верх світлий, низ у тіні з підсвіченням жаром), навколо — помаранчеві іскри.
// Прокрутка: кільце → розкручується на сім окремих пасом-спіралей з темними проміжками → осідає
// в три шари із закрученими завитками й рваним краєм; нижній шар теплий, з нього злітають іскри.
// Уся анімація — у вершинному шейдері.
export const meta = {
  id: 'dlya-kalyannoyi-dim-iz', name: 'Димове кільце', for: 'кальянна, лаунж-бар, тютюнова крамниця, вейп-шоп, чайна',
  idea: 'На темному тлі тепло-кремовий дим тримає форму об’ємного кільця з іскрами жару. Поки гортаєш, кільце розкручується на сім пасом-спіралей, а потім осідає трьома шарами із завитками, з теплого нижнього шару злітають іскри.',
  colors: ['#e8d9c2', '#b99c7a', '#e08a4c'], color: '#e8d9c2',
  bg: '#15100d',
  scale: 0.85,
};

const VERT = /* glsl */`
uniform float uT, uP, uIntro, uScale, uSize, uMaxPS;
attribute vec4 aA;   // кільце: кут, кут по трубці, віддаленість від осі трубки (0..1), номер шару (0 верх .. 2 низ)
attribute vec4 aB;   // пасмо: стартовий кут, позиція вздовж пасма u, зсув убік, зсув у глибину
attribute vec4 aS;   // випадкові числа
attribute vec4 aL;   // шар: висота в шарі (−1..1), віддаленість від центру шару, іскра (0/1), завиток (0/1)
attribute vec3 aC;   // завиток: центр спіралі (x, y) і напрям закрутки
varying float vAlpha, vTone, vEmber, vStretch, vWarm;
const float R = 1.32;
const float TUBE = 0.42;
const float PI = 3.14159265;

void main() {
  float em = aL.z;
  float curl = aL.w;

  // 1) кільце: частинки крутяться навколо трубки, як у справжньому вихровому кільці
  float th = aA.x + uT * 0.04;
  float ph = aA.y + uT * (0.35 + aS.x * 0.4);
  float r = aA.z * TUBE * (1.0 + 0.1 * sin(th * 4.0 + uT * 0.5 + aS.y * 6.0));
  vec2 dir = vec2(cos(th), sin(th));
  vec3 ring = vec3((R + r * cos(ph)) * dir, r * sin(ph));
  // світло згори-спереду: верх трубки світлий, низ — у глибокій тіні
  vec3 nrm = vec3(cos(ph) * dir, sin(ph));
  float lit = dot(nrm, normalize(vec3(-0.15, 0.85, 0.5)));
  float shell = 0.3 + 0.7 * aA.z;
  float ringTone = max(0.16, 0.62 + 0.85 * lit * shell + 0.1 * dir.y);
  float ringWarm = 0.75 * smoothstep(0.05, -0.75, lit) * shell;   // тінь знизу підсвічена жаром

  // 2) пасма: сектор кільця розкручується в спіраль; голова тонка на кільці, хвіст ширшає назовні
  float u = aB.y;
  float a = aB.x + u * 1.6 + uT * 0.04;
  float wid = 0.03 + 0.13 * u;
  float rad = R * 0.9 + 1.0 * u + 0.04 * sin(u * 9.0 - uT * 0.9 + aB.x * 3.0) + aB.z * wid;
  vec3 strand = vec3(rad * cos(a), rad * sin(a) * 0.85,
                     0.25 * sin(u * 3.5 + aB.x * 1.7 + uT * 0.25) + aB.w * wid);
  float strTone = (1.12 + 0.2 * sin(a) - 0.2 * u) * (1.0 - 0.15 * abs(aB.z));

  // 3) шари: позиція з JS + повільні хвилі й дрейф уздовж
  float band = aA.w;
  vec3 lay = position;
  lay.x += 0.12 * sin(uT * 0.12 + band * 2.1);
  lay.y += (0.06 * sin(lay.x * 1.4 - uT * 0.35 + band * 1.9) + 0.03 * sin(lay.z * 3.0 + uT * 0.5)) * (1.0 - curl);
  // завиток повільно обертається навколо свого центру — видно закрутку
  vec2 cc = aC.xy + vec2(0.12 * sin(uT * 0.12 + band * 2.1), 0.0);
  float ca = curl * aC.z * uT * 0.25, cs = sin(ca), co = cos(ca);
  vec2 rel = lay.xy - cc;
  lay.xy = mix(lay.xy, cc + vec2(co * rel.x - cs * rel.y, cs * rel.x + co * rel.y), curl);
  float layTone = (1.14 - band * 0.05) + 0.16 * aL.x + 0.1 * curl;
  float layWarm = smoothstep(1.5, 2.0, band) * (0.42 - 0.12 * aL.x) * (1.0 - 0.5 * curl);

  // переходи: пасмо розкручується від голови до хвоста; верхній шар осідає першим
  float s1 = 0.12 + u * 0.1 + aS.x * 0.05;
  float k1 = smoothstep(s1, s1 + 0.2, uP);
  float s2 = 0.58 + band * 0.04 + aS.z * 0.05;
  float k2 = smoothstep(s2, s2 + 0.24, uP);
  vec3 pos = mix(mix(ring, strand, k1), lay, k2);

  // завихрення під час переходів, легке дихання завжди (завитки й іскри майже не тремтять)
  float tr = sin(k1 * PI) + sin(k2 * PI);
  vec3 turb = vec3(sin(uT * 0.5 + aS.y * 20.0 + pos.y * 1.7),
                   sin(uT * 0.37 + aS.z * 20.0 + pos.x * 1.3),
                   sin(uT * 0.43 + aS.x * 20.0 + pos.y));
  pos += turb * (0.02 + 0.12 * tr) * (1.0 - em * 0.7) * (1.0 - 0.8 * curl * k2);
  pos.y += 0.1 * sin(k2 * PI);

  // іскри: здіймаються невисоко над димом і гаснуть
  float life = fract(uT * (0.09 + aS.w * 0.07) + aS.z * 5.0);
  float rise = mix(0.3, 0.42, k2);
  pos += em * vec3(0.06 * sin(life * 6.0 + aS.y * 9.0), life * rise, 0.04 * cos(life * 5.0 + aS.x * 7.0));

  // поява: дим стікається з розсипаної хмари
  float ik = smoothstep(aS.x * 0.5, aS.x * 0.5 + 0.5, uIntro);
  vec3 scatter = vec3(position.x * 1.2, (aS.y - 0.5) * 3.0, position.z * 1.4) + turb * 0.3;
  pos = mix(scatter, pos, ik * ik * (3.0 - 2.0 * ik));

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  // кільце: на зовнішньому краї трубки клуби менші, щоб край був чіткий
  float ringS = mix(1.0, 0.55, aA.z);
  // пасмо: тонка голова, помірний хвіст
  float strS = 0.4 + 0.5 * u;
  // шари: клуби більші, завитки дрібні й чіткі
  float layS = mix(1.25, 0.28, curl);
  float smokeS = (0.7 + aS.z * 0.6) * mix(mix(ringS, strS, k1), layS, k2) * (1.0 + 0.2 * tr);
  float ps = uSize * mix(smokeS, 0.13 * (0.75 + aS.y * 0.5), em);
  gl_PointSize = clamp(ps * uScale / max(0.1, -mv.z), 2.0, uMaxPS);
  gl_Position = projectionMatrix * mv;

  // прозорість: ядро трубки щільне, край м'який; хвіст пасма тане; шар неоднорідний уздовж
  float ringA = mix(0.17, 0.06, aA.z * aA.z);
  float strA = 0.2 * (1.0 - 0.5 * u) * (1.0 - 0.4 * abs(aB.z));
  float dens = 0.45 + 0.55 * (0.5 + 0.5 * sin(position.x * 2.3 + band * 1.7 + uT * 0.08));
  float layA = mix(0.1 * (1.0 - smoothstep(0.4, 1.0, aL.y)) * dens, 0.2 * (1.0 - 0.5 * aL.y), curl);
  float smokeA = mix(mix(ringA, strA, k1), layA, k2) * (0.8 + 0.4 * aS.y);
  float flick = 0.8 + 0.2 * sin(uT * 9.0 + aS.x * 40.0) * sin(uT * 5.3 + aS.y * 30.0);
  float emberA = smoothstep(0.0, 0.1, life) * (1.0 - smoothstep(0.45, 1.0, life)) * flick;
  vAlpha = mix(smokeA, emberA, em) * (0.3 + 0.7 * ik);
  vTone = mix(mix(ringTone, strTone, k1), layTone, k2) * (0.92 + 0.16 * aS.y);
  vWarm = mix(mix(ringWarm, 0.1 * u, k1), layWarm, k2);
  vEmber = em;
  vStretch = mix(1.0, 2.2, k2 * (1.0 - em) * (1.0 - curl)); // у шарах клуби витягнуті по горизонталі
}`;

const FRAG = /* glsl */`
uniform vec3 uColor, uWarm;
varying float vAlpha, vTone, vEmber, vStretch, vWarm;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  q.y *= vStretch;
  float d = length(q) * 2.0;
  // дим: широкий м'який спад без жорсткого краю
  float soft = exp(-d * d * 3.0) * (1.0 - smoothstep(0.6, 1.0, d));
  // жар: щільне ядро + вузьке тепле гало
  float spark = (exp(-d * d * 14.0) + 0.18 * exp(-d * d * 5.0)) * (1.0 - smoothstep(0.7, 1.0, d));
  float a = mix(soft, spark, vEmber) * vAlpha;
  if (a < 0.003) discard;
  // тінь не брудниться: тепла частина — чистий помаранчевий відблиск, а не затемнений крем
  vec3 base = uColor * vTone * (0.9 + 0.14 * (1.0 - d));
  vec3 smoke = mix(base, uWarm * (0.62 + 0.45 * vTone), vWarm);
  // жар: насичений помаранчевий, лише крихітне світле ядро
  vec3 deep = uWarm * vec3(1.35, 0.8, 0.45);
  vec3 hot = mix(deep, vec3(1.25, 0.72, 0.3), exp(-d * d * 40.0));
  gl_FragColor = vec4(mix(smoke, hot, vEmber), min(1.0, a));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function create(THREE, { weak = false, color = meta.color, renderer = null, scene = null, bg = meta.bg } = {}) {
  const NS = 7;                        // кількість пасом
  const ns = weak ? 800 : 1600;        // клуби диму
  const ne = weak ? 45 : 80;           // іскри жару
  const n = ns + ne;
  const R = Math.random, TAU = Math.PI * 2;
  // гаусове число, обрізане до ±2
  const g = () => { let u = 0; while (!u) u = R(); return Math.max(-2, Math.min(2, Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * R()))); };
  const cl = (v, m) => Math.max(-m, Math.min(m, v));
  // три шари: далеко один від одного, широкі й тонкі; у кожного два завитки вгору
  const SH = [
    { cx: -0.2, cy: 1.1, sx: 0.8, sy: 0.08, sz: 0.42 },
    { cx: 0.25, cy: -0.05, sx: 0.88, sy: 0.11, sz: 0.5 },
    { cx: -0.1, cy: -1.25, sx: 0.8, sy: 0.14, sz: 0.55 },
  ].map(s => {
    const f1 = R() * TAU, f2 = R() * TAU, f3 = R() * TAU, side = R() < 0.5 ? -1 : 1;
    const curls = [side, -side].map(sd => ({ x: s.cx + sd * s.sx * (0.6 + R() * 0.3), y: s.cy + s.sy + 0.3, dir: sd }));
    return { ...s, f1, f2, f3, curls };
  });

  const pos = new Float32Array(n * 3), aA = new Float32Array(n * 4), aB = new Float32Array(n * 4);
  const aS = new Float32Array(n * 4), aL = new Float32Array(n * 4), aC = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const em = i >= ns ? 1 : 0;
    const j = i % NS;
    // іскри — ближче до голови пасом, де дим щільний
    const u = em ? R() * 0.55 : R(), a0 = j / NS * TAU;
    const th = a0 + u * TAU / NS, s = Math.sin(th);
    // іскри у фіналі здебільшого злітають з нижнього, теплого шару
    const band = em ? (R() < 0.7 ? 2 : 1) : s > 0.35 ? 0 : s < -0.35 ? 2 : 1;
    // більшість диму — в ядрі трубки; іскри — на поверхні
    const tube = em ? 0.8 + 0.25 * R() : Math.min(1, Math.abs(g()) * 0.5);
    aA.set([th, R() * TAU, tube, band], i * 4);
    aB.set([a0, u, cl(g() * 0.5, 1), cl(g() * 0.5, 1)], i * 4);
    aS.set([R(), R(), R(), R()], i * 4);
    const S = SH[band];
    let x, y, z, off, dist, curl = 0, cx = 0, cy = 0, cd = 0;
    if (!em && R() < 0.32) {
      // завиток: чітка спіраль, що відходить від верхнього краю шару й закручується всередину
      const C = S.curls[i & 1], t = Math.sqrt(R()), rr = 0.3 * (1 - 0.8 * t);
      const ang = -Math.PI / 2 + C.dir * t * 2.3 * Math.PI;
      x = C.x + rr * Math.cos(ang) + 0.012 * g();
      y = C.y + rr * Math.sin(ang) + 0.012 * g();
      z = 0.04 * g();
      off = 1 - t; dist = t; curl = 1; cx = C.x; cy = C.y; cd = C.dir;
    } else {
      // ціль у шарі: широка хмара зі згустками вздовж; край тане поступово, без прямих зрізів
      let gx;
      do gx = g() * 0.85; while (R() > 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(gx * 2.4 + S.f3)));
      const gz = g(), an = Math.atan2(gz, gx);
      const lobe = 1 + 0.18 * Math.sin(3 * an + S.f1) + 0.1 * Math.sin(7 * an + S.f2) + 0.05 * Math.sin(13 * an + S.f3);
      const ex = Math.abs(gx) / 1.7;                     // 0 у центрі .. 1 на краю
      if (em) {
        // іскри — над серединою шару, біля диму
        x = S.cx + S.sx * g() * 0.45; z = S.sz * g() * 0.4;
        off = 0.6 + 0.4 * R();
        y = S.cy + S.sy * 1.2;
        dist = 0.3;
      } else {
        x = S.cx + S.sx * gx * lobe; z = S.sz * gz * lobe;
        off = cl(g() * 0.5, 1);
        // на краю шар розпадається на клапті: вертикальний розкид, а не тонкий хвіст
        y = S.cy + S.sy * off * 2 + 0.08 * Math.sin(gx * 1.5 + S.f2) + ex * ex * 0.18 * g();
        z += ex * ex * 0.2 * g();
        // прозорість падає і від загальної відстані, і окремо до країв по x з випадковим порогом
        dist = Math.min(1, Math.max(Math.hypot(gx, gz) * lobe / 2.4, ex * (0.75 + 0.35 * R())));
      }
    }
    pos.set([x, y, z], i * 3);
    aL.set([off, dist, em, curl], i * 4);
    aC.set([cx, cy, cd], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aA', new THREE.BufferAttribute(aA, 4));
  geo.setAttribute('aB', new THREE.BufferAttribute(aB, 4));
  geo.setAttribute('aS', new THREE.BufferAttribute(aS, 4));
  geo.setAttribute('aL', new THREE.BufferAttribute(aL, 4));
  geo.setAttribute('aC', new THREE.BufferAttribute(aC, 3));

  const uni = {
    uT: { value: 0 }, uP: { value: 0 }, uIntro: { value: 0 },
    uScale: { value: 500 }, uSize: { value: weak ? 1.35 : 1.15 }, uMaxPS: { value: 120 },
    uColor: { value: new THREE.Color(color) }, uWarm: { value: new THREE.Color('#e08a4c') },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: uni, vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, toneMapped: true,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  const root = new THREE.Group(); root.add(pts);

  // кремовий дим задуманий на темному тлі: ставимо фон сцени сам (сайт може вимкнути: bg: null)
  const oldBg = scene ? scene.background : null;
  if (scene && bg) scene.background = new THREE.Color(bg);

  const want = new THREE.Color(color), buf = new THREE.Vector2();
  let shown = 0, intro = 0;
  return {
    object: root,
    update({ t, dt, p, mx, my, instant, reduce }) {
      p = Math.max(0, Math.min(1, p || 0));
      const still = instant || reduce;
      shown = still ? p : shown + (p - shown) * Math.min(1, dt * 3);
      intro = still ? 1 : Math.min(1, intro + dt / 3.5);
      if (renderer) {
        // розмір клубів — від CSS-висоти з обмеженим DPR: на телефоні з DPR 3 заливка не роздувається
        renderer.getSize(buf);
        const pr = Math.min(renderer.getPixelRatio(), weak ? 1 : 1.25);
        uni.uScale.value = buf.y * 0.5 * pr;
        uni.uMaxPS.value = (weak ? 90 : 120) * pr;
      }
      uni.uT.value = t; uni.uP.value = shown; uni.uIntro.value = intro;
      // кільце нахилене до нас — видно тор; шари — трохи згори
      const k = still ? 1 : Math.min(1, dt * 2);
      root.rotation.x += (0.4 - 0.15 * shown + my * 0.2 - root.rotation.x) * k;
      root.rotation.y += (mx * 0.4 + Math.sin(t * 0.12) * 0.1 - root.rotation.y) * k;
      uni.uColor.value.lerp(want, still ? 1 : 1 - Math.pow(0.02, dt));
    },
    setColor(hex) { want.set(hex); },
    dispose() {
      geo.dispose(); mat.dispose();
      if (scene && bg) scene.background = oldBg;
    },
  };
}
