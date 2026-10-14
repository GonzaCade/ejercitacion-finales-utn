/* ==========================================================================
   gen-fisica.js — Generadores de Física (Final de Física, Seminario UTN Haedo)
   Unidades, vectores, desplazamientos, tiro vertical, caída libre, MRU, MRUV,
   gráficos x(t).
   ========================================================================== */
(function (global) {
  'use strict';
  const { tex, texSigned, texSC, texVec, fmt, round, quadRoots, toDeg, toRad } = global.U;
  const G = global.GEN;
  G.fisica = G.fisica || {};
  const C = () => global.C;
  const g = 9.8;

  /* ======================= 1. PASAJES DE UNIDADES ======================= */
  G.fisica.unidades = function (rng) {
    const L = [
      { q: (v) => `${fmt(v, 2)} m a cm`, f: 100, r: [0.2, 3, 2], u: 'cm' },
      { q: (v) => `${fmt(v, 0)} m a km`, f: 0.001, r: [15, 900, 0], u: 'km' },
      { q: (v) => `${fmt(v, 0)} hm a dam`, f: 10, r: [12, 80, 0], u: 'dam' },
      { q: (v) => `${fmt(v, 0)} mm a m`, f: 0.001, r: [200, 9000, 0], u: 'm' },
      { q: (v) => `${fmt(v, 1)} km a dm`, f: 10000, r: [0.5, 4, 1], u: 'dm' },
      { q: (v) => `${fmt(v, 0)} cm a dam`, f: 0.001, r: [300, 8000, 0], u: 'dam' },
    ];
    const T = [
      { q: (v) => `${fmt(v, 1)} h a s`, f: 3600, r: [0.3, 2.5, 1], u: 's' },
      { q: (v) => `${fmt(v, 0)} min a s`, f: 60, r: [45, 8000, 0], u: 's' },
      { q: (v) => `${fmt(v, 0)} s a h`, f: 1 / 3600, r: [1800, 12000, 0], u: 'h' },
      { q: (v) => `${fmt(v, 1)} días a min`, f: 1440, r: [0.5, 3, 1], u: 'min' },
      { q: (v) => `${fmt(v, 0)} min a h`, f: 1 / 60, r: [15, 500, 0], u: 'h' },
    ];
    const V = [
      { q: (v) => `${fmt(v, 0)} km/h a m/s`, f: 1 / 3.6, r: [36, 1100, 0], u: 'm/s' },
      { q: (v) => `${fmt(v, 0)} m/s a km/h`, f: 3.6, r: [5, 60, 0], u: 'km/h' },
      { q: (v) => `${fmt(v, 0)} cm/s a m/min`, f: 0.6, r: [10, 200, 0], u: 'm/min' },
    ];
    const kind = rng.int(0, 2);
    const pool = kind === 0 ? L : kind === 1 ? T : [...V, ...rng.sample(L, 1), ...rng.sample(T, 1)];
    const chosen = rng.sample(pool, 3).map((c) => { const v = rng.dec(c.r[0], c.r[1], c.r[2]); return { ...c, v, ans: v * c.f }; });
    const mag = kind === 0 ? 'longitud' : kind === 1 ? 'tiempo' : 'velocidad, longitud y tiempo';
    return {
      topic: 'Unidades', title: 'Pasajes de unidades',
      hint: 'Factores de conversión: multiplicá por fracciones que valen 1 (ej. 1000 m / 1 km, 1 h / 3600 s). km/h → m/s: dividir por 3,6.',
      statement: `<p>Realice los siguientes pasajes de unidades con respecto a las magnitudes físicas de ${mag}:</p><ol class="list-[lower-alpha] pl-6">${chosen.map((c) => `<li>${c.q(c.v)}</li>`).join('')}</ol>`,
      items: chosen.map((c, i) => ({ key: 'u' + i, type: 'number', label: `${String.fromCharCode(97 + i)}) ${c.q(c.v)}`, answer: c.ans, tol: Math.max(Math.abs(c.ans) * 0.005, 0.0005), unit: c.u })),
      solution: chosen.map((c) => `<p>${c.q(c.v)}: $${tex(c.v, 3)}\\cdot ${c.f >= 1 ? tex(c.f, 4) : `\\tfrac{1}{${tex(1 / c.f, 2)}}`}=${tex(c.ans, 4)}\\ \\text{${c.u}}$</p>`).join(''),
    };
  };

  /* ======================= 2. VECTORES: PARALELOS Y PERPENDICULARES ======================= */
  G.fisica.vectoresParalelos = function (rng) {
    const variant = rng.int(0, 1);
    if (variant === 0) {
      // u = (a ; b), v = (2k ; c)
      const a = rng.intNZ(-6, 6), b = rng.intNZ(-4, 4), c = rng.pick([2, 4, 6, 8, -4, -8]);
      const kPerp = -(b * c) / (2 * a);
      const kPar = (a * c) / (2 * b);
      return {
        topic: 'Vectores', title: 'Vectores paralelos y perpendiculares',
        hint: 'Perpendiculares: producto escalar = 0. Paralelos: componentes proporcionales (u = λ·v), es decir a/(2k) = b/c.',
        statement: `<p>Dados dos vectores $\\vec u=${texVec(a, b)}$ y $\\vec v=(2k\\,;\\,${c})$, calcule el valor de "k" para que los vectores sean:</p><ul><li>a1) Perpendiculares</li><li>a2) Paralelos</li></ul>`,
        items: [
          { key: 'kp', type: 'number', label: 'k para perpendiculares', answer: kPerp },
          { key: 'kl', type: 'number', label: 'k para paralelos', answer: kPar },
        ],
        solution: `<p><b>Perpendiculares:</b> $\\vec u\\cdot\\vec v=0\\Rightarrow ${a}\\cdot2k+(${b})\\cdot(${c})=0\\Rightarrow ${2 * a}k=${-b * c}\\Rightarrow k=${tex(kPerp, 3)}$.</p>
<p><b>Paralelos:</b> $\\vec u=\\lambda\\vec v$, así que las componentes son proporcionales: $\\dfrac{${a}}{2k}=\\dfrac{${b}}{${c}}\\Rightarrow ${b}\\cdot2k=${a}\\cdot(${c})\\Rightarrow k=${tex(kPar, 3)}$.</p>`,
      };
    }
    const a = rng.intNZ(-4, 5), b = rng.intNZ(-4, 5);
    const perp = -a / b, par = b / a;
    return {
      topic: 'Vectores', title: 'Vectores paralelos y perpendiculares',
      hint: 'Ortogonales: a·b = 0 (producto escalar). Paralelos: b = λ·a → dos ecuaciones, una por componente.',
      statement: `<p>Sean los vectores $\\vec a=${a === 1 ? '' : a === -1 ? '-' : a}\\hat\\imath${texSC(b)}\\hat\\jmath$ y $\\vec b=\\hat\\imath+\\alpha\\,\\hat\\jmath$. Determine $\\alpha$ tal que:</p><ul><li>Los vectores sean ortogonales</li><li>Los vectores sean paralelos</li></ul>`,
      items: [
        { key: 'o', type: 'number', label: 'α para ortogonales', answer: perp },
        { key: 'p', type: 'number', label: 'α para paralelos', answer: par },
      ],
      solution: `<p><b>Ortogonales:</b> $\\vec a\\cdot\\vec b=${a}\\cdot1+${b}\\cdot\\alpha=0\\Rightarrow\\alpha=${tex(perp, 3)}$.</p>
<p><b>Paralelos:</b> $\\vec a=k\\vec b\\Rightarrow\\begin{cases}${a}=k\\\\ ${b}=k\\alpha\\end{cases}\\Rightarrow k=${a},\\ \\alpha=\\dfrac{${b}}{${a}}=${tex(par, 3)}$.</p>`,
    };
  };

  /* ======================= 3. DESPLAZAMIENTOS (con ángulos) ======================= */
  G.fisica.desplazamientos = function (rng) {
    return G.math.desplazamientos(rng, { angled: rng.bool(0.6), unit: rng.pick(['metros', 'cm']) });
  };
  G.fisica.vectoresOperaciones = function (rng) { return G.math.vectoresOperaciones(rng); };

  /* ======================= 4. TIRO VERTICAL ======================= */
  const kinChart = (y, v, tEnd) => C().linesChart([{ label: 'y(t)', f: y, color: '#00455C' }], { xMin: 0, xMax: tEnd, xLabel: 't (s)', yLabel: 'y (m)', n: 80 });
  const velChart = (v, tEnd) => C().linesChart([{ label: 'v(t)', f: v, color: '#d97706' }], { xMin: 0, xMax: tEnd, xLabel: 't (s)', yLabel: 'v (m/s)', n: 20 });

  G.fisica.tiroVertical = function (rng) {
    // primera instancia: sin la variante de velocidad inicial desconocida
    const variant = rng.level === 'primera' ? rng.int(0, 1) : rng.int(0, 2);
    if (variant === 0) {
      const v0 = rng.pick([15, 20, 25, 30, 40, 50]); const t1 = rng.pick([1, 2]);
      const techo = rng.bool(0.4) ? rng.pick([10, 12, 20, 25]) : null;
      const tmax = v0 / g, hmax = v0 * v0 / (2 * g), ttot = 2 * v0 / g;
      const y = (t) => v0 * t - 0.5 * g * t * t, v = (t) => v0 - g * t;
      const who = techo ? `Una cancha de paddle tiene un techo de ${techo} metros de altura. Al terminar un partido, el ganador, entusiasmado, arroja su paleta hacia arriba con una velocidad de ${v0} m/s.` : `Un niño lanza una piedra hacia arriba con una velocidad inicial de ${v0} m/s.`;
      const items = [
        { key: 'y1', type: 'number', label: `a) Altura a los ${t1} s (m)`, answer: y(t1), tol: 0.15 },
        { key: 'hm', type: 'number', label: 'b) Altura máxima (m)', answer: hmax, tol: 0.15 },
        { key: 'tm', type: 'number', label: 'c) Tiempo hasta la altura máxima (s)', answer: tmax, tol: 0.02 },
        { key: 'vf', type: 'number', label: 'd) Velocidad al regresar al punto de partida (m/s, con signo)', answer: -v0, tol: 0.15 },
        { key: 'tt', type: 'number', label: 'e) Tiempo en regresar al punto de partida (s)', answer: ttot, tol: 0.02 },
      ];
      if (techo) items.splice(2, 0, { key: 'g', type: 'choice', label: '¿Golpea el techo?', options: ['Sí', 'No'], answer: hmax >= techo ? 0 : 1 });
      return {
        topic: 'Cinemática', title: 'Tiro vertical',
        hint: 'Sistema de referencia: y positivo hacia arriba, origen en el lanzamiento. y(t) = v₀t − ½gt², v(t) = v₀ − gt. Altura máxima cuando v = 0.',
        statement: `<p>${who} Determine:</p><ol class="list-[lower-alpha] pl-6"><li>La altura alcanzada al ${t1 === 1 ? 'segundo' : `${t1}.° segundo`} de ser lanzada.</li>${techo ? `<li>¿Alcanzará a golpear el techo? ¿Cuál es la altura máxima que alcanza?</li>` : '<li>La altura máxima que alcanza.</li>'}<li>¿Cuánto tiempo tardará en alcanzar la altura máxima?</li><li>La velocidad final con que desciende antes de llegar a su punto de partida.</li><li>El tiempo que tarda en regresar al punto de partida.</li></ol><p class="hint">Realice un esquema de situación y establezca un sistema de referencia. (Recuerde: g = 9,8 m/s²)</p>`,
        figure: C().refSVG('tiro', null, v0),
        items,
        solution: `<p><b>Sistema de referencia:</b> origen en el punto de lanzamiento, eje $y$ positivo hacia arriba, $g=9{,}8\\,m/s^2$ hacia abajo.</p>
$$y(t)=${v0}\\,t-\\tfrac12\\,9{,}8\\,t^2\\qquad v(t)=${v0}-9{,}8\\,t$$
<p><b>a)</b> $y(${t1})=${v0}\\cdot ${t1}-4{,}9\\cdot ${t1}^2=${tex(y(t1))}$ m.</p>
<p><b>${techo ? 'b)' : 'b) y c)'}</b> En la altura máxima $v=0$: $${v0}-9{,}8\\,t=0\\Rightarrow t=${tex(tmax)}$ s. Entonces $y_{max}=y(${tex(tmax)})=${tex(hmax)}$ m${techo ? `, ${hmax >= techo ? 'que supera' : 'que no llega a'} los ${techo} m del techo, por lo tanto ${hmax >= techo ? 'sí golpea' : 'no golpea'}` : ''}.</p>
<p><b>d)</b> Vuelve al punto de partida cuando $y=0$: $t(${v0}-4{,}9t)=0\\Rightarrow t=${tex(ttot)}$ s (el doble del tiempo de subida). $v(${tex(ttot)})=${v0}-9{,}8\\cdot ${tex(ttot)}=${tex(-v0)}$ m/s (hacia abajo, mismo módulo que la inicial).</p>
<p><b>e)</b> Tiempo total de vuelo: $${tex(ttot)}$ s.</p>`,
        chart: kinChart(y, v, ttot), chart2: velChart(v, ttot),
      };
    }
    if (variant === 1) {
      const vkm = rng.pick([72, 80, 90, 108]); const h0 = rng.pick([10, 15, 20, 25]); const v0 = vkm / 3.6;
      const ts = rng.pick([[1, 3], [2, 4], [1, 4]]);
      const y = (t) => h0 + v0 * t - 0.5 * g * t * t, v = (t) => v0 - g * t;
      const tg = quadRoots(-0.5 * g, v0, h0)[1];
      return {
        topic: 'Cinemática', title: 'Tiro vertical desde una altura',
        hint: 'Primero convertí km/h a m/s (÷3,6). Sistema de referencia con origen en el suelo: y(t) = h₀ + v₀t − ½gt², v(t) = v₀ − gt.',
        statement: `<p>Se arroja verticalmente hacia arriba una piedra con una velocidad de ${vkm} km/h, desde lo alto de un ${rng.pick(['muro', 'acantilado'])} de ${h0} metros de altura. Calcule:</p><ol class="list-[lower-alpha] pl-6"><li>Su velocidad y su altura (respecto del suelo) a los ${ts[0]} segundos.</li><li>Velocidad y altura a los ${ts[1]} segundos.</li></ol><p class="hint">Establezca un sistema de referencia. (g = 9,8 m/s²)</p>`,
        figure: C().refSVG('tiro', h0, v0),
        items: [
          { key: 'v1', type: 'number', label: `v(${ts[0]} s) en m/s`, answer: v(ts[0]), tol: 0.1 },
          { key: 'y1', type: 'number', label: `y(${ts[0]} s) en m`, answer: y(ts[0]), tol: 0.2 },
          { key: 'v2', type: 'number', label: `v(${ts[1]} s) en m/s`, answer: v(ts[1]), tol: 0.1 },
          { key: 'y2', type: 'number', label: `y(${ts[1]} s) en m`, answer: y(ts[1]), tol: 0.2 },
        ],
        solution: `<p><b>Conversión:</b> $${vkm}\\,\\tfrac{km}{h}\\cdot\\tfrac{1000\\,m}{1\\,km}\\cdot\\tfrac{1\\,h}{3600\\,s}=${tex(v0, 2)}\\,m/s$.</p>
<p><b>Ecuaciones</b> (origen en el suelo, $y$ hacia arriba): $y(t)=${h0}+${tex(v0, 2)}\\,t-4{,}9\\,t^2$, $v(t)=${tex(v0, 2)}-9{,}8\\,t$.</p>
<p><b>a)</b> $v(${ts[0]})=${tex(v0, 2)}-9{,}8\\cdot ${ts[0]}=${tex(v(ts[0]))}$ m/s ${v(ts[0]) > 0 ? '(subiendo)' : '(bajando)'}; $y(${ts[0]})=${tex(y(ts[0]))}$ m.</p>
<p><b>b)</b> $v(${ts[1]})=${tex(v(ts[1]))}$ m/s ${v(ts[1]) > 0 ? '(subiendo)' : '(bajando)'}; $y(${ts[1]})=${tex(y(ts[1]))}$ m.</p>`,
        chart: kinChart(y, v, tg), chart2: velChart(v, tg),
      };
    }
    // proyectil: a una altura h tiene velocidad vh → v0; instante a altura h2; altura máxima
    const h = rng.pick([50, 60, 84, 100]), vh = rng.pick([4, 6, 10]); const h2 = h - rng.pick([4, 10, 20]);
    const v0 = Math.sqrt(vh * vh + 2 * g * h);
    const hmax = v0 * v0 / (2 * g);
    const tsH2 = quadRoots(-0.5 * g, v0, -h2);
    const y = (t) => v0 * t - 0.5 * g * t * t, v = (t) => v0 - g * t;
    return {
      topic: 'Cinemática', title: 'Tiro vertical: velocidad inicial desconocida',
      hint: 'Usá v² = v₀² − 2g·Δy para hallar v₀ sin el tiempo. Luego y(t) = v₀t − ½gt² para el instante pedido (resolvente, dos instantes: subida y bajada).',
      statement: `<p>Un proyectil es disparado verticalmente hacia arriba con una cierta velocidad inicial. Si al alcanzar una altura de ${h} metros respecto del punto de partida, su velocidad fue de ${vh} m/s, calcule:</p><ul><li>La velocidad inicial y la altura máxima que alcanza el proyectil.</li><li>El instante en el cual se encuentra a los ${h2} metros del punto de partida (subiendo).</li><li>Encuentre la ecuación posición y grafíquela.</li></ul><p class="hint">Establezca un sistema de referencia. (g = 9,8 m/s²)</p>`,
      items: [
        { key: 'v0', type: 'number', label: 'Velocidad inicial (m/s)', answer: v0, tol: 0.1 },
        { key: 'hm', type: 'number', label: 'Altura máxima (m)', answer: hmax, tol: 0.2 },
        { key: 't', type: 'number', label: `Instante a ${h2} m subiendo (s)`, answer: tsH2[0], tol: 0.02 },
        { key: 't2', type: 'number', label: `Instante a ${h2} m bajando (s)`, answer: tsH2[1], tol: 0.02 },
      ],
      solution: `<p><b>Velocidad inicial:</b> $v^2=v_0^2-2g\\,y\\Rightarrow v_0=\\sqrt{${vh}^2+2\\cdot9{,}8\\cdot ${h}}=${tex(v0)}$ m/s.</p>
<p><b>Altura máxima:</b> $0=v_0^2-2g\\,y_{max}\\Rightarrow y_{max}=\\dfrac{${tex(v0)}^2}{2\\cdot9{,}8}=${tex(hmax)}$ m.</p>
<p><b>Instante a ${h2} m:</b> $${h2}=${tex(v0)}\\,t-4{,}9\\,t^2\\Rightarrow 4{,}9t^2-${tex(v0)}t+${h2}=0\\Rightarrow t_1=${tex(tsH2[0])}$ s (subiendo), $t_2=${tex(tsH2[1])}$ s (bajando).</p>
$$y(t)=${tex(v0)}\\,t-4{,}9\\,t^2$$`,
      chart: kinChart(y, v, 2 * v0 / g),
    };
  };

  /* ======================= 5. CAÍDA LIBRE ======================= */
  G.fisica.caidaLibre = function (rng) {
    const h = rng.pick([80, 100, 145, 198, 250, 317, 390]); const t0 = rng.pick([2, 3, 4, 5]);
    const y = (t) => h - 0.5 * g * t * t, v = (t) => -g * t;
    const tf = Math.sqrt(2 * h / g);
    const eqs = [`y(t)=${h}-4{,}9\\,t^2`, `y(t)=${h}+4{,}9\\,t^2`, `y(t)=${h}-9{,}8\\,t`, `y(t)=4{,}9\\,t^2`];
    const opts = rng.shuffle(eqs);
    return {
      topic: 'Cinemática', title: 'Caída libre',
      hint: 'Sistema de referencia: origen en el suelo, y hacia arriba: y(t) = h − ½gt², v(t) = −gt, a = −g. Llega al piso cuando y = 0.',
      statement: `<p>Desde la terraza de un edificio de ${h} metros sobre el nivel del piso, se deja caer libremente un objeto. Se pide:</p><ol class="list-[lower-alpha] pl-6"><li>Escriba las ecuaciones del movimiento (ec. horaria, ec. velocidad y ec. aceleración). Bosqueje un esquema de situación.</li><li>Calcule su velocidad y altura a los ${t0} segundos de caer.</li><li>Determine cuánto tarda el objeto en tocar el piso.</li><li>Determine la velocidad final del objeto antes de impactar con el piso.</li><li>Realice las gráficas de la función posición y función velocidad en el contexto del problema.</li></ol><p class="hint">Establezca un sistema de referencia. (Recuerde: g = 9,8 m/s²)</p>`,
      figure: C().refSVG('caida', h, 0),
      items: [
        { key: 'eq', type: 'choice', label: 'a) Ecuación horaria (origen en el piso, y hacia arriba)', options: opts.map((o) => `$${o}$`), answer: opts.indexOf(eqs[0]) },
        { key: 'v', type: 'number', label: `b) Velocidad a los ${t0} s (m/s, con signo)`, answer: v(t0), tol: 0.1 },
        { key: 'y', type: 'number', label: `b) Altura a los ${t0} s (m)`, answer: y(t0), tol: 0.2 },
        { key: 't', type: 'number', label: 'c) Tiempo en tocar el piso (s)', answer: tf, tol: 0.02 },
        { key: 'vf', type: 'number', label: 'd) Velocidad al impactar (m/s, con signo)', answer: v(tf), tol: 0.15 },
      ],
      solution: `<p><b>Sistema de referencia:</b> origen en el piso, eje $y$ positivo hacia arriba. El objeto parte de $y_0=${h}$ m con $v_0=0$ y $a=-9{,}8\\,m/s^2$.</p>
$$y(t)=${h}-\\tfrac12\\,9{,}8\\,t^2\\qquad v(t)=-9{,}8\\,t\\qquad a(t)=-9{,}8\\,\\tfrac{m}{s^2}$$
<p><b>b)</b> $y(${t0})=${h}-4{,}9\\cdot ${t0}^2=${tex(y(t0))}$ m; $v(${t0})=-9{,}8\\cdot ${t0}=${tex(v(t0))}$ m/s (hacia abajo).</p>
<p><b>c)</b> Toca el piso cuando $y=0$: $${h}-4{,}9t^2=0\\Rightarrow t=\\sqrt{\\tfrac{${h}}{4{,}9}}=${tex(tf)}$ s (se descarta la solución negativa).</p>
<p><b>d)</b> $v(${tex(tf)})=-9{,}8\\cdot ${tex(tf)}=${tex(v(tf))}$ m/s.</p>`,
      chart: kinChart(y, v, tf), chart2: velChart(v, tf),
    };
  };

  /* ======================= 6. MRUV ======================= */
  G.fisica.mruv = function (rng) {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      const v0 = rng.pick([0, 5, 8, 10, 12]); const t1 = rng.pick([5, 8, 10, 12]); const a = rng.pick([1, 1.5, 2, 2.5, 3]);
      const v1 = v0 + a * t1; const t2 = rng.pick([3, 4, 6, 8].filter((t) => t !== t1)); const v3 = v0 + a * rng.pick([2, 4, 6, 7].filter((t) => t !== t1));
      const opts = ['MRUV (acelerado)', 'MRU', 'MRUV (desacelerado)', 'Caída libre'];
      return {
        topic: 'Cinemática', title: 'MRUV: función velocidad',
        hint: 'a = Δv/Δt (constante ⇒ MRUV). v(t) = v₀ + a·t es una recta; x(t) = x₀ + v₀t + ½at².',
        statement: `<p>Una partícula recorre un camino rectilíneo, en un determinado sentido, con aceleración constante. En el instante $t=0$ segundos, el módulo de su velocidad inicial es de ${v0} m/s; en el instante $t=${t1}$ segundos su velocidad es de ${fmt(v1)} m/s. Determine:</p><ol class="list-[lower-alpha] pl-6"><li>El tipo de movimiento de la partícula.</li><li>La aceleración.</li><li>La función velocidad en relación con el tiempo y bosqueje su gráfica.</li><li>La velocidad en el instante $t=${t2}$ segundos.</li><li>El tiempo en que el módulo de la velocidad es de $v=${fmt(v3)}$ m/s.</li></ol>`,
        items: [
          { key: 'tipo', type: 'choice', label: 'a) Tipo de movimiento', options: opts, answer: 0 },
          { key: 'a', type: 'number', label: 'b) Aceleración (m/s²)', answer: a, tol: 0.02 },
          { key: 'v0', type: 'number', label: 'c) v(t) = v₀ + a·t → v₀ (m/s)', answer: v0, tol: 0.02 },
          { key: 'v2', type: 'number', label: `d) v(${t2}) en m/s`, answer: v0 + a * t2, tol: 0.05 },
          { key: 't3', type: 'number', label: `e) Instante en que v = ${fmt(v3)} m/s (s)`, answer: (v3 - v0) / a, tol: 0.05 },
        ],
        solution: `<p><b>a)</b> La velocidad cambia de forma uniforme (aceleración constante) y aumenta: MRUV acelerado.</p>
<p><b>b)</b> $a=\\dfrac{v_f-v_0}{t}=\\dfrac{${tex(v1)}-${v0}}{${t1}}=${tex(a)}\\,m/s^2$.</p>
<p><b>c)</b> $v(t)=${v0}+${tex(a)}\\,t$ (recta de pendiente ${fmt(a)} y ordenada ${v0}).</p>
<p><b>d)</b> $v(${t2})=${v0}+${tex(a)}\\cdot ${t2}=${tex(v0 + a * t2)}$ m/s.</p>
<p><b>e)</b> $${tex(v3)}=${v0}+${tex(a)}\\,t\\Rightarrow t=\\dfrac{${tex(v3)}-${v0}}{${tex(a)}}=${tex((v3 - v0) / a)}$ s.</p>`,
        chart: velChart((t) => v0 + a * t, t1 + 2),
      };
    }
    if (variant === 1) {
      const t = rng.pick([10, 15, 20, 25, 30]); const d = rng.pick([200, 300, 400, 450, 600]);
      const v0 = 2 * d / t, a = -v0 / t;
      return {
        topic: 'Cinemática', title: 'MRUV: frenado',
        hint: 'Frena hasta detenerse: v_f = 0. Usá x = ½(v₀ + v_f)·t para la velocidad inicial y a = (v_f − v₀)/t para la aceleración.',
        statement: `<p>Un móvil que se desplaza con velocidad constante aplica los frenos durante ${t} s y recorre ${d} m hasta detenerse. ¿Qué velocidad tenía el móvil antes de aplicar los frenos? ¿Cuál fue la desaceleración que produjeron los frenos? Establezca un sistema de referencia.</p>`,
        items: [
          { key: 'v0', type: 'number', label: 'Velocidad inicial (m/s)', answer: v0, tol: 0.05 },
          { key: 'a', type: 'number', label: 'Aceleración (m/s², con signo)', answer: a, tol: 0.02 },
        ],
        solution: `<p>Sistema de referencia: origen donde empieza a frenar, sentido positivo el del movimiento. $v_f=0$.</p>
<p>Con $a=\\dfrac{v_f-v_0}{t}=\\dfrac{v_f^2-v_0^2}{2(x_f-x_0)}$ y $v_f=0$: $-\\dfrac{v_0}{t}=-\\dfrac{v_0^2}{2\\,${d}}\\Rightarrow v_0=\\dfrac{2\\cdot ${d}}{${t}}=${tex(v0)}$ m/s.</p>
<p>Aceleración: $a=\\dfrac{0-${tex(v0)}}{${t}}=${tex(a)}\\,m/s^2$ (desaceleración de ${fmt(-a)} m/s²).</p>`,
        chart: velChart((u) => v0 + a * u, t),
      };
    }
    const a = rng.pick([2, 4, 5, 10, 20]); const t = rng.pick([6, 8, 10, 12, 15]);
    return {
      topic: 'Cinemática', title: 'MRUV desde el reposo',
      hint: 'Parte del reposo ⇒ v₀ = 0. v(t) = a·t y x(t) = ½·a·t².',
      statement: `<p>Un móvil parte del reposo con una aceleración de ${a} m/s² constante. ¿Qué velocidad tendrá después de ${t} s? ¿Qué espacio recorrió en esos ${t} s?</p>`,
      items: [
        { key: 'v', type: 'number', label: `Velocidad a los ${t} s (m/s)`, answer: a * t, tol: 0.05 },
        { key: 'x', type: 'number', label: `Distancia recorrida (m)`, answer: 0.5 * a * t * t, tol: 0.5 },
      ],
      solution: `$$x(t)=x_0+v_0t+\\tfrac12at^2=\\tfrac12\\cdot ${a}\\,t^2\\qquad v(t)=v_0+at=${a}\\,t$$
<p>$v(${t})=${a}\\cdot ${t}=${a * t}$ m/s; $x(${t})=\\tfrac12\\cdot ${a}\\cdot ${t}^2=${0.5 * a * t * t}$ m.</p>`,
      chart: kinChart((u) => 0.5 * a * u * u, null, t),
    };
  };

  /* ======================= 7. MRU ======================= */
  G.fisica.mru = function (rng) {
    const variant = rng.int(0, 1);
    if (variant === 0) {
      const d = rng.pick([300, 500, 600, 900]), v1 = rng.pick([60, 80, 100]), v2 = rng.pick([90, 120, 140]);
      const t = d / (v1 + v2), x = v1 * t;
      return {
        topic: 'Cinemática', title: 'MRU: encuentro de dos móviles',
        hint: 'Sistema de referencia en A, positivo hacia B. x_A = v_A·t; x_B = d − v_B·t. Encuentro: x_A = x_B.',
        statement: `<p>Dos automóviles distan entre sí ${d} km y arrancan al mismo tiempo en sentidos contrarios. Uno arranca del punto <b>A</b> y marcha a ${v1} km/h y el otro de <b>B</b> a ${v2} km/h. Averigüe:</p><ol class="list-[lower-alpha] pl-6"><li>¿Cuánto tardarán en encontrarse?</li><li>¿A qué distancia de A se encuentran?</li></ol><p class="hint">Establezca un sistema de referencia.</p>`,
        items: [
          { key: 't', type: 'number', label: 'a) Tiempo (h)', answer: t, tol: 0.02 },
          { key: 'x', type: 'number', label: 'b) Distancia desde A (km)', answer: x, tol: 0.5 },
        ],
        solution: `<p>Origen en A, sentido positivo hacia B. $x_A(t)=${v1}t$, $x_B(t)=${d}-${v2}t$.</p>
<p>Encuentro: $${v1}t=${d}-${v2}t\\Rightarrow t=\\dfrac{${d}}{${v1 + v2}}=${tex(t)}$ h. Posición: $x=${v1}\\cdot ${tex(t)}=${tex(x, 1)}$ km desde A.</p>`,
        chart: C().linesChart([{ label: 'A', f: (u) => v1 * u, color: '#00455C' }, { label: 'B', f: (u) => d - v2 * u, color: '#d97706' }], { xMin: 0, xMax: t * 1.5, xLabel: 't (h)', yLabel: 'x (km)', points: [{ x: t, y: x, label: 'Encuentro' }] }),
      };
    }
    const d1 = rng.pick([200, 300, 400]), d2 = rng.pick([200, 300, 400, 500]), va = rng.pick([80, 100, 110]), vb = rng.pick([120, 130, 140]);
    const t1 = d1 / va, t2 = d2 / vb, vm = (d1 + d2) / (t1 + t2);
    return {
      topic: 'Cinemática', title: 'MRU: velocidad promedio',
      hint: 'Velocidad promedio = distancia total / tiempo total (NO el promedio de las velocidades). Calculá el tiempo de cada tramo con t = d/v.',
      statement: `<p>Un ${rng.pick(['transporte de pasajeros de larga distancia', 'camión con acoplado'])} recorrió ${d1 + d2} km en línea recta, los primeros ${d1} km marchó a ${va} km/h y el último tramo marchó a ${vb} km/h. ¿Cuál es la velocidad promedio en todo el trayecto? Establezca un sistema de referencia.</p>`,
      items: [
        { key: 't1', type: 'number', label: 'Tiempo del primer tramo (h)', answer: t1, tol: 0.02 },
        { key: 't2', type: 'number', label: 'Tiempo del segundo tramo (h)', answer: t2, tol: 0.02 },
        { key: 'v', type: 'number', label: 'Velocidad promedio (km/h)', answer: vm, tol: 0.5 },
      ],
      solution: `<p>Tramo 1: $\\Delta t_1=\\dfrac{${d1}}{${va}}=${tex(t1)}$ h. Tramo 2: $\\Delta t_2=\\dfrac{${d2}}{${vb}}=${tex(t2)}$ h.</p>
$$\\bar v=\\frac{\\Delta x}{\\Delta t}=\\frac{${d1 + d2}\\ km}{${tex(t1)}\\ h+${tex(t2)}\\ h}=${tex(vm, 1)}\\ km/h$$`,
    };
  };

  /* ======================= 8. GRÁFICO x(t) ======================= */
  G.fisica.graficoXT = function (rng) {
    const b1 = rng.pick([-60, -40, -20, 0]), v1 = rng.pick([20, 30, 40, 50]);
    const b2 = rng.pick([40, 60, 80, 100]), v2 = -rng.pick([10, 20, 30]);
    const te = (b2 - b1) / (v1 - v2), xe = b1 + v1 * te;
    const opts = ['MRU (velocidad constante)', 'MRUV acelerado', 'MRUV desacelerado', 'Reposo'];
    return {
      topic: 'Cinemática', title: 'Gráfico posición-tiempo',
      hint: 'En un gráfico x(t), una recta ⇒ MRU y su pendiente es la velocidad (Δx/Δt). El encuentro es la intersección de las rectas.',
      statement: `<p>Dos automóviles se mueven sobre una misma trayectoria rectilínea; sus posiciones están indicadas en la gráfica. Determine:</p><ol class="list-[lower-alpha] pl-6"><li>El tipo de movimiento que lleva cada automóvil y la velocidad de cada uno.</li><li>El instante en que ambos automóviles se encuentran.</li><li>La posición del encuentro.</li></ol>`,
      qchart: C().linesChart([{ label: 'Auto 1', f: (t) => b1 + v1 * t, color: '#00455C' }, { label: 'Auto 2', f: (t) => b2 + v2 * t, color: '#d97706' }], { xMin: 0, xMax: Math.ceil(te * 2), xLabel: 't (s)', yLabel: 'x (m)', grid: true }),
      items: [
        { key: 'tipo', type: 'choice', label: 'a) Tipo de movimiento', options: opts, answer: 0 },
        { key: 'v1', type: 'number', label: 'a) Velocidad del auto 1 (m/s)', answer: v1, tol: 0.5 },
        { key: 'v2', type: 'number', label: 'a) Velocidad del auto 2 (m/s, con signo)', answer: v2, tol: 0.5 },
        { key: 't', type: 'number', label: 'b) Instante del encuentro (s)', answer: te, tol: 0.05 },
        { key: 'x', type: 'number', label: 'c) Posición del encuentro (m)', answer: xe, tol: 0.5 },
      ],
      solution: `<p><b>a)</b> Ambas gráficas son rectas ⇒ MRU. Pendiente = velocidad. Auto 1 pasa por $(0;${b1})$ y $(1;${b1 + v1})$: $v_1=${v1}$ m/s. Auto 2: $x_2(0)=${b2}$ y decrece ${-v2} m por segundo: $v_2=${v2}$ m/s.</p>
$$x_1(t)=${b1}+${v1}t\\qquad x_2(t)=${b2}${v2}t$$
<p><b>b)</b> $x_1=x_2\\Rightarrow ${b1}+${v1}t=${b2}${v2}t\\Rightarrow ${v1 - v2}t=${b2 - b1}\\Rightarrow t=${tex(te)}$ s.</p>
<p><b>c)</b> $x=${b1}+${v1}\\cdot ${tex(te)}=${tex(xe)}$ m.</p>`,
    };
  };
})(window);
