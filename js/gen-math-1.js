/* ==========================================================================
   gen-math-1.js — Generadores de Matemática (Noción de Precálculo)
   Parte 1: cálculo numérico, notación científica, vectores, desplazamientos,
   polinomios, inecuaciones y ecuaciones.
   Cada generador recibe un RNG y devuelve un objeto "ejercicio".
   ========================================================================== */
(function (global) {
  'use strict';
  const { tex, texSigned, texSC, texPoly, texFrac, texVec, fmt, round, quadRoots, polyMul, polyDiv, polyEval, toDeg, toRad, degNorm } = global.U;
  const G = global.GEN = global.GEN || {};
  G.math = G.math || {};

  const kx = (a, v = 'k') => (a === 0 ? v : `${v}${texSigned(a)}`);
  const ruffiniTable = (coefs, r) => {
    // devuelve {html, q, rest}
    const row = [];
    let acc = 0;
    const mult = [];
    coefs.forEach((c, i) => {
      if (i === 0) { row.push(c); acc = c; mult.push(''); }
      else { const m = acc * r; mult.push(m); acc = c + m; row.push(acc); }
    });
    const q = row.slice(0, -1), rest = row[row.length - 1];
    const cells = (arr) => arr.map((v) => `<td class="px-3 py-1 text-center">${v === '' ? '' : fmt(v)}</td>`).join('');
    const html = `<table class="ruffini mx-auto my-2 text-sm font-mono"><tbody>
      <tr><td class="px-3 py-1"></td>${cells(coefs)}</tr>
      <tr class="border-b border-slate-400"><td class="px-3 py-1 font-bold">${fmt(r)}</td>${cells(mult)}</tr>
      <tr><td class="px-3 py-1"></td>${cells(row)}</tr></tbody></table>`;
    return { html, q, rest };
  };
  const factorTex = (a, roots) => {
    const m = new Map();
    roots.forEach((r) => m.set(r, (m.get(r) || 0) + 1));
    let s = (a === 1 ? '' : a === -1 ? '-' : tex(a));
    [...m.entries()].sort((p, q) => p[0] - q[0]).forEach(([r, k]) => {
      const inner = r === 0 ? 'x' : `(x${texSigned(-r)})`;
      s += k > 1 ? `${inner}^{${k}}` : inner;
    });
    return s;
  };

  /* ======================= 1. CÁLCULO NUMÉRICO ======================= */
  G.math.calculoNumerico = function (rng) {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      // ∛(k³/1000)·(a²/100)^(-1/2) + 1/(c+√((-1)²))·√( (d²/100) / (1/e²) )
      const k = rng.pick([2, 3, 4, 5]), a = rng.pick([3, 4, 5, 6, 8, 9]);
      const c = rng.int(1, 4), d = rng.pick([3, 4, 5, 6, 7, 8, 9]), e = rng.pick([2, 3, 4, 5]);
      const value = k / a + (d * e) / (10 * (c + 1));
      const dec1 = (k ** 3 / 1000), dec2 = (a * a / 100), dec3 = (d * d / 100);
      const expr = `\\sqrt[3]{${tex(dec1, 3)}}\\cdot(${tex(dec2, 2)})^{-\\frac{1}{2}}+\\frac{1}{${c}+\\sqrt{(-1)^2}}\\cdot\\sqrt{\\dfrac{${tex(dec3, 2)}}{\\frac{1}{${e * e}}}}`;
      return {
        topic: 'Cálculo numérico', title: 'Operaciones con potencias y raíces',
        hint: 'Pasá decimales a fracción (0,027 = 27/1000), exponente negativo = inverso, exponente 1/2 = raíz. Resolvé de adentro hacia afuera.',
        statement: `<p>Resuelva, realizando los cálculos pertinentes en la hoja que justifiquen su respuesta:</p>$$${expr}$$<p class="hint">Exprese el resultado como fracción irreducible o decimal.</p>`,
        items: [{ key: 'r', type: 'number', label: 'Resultado', answer: value, tol: 0.011 }],
        solution: `<p>Pasamos los decimales a fracción y aplicamos propiedades:</p>
$$\\sqrt[3]{\\tfrac{${k ** 3}}{1000}}\\cdot\\left(\\tfrac{${a * a}}{100}\\right)^{-\\frac12}=\\tfrac{${k}}{10}\\cdot\\tfrac{10}{${a}}=\\tfrac{${k}}{${a}}$$
$$\\frac{1}{${c}+1}\\cdot\\sqrt{\\tfrac{${d * d}}{100}\\cdot ${e * e}}=\\tfrac{1}{${c + 1}}\\cdot\\tfrac{${d}}{10}\\cdot ${e}=\\tfrac{${d * e}}{${10 * (c + 1)}}$$
<p>Sumando:</p>$$\\tfrac{${k}}{${a}}+\\tfrac{${d * e}}{${10 * (c + 1)}}=${texFrac(value, 400)}\\approx ${tex(value, 3)}$$`,
      };
    }
    if (variant === 1) {
      // ( (√(a⁻²)+√(b⁻²))² ÷ (p/q) + ⁴√( (-1)⁴·j⁴ / (n⁵·n⁻³·n²) ) )⁻¹
      const a = rng.pick([2, 3, 4, 6]), b = rng.pick([2, 3, 6]);
      const s1 = 1 / a + 1 / b; const sq = s1 * s1;
      const pq = rng.pick([[4, 3], [2, 3], [4, 9], [8, 9], [16, 9], [64, 45]]);
      const j = rng.pick([2, 3]), n = rng.pick([2, 3, 5]);
      const t1 = sq / (pq[0] / pq[1]); const t2 = j / n;
      const value = 1 / (t1 + t2);
      const expr = `\\left(\\dfrac{\\left(\\sqrt{${a * a}^{-1}}+\\sqrt{${b * b}^{-1}}\\right)^2}{\\frac{${pq[0]}}{${pq[1]}}}+\\sqrt[4]{\\dfrac{(-1)^4\\cdot ${j * j}^{2}}{${n}^{5}\\cdot ${n}^{-3}\\cdot ${n}^{2}}}\\right)^{-1}`;
      return {
        topic: 'Cálculo numérico', title: 'Operaciones con potencias y raíces',
        hint: 'Pasá decimales a fracción (0,027 = 27/1000), exponente negativo = inverso, exponente 1/2 = raíz. Resolvé de adentro hacia afuera.',
        statement: `<p>Resuelva, realizando los cálculos pertinentes en la hoja que justifiquen su respuesta:</p>$$${expr}$$`,
        items: [{ key: 'r', type: 'number', label: 'Resultado', answer: value, tol: 0.011 }],
        solution: `<p>Primer término: $\\sqrt{${a * a}^{-1}}=\\tfrac{1}{${a}}$ y $\\sqrt{${b * b}^{-1}}=\\tfrac{1}{${b}}$, luego $\\left(\\tfrac1{${a}}+\\tfrac1{${b}}\\right)^2=${texFrac(sq, 400)}$ y dividiendo por $\\tfrac{${pq[0]}}{${pq[1]}}$ queda $${texFrac(t1, 600)}$.</p>
<p>Segundo término: $${n}^{5}\\cdot ${n}^{-3}\\cdot ${n}^{2}=${n}^{4}$, entonces $\\sqrt[4]{\\tfrac{${j ** 4}}{${n}^4}}=\\tfrac{${j}}{${n}}$.</p>
<p>Suma: $${texFrac(t1, 600)}+\\tfrac{${j}}{${n}}=${texFrac(t1 + t2, 900)}$ y el inverso multiplicativo es</p>$$${texFrac(value, 900)}\\approx ${tex(value, 3)}$$`,
      };
    }
    // Verificar igualdad con radicales: (√(2k) − 1)/3 = (2√k − √2)/√18
    const k = rng.pick([2, 3, 5, 6, 7, 10]);
    const isTrue = rng.bool(0.5);
    const lhsDen = isTrue ? 3 : rng.pick([2, 4]);
    const lhs = (Math.sqrt(2 * k) - 1) / lhsDen;
    const rhs = (2 * Math.sqrt(k) - Math.SQRT2) / Math.sqrt(18);
    return {
      topic: 'Cálculo numérico', title: 'Verificación de igualdad con radicales',
        hint: 'Racionalizá: √18 = 3√2. Separá la fracción en dos términos y simplificá cada uno.',
      statement: `<p>Verifique si es válida la siguiente igualdad, operando y racionalizando donde corresponda:</p>$$\\frac{\\sqrt{${2 * k}}-1}{${lhsDen}}=\\frac{2\\sqrt{${k}}-\\sqrt{2}}{\\sqrt{18}}$$`,
      items: [
        { key: 'vf', type: 'choice', label: '¿La igualdad es válida?', options: ['Verdadera', 'Falsa'], answer: isTrue ? 0 : 1 },
        { key: 'v', type: 'number', label: 'Valor numérico del miembro derecho', answer: rhs, tol: 0.011 },
      ],
      solution: `<p>Trabajamos el miembro derecho: $\\sqrt{18}=3\\sqrt2$, entonces</p>
$$\\frac{2\\sqrt{${k}}-\\sqrt2}{3\\sqrt2}=\\frac{2\\sqrt{${k}}}{3\\sqrt2}-\\frac{1}{3}=\\frac{2\\sqrt{${k}}\\sqrt2}{3\\cdot 2}-\\frac13=\\frac{\\sqrt{${2 * k}}-1}{3}\\approx ${tex(rhs, 3)}$$
<p>El miembro izquierdo vale $\\frac{\\sqrt{${2 * k}}-1}{${lhsDen}}\\approx ${tex(lhs, 3)}$. Por lo tanto la igualdad es <b>${isTrue ? 'verdadera' : 'falsa'}</b>.</p>`,
    };
  };

  /* ======================= 2. NOTACIÓN CIENTÍFICA ======================= */
  G.math.notacionCientifica = function (rng) {
    const pool = [
      { t: 'Masa del protón', v: 1.6726e-27, txt: '0,0000000000000000000000000016726 kg', m: 1.6726, e: -27 },
      { t: 'Distancia de la Tierra al Sol', v: 1.5e8, txt: '150.000.000 km', m: 1.5, e: 8 },
      { t: 'Masa de la Luna', v: 7.4e19, txt: '74.000.000.000.000.000.000 toneladas', m: 7.4, e: 19 },
      { t: 'Tamaño de un virus', v: 1.5e-5, txt: '0,000015 mm', m: 1.5, e: -5 },
      { t: 'Número de Avogadro', v: 6.023e23, txt: '602.300.000.000.000.000.000.000', m: 6.023, e: 23 },
      { t: 'Volumen de la pirámide de Keops', v: 2.37e-3, txt: '0,00237 km³', m: 2.37, e: -3 },
      { t: 'Distancia', v: 4.58e-7, txt: '0,000000458 metros', m: 4.58, e: -7 },
      { t: 'Masa de la Tierra', v: 5.97e24, txt: '5.970.000.000.000.000.000.000.000 kg', m: 5.97, e: 24 },
      { t: 'Diámetro de un glóbulo rojo', v: 7.5e-6, txt: '0,0000075 m', m: 7.5, e: -6 },
      { t: 'Velocidad de la luz', v: 3e8, txt: '300.000.000 m/s', m: 3, e: 8 },
      { t: 'Carga del electrón', v: 1.6e-19, txt: '0,00000000000000000016 C', m: 1.6, e: -19 },
    ];
    const [q1, q2] = rng.sample(pool, 2);
    return {
      topic: 'Notación científica', title: 'Expresar cantidades en notación científica',
      hint: 'Corré la coma hasta dejar una sola cifra distinta de cero adelante; contá los lugares: exponente positivo si el número es grande, negativo si es chico.',
      statement: `<p>Exprese en notación científica ($m\\times10^{n}$, con $1\\le m<10$) las siguientes cantidades:</p>
<ul><li><b>${q1.t}:</b> ${q1.txt}</li><li><b>${q2.t}:</b> ${q2.txt}</li></ul>`,
      items: [
        { key: 'm1', type: 'number', label: `${q1.t} — mantisa m`, answer: q1.m, tol: 0.006 },
        { key: 'e1', type: 'number', label: `${q1.t} — exponente n`, answer: q1.e, tol: 0 },
        { key: 'm2', type: 'number', label: `${q2.t} — mantisa m`, answer: q2.m, tol: 0.006 },
        { key: 'e2', type: 'number', label: `${q2.t} — exponente n`, answer: q2.e, tol: 0 },
      ],
      solution: `<p>Se corre la coma hasta dejar una sola cifra distinta de cero a la izquierda y se cuenta la cantidad de lugares corridos (positivo si el número es grande, negativo si es pequeño).</p>
$$${q1.t}: ${tex(q1.m, 4)}\\times10^{${q1.e}}$$$$${q2.t}: ${tex(q2.m, 4)}\\times10^{${q2.e}}$$`,
    };
  };

  /* ======================= 3. VECTORES ======================= */
  G.math.vectoresParametro = function (rng) {
    // p = (k + a ; b), q = (k ; k + c) perpendiculares → k² + (a+b)k + bc = 0
    let b, c, r1, r2, a, tries = 0;
    do {
      b = rng.intNZ(-3, 3); c = rng.intNZ(-4, 4);
      const prod = b * c;
      const divs = [];
      for (let d = -12; d <= 12; d++) if (d !== 0 && prod % d === 0) divs.push(d);
      r1 = rng.pick(divs); r2 = prod / r1;
      a = -(r1 + r2) - b;
      tries++;
    } while ((r1 === r2 || Math.abs(a) > 6) && tries < 50);
    const ks = [r1, r2].sort((x, y) => x - y);
    const sum = (k) => [k + a + k, b + k + c];
    const pTex = `\\vec p=(${kx(a)}\\,;\\,${b})`, qTex = `\\vec q=(k\\,;\\,${kx(c)})`;
    return {
      topic: 'Vectores', title: 'Perpendicularidad con parámetro',
        hint: 'Perpendiculares ⇔ producto escalar nulo: p·q = p₁q₁ + p₂q₂ = 0 → ecuación cuadrática en k (resolvente).',
      statement: `<p>Halle el o los valores del parámetro "k" para que los vectores sean perpendiculares:</p>$$${pTex}\\qquad ${qTex}$$<p>Para el o los valores hallados de "k", calcule $\\vec p+\\vec q$.</p>`,
      items: [
        { key: 'k', type: 'set', label: 'Valores de k', answer: ks, slots: 2, labels: ['k₁', 'k₂'] },
        { key: 's1', type: 'vector', label: `p + q para el menor valor de k (k = ${fmt(ks[0])})`, answer: sum(ks[0]) },
        { key: 's2', type: 'vector', label: `p + q para el mayor valor de k (k = ${fmt(ks[1])})`, answer: sum(ks[1]) },
      ],
      solution: `<p>Dos vectores son perpendiculares cuando su producto escalar es nulo:</p>
$$\\vec p\\cdot\\vec q=(${kx(a)})\\,k+${b}\\,(${kx(c)})=0$$
$$k^2${texSC(a + b)}k${texSigned(b * c)}=0\\ \\Rightarrow\\ k_1=${tex(ks[0])},\\ k_2=${tex(ks[1])}$$
<p>Si $k=${tex(ks[0])}$: $\\vec p=${texVec(ks[0] + a, b)}$, $\\vec q=${texVec(ks[0], ks[0] + c)}$ y $\\vec p+\\vec q=${texVec(...sum(ks[0]))}$.</p>
<p>Si $k=${tex(ks[1])}$: $\\vec p=${texVec(ks[1] + a, b)}$, $\\vec q=${texVec(ks[1], ks[1] + c)}$ y $\\vec p+\\vec q=${texVec(...sum(ks[1]))}$.</p>`,
    };
  };

  G.math.vectoresModulo = function (rng) {
    const variant = rng.int(0, 1);
    if (variant === 0) {
      // u=(a;b) ⊥ w=(x;y), |w| = m·√(a²+b²)
      const tri = rng.pick([[3, 4, 5], [4, 3, 5], [5, 12, 13], [12, 5, 13], [8, 15, 17], [6, 8, 10]]);
      const sgn = rng.sign();
      const u = [tri[0], sgn * tri[1]];
      const m = rng.pick([1, 2, 3]);
      const mod = m * tri[2];
      const w1 = [-u[1] * m, u[0] * m], w2 = [u[1] * m, -u[0] * m];
      return {
        topic: 'Vectores', title: 'Vector perpendicular con módulo dado',
        hint: 'Dos condiciones: producto escalar = 0 y x² + y² = |w|². Despejá una variable y reemplazá.',
        statement: `<p>Considerando que los vectores $\\vec u=${texVec(u[0], u[1])}$ y $\\vec w=(x\\,;\\,y)$ son perpendiculares y que el módulo de $\\vec w$ es $|\\vec w|=${mod}$, calcule las componentes posibles para el vector $\\vec w$.</p>`,
        items: [{ key: 'w', type: 'vectorset', label: 'Vectores posibles', answer: [w1, w2], labels: ['w₁', 'w₂'] }],
        solution: `<p>Planteamos el sistema: perpendicularidad $\\Rightarrow ${u[0]}x${texSC(u[1])}y=0$ y módulo $\\Rightarrow x^2+y^2=${mod * mod}$.</p>
<p>De la primera: $y=${texFrac(-u[0] / u[1])}\\,x$. Reemplazando en la segunda:</p>
$$x^2\\left(1+${texFrac((u[0] * u[0]) / (u[1] * u[1]))}\\right)=${mod * mod}\\ \\Rightarrow\\ x=\\pm ${Math.abs(w1[0])}$$
<p>Luego $\\vec w_1=${texVec(w1[0], w1[1])}$ o $\\vec w_2=${texVec(w2[0], w2[1])}$. Verificación: $\\vec u\\cdot\\vec w_1=${u[0] * w1[0]}${texSigned(u[1] * w1[1])}=0$ ✓</p>`,
        figure: global.C && global.C.vectorsSVG ? global.C.vectorsSVG([{ x: u[0], y: u[1], label: 'u', color: '#00455C' }, { x: w1[0], y: w1[1], label: 'w₁', color: '#d97706' }, { x: w2[0], y: w2[1], label: 'w₂', color: '#0e7490' }]) : null,
      };
    }
    // u = (x ; x + a), w = (b x + c ; −x) mismo módulo, x entero
    let a, b, c, xi, xo, tries = 0;
    do {
      a = rng.intNZ(-4, 4); b = rng.pick([2, 3]); c = rng.intNZ(-5, 5);
      const s1 = (c - a) / (1 - b);          // x + a = bx + c
      const s2 = -(a + c) / (1 + b);         // x + a = -(bx + c)
      const ints = [s1, s2].filter((v) => Number.isInteger(v) && v !== 0);
      const nonInts = [s1, s2].filter((v) => !Number.isInteger(v));
      if (ints.length === 1 && nonInts.length === 1) { xi = ints[0]; xo = nonInts[0]; break; }
      tries++;
    } while (tries < 200);
    if (xi === undefined) { a = 2; b = 2; c = -4; xi = 6; xo = 2 / 3; }
    const u = [xi, xi + a], w = [b * xi + c, -xi];
    const modv = Math.hypot(u[0], u[1]);
    return {
      topic: 'Vectores', title: 'Vectores con el mismo módulo',
        hint: 'Igualá los módulos al cuadrado: x² + (x+a)² = (bx+c)² + x². Queda una ecuación cuadrática; elegí la solución entera.',
      statement: `<p>Los vectores $\\vec u=(x\\,;\\,${kx(a, 'x')})$ y $\\vec w=(${b}x${texSigned(c)}\\,;\\,-x)$ tienen el mismo módulo. Halle el valor de "x" sabiendo que es un número entero. Luego exprese cada vector y represéntelos gráficamente.</p>`,
      items: [
        { key: 'x', type: 'number', label: 'Valor de x (entero)', answer: xi, tol: 0 },
        { key: 'u', type: 'vector', label: 'Vector u', answer: u },
        { key: 'w', type: 'vector', label: 'Vector w', answer: w },
        { key: 'm', type: 'number', label: 'Módulo común |u| = |w|', answer: modv },
      ],
      solution: `<p>Igualamos módulos al cuadrado: $x^2+(${kx(a, 'x')})^2=(${b}x${texSigned(c)})^2+x^2$, es decir $(${kx(a, 'x')})^2=(${b}x${texSigned(c)})^2$.</p>
<p>Entonces $${kx(a, 'x')}=\\pm(${b}x${texSigned(c)})$, que da $x=${tex(xi)}$ (entero) o $x=${texFrac(xo)}$ (se descarta por no ser entero).</p>
$$\\vec u=${texVec(u[0], u[1])}\\qquad \\vec w=${texVec(w[0], w[1])}\\qquad |\\vec u|=|\\vec w|=\\sqrt{${u[0] * u[0] + u[1] * u[1]}}\\approx ${tex(modv)}$$`,
      figure: global.C && global.C.vectorsSVG ? global.C.vectorsSVG([{ x: u[0], y: u[1], label: 'u', color: '#00455C' }, { x: w[0], y: w[1], label: 'w', color: '#d97706' }]) : null,
    };
  };

  G.math.vectoresOperaciones = function (rng) {
    const a = [rng.intNZ(-4, 4), rng.intNZ(-4, 4)], b = [rng.intNZ(-4, 4), rng.intNZ(-4, 4)], c = [rng.intNZ(-3, 3), rng.intNZ(-3, 3)];
    const n = rng.pick([2, 3, -2]), m = rng.pick([-1, 2, -3]);
    const sum = [a[0] + b[0] + c[0], a[1] + b[1] + c[1]];
    const comb = [n * c[0] - m * a[0] + m * b[0], n * c[1] - m * a[1] + m * b[1]];
    const dot = a[0] * b[0] + a[1] * b[1];
    const ma = Math.hypot(...a), mb = Math.hypot(...b), mc = Math.hypot(...c);
    const ang = toDeg(Math.acos(Math.max(-1, Math.min(1, dot / (ma * mb)))));
    const k = rng.pick([5, 10, 4]);
    const dir = [k * c[0] / mc, k * c[1] / mc];
    return {
      topic: 'Vectores', title: 'Operaciones con vectores',
        hint: 'Suma componente a componente. Ángulo: cos α = (a·b)/(|a||b|). Versor: dividí el vector por su módulo. Perpendicular: invertí componentes y cambiá un signo.',
      statement: `<p>Dados los vectores $\\vec a=${texVec(...a)}$, $\\vec b=${texVec(...b)}$, $\\vec c=${texVec(...c)}$ y los escalares $n=${n}$ y $m=${m}$, calcule:</p>
<ul><li>El vector suma $\\vec a+\\vec b+\\vec c$, analítica y gráficamente.</li><li>El vector $n\\cdot\\vec c-m\\cdot\\vec a+m\\cdot\\vec b$.</li><li>El ángulo que forman los vectores $\\vec a$ y $\\vec b$.</li><li>Un vector de igual dirección y sentido que $\\vec c$, pero de módulo igual a ${k}.</li><li>Un vector perpendicular al vector $\\vec a$.</li></ul>`,
      items: [
        { key: 's', type: 'vector', label: 'a + b + c', answer: sum },
        { key: 'l', type: 'vector', label: 'n·c − m·a + m·b', answer: comb },
        { key: 'ang', type: 'number', label: 'Ángulo entre a y b (grados)', answer: ang, tol: 0.6, unit: '°' },
        { key: 'd', type: 'vector', label: `Vector de módulo ${k} en la dirección de c`, answer: dir, tol: 0.02 },
        { key: 'p', type: 'vector', label: 'Vector perpendicular a a (cualquiera válido)', check: (x, y) => Math.abs(a[0] * x + a[1] * y) < 1e-6 && (x !== 0 || y !== 0), answerText: `por ejemplo (${fmt(-a[1])} ; ${fmt(a[0])})` },
      ],
      solution: `<p><b>Suma:</b> $\\vec a+\\vec b+\\vec c=${texVec(...sum)}$.</p>
<p><b>Combinación:</b> $${n}\\,${texVec(...c)}${m < 0 ? '+' : '-'}${Math.abs(m)}\\,${texVec(...a)}${m < 0 ? '-' : '+'}${Math.abs(m)}\\,${texVec(...b)}=${texVec(...comb)}$.</p>
<p><b>Ángulo:</b> $\\cos\\alpha=\\dfrac{\\vec a\\cdot\\vec b}{|\\vec a||\\vec b|}=\\dfrac{${dot}}{\\sqrt{${a[0] ** 2 + a[1] ** 2}}\\sqrt{${b[0] ** 2 + b[1] ** 2}}}\\Rightarrow\\alpha\\approx ${tex(ang, 1)}^\\circ$.</p>
<p><b>Misma dirección que c, módulo ${k}:</b> $${k}\\cdot\\dfrac{\\vec c}{|\\vec c|}=${k}\\cdot\\dfrac{${texVec(...c)}}{\\sqrt{${c[0] ** 2 + c[1] ** 2}}}\\approx ${texVec(dir[0], dir[1])}$.</p>
<p><b>Perpendicular a a:</b> se intercambian las componentes y se cambia un signo, por ejemplo $${texVec(-a[1], a[0])}$; verificación: $\\vec a\\cdot\\vec d=${a[0]}\\cdot(${-a[1]})+(${a[1]})\\cdot ${a[0]}=0$ ✓</p>`,
      figure: global.C && global.C.vectorsSVG ? global.C.vectorsSVG([{ x: a[0], y: a[1], label: 'a', color: '#00455C' }, { x: b[0], y: b[1], label: 'b', color: '#0e7490' }, { x: c[0], y: c[1], label: 'c', color: '#7c3aed' }, { x: sum[0], y: sum[1], label: 'a+b+c', color: '#dc2626' }]) : null,
    };
  };

  /* ======================= 4. DESPLAZAMIENTOS ======================= */
  const DIRS = { N: 90, S: 270, E: 0, O: 180, NE: 45, NO: 135, SE: 315, SO: 225 };
  const DIRNAME = { N: 'Norte', S: 'Sur', E: 'Este', O: 'Oeste', NE: 'Noreste', NO: 'Noroeste', SE: 'Sureste', SO: 'Suroeste' };
  G.math.desplazamientos = function (rng, opts = {}) {
    const animal = rng.pick(['Una ardilla', 'Un coatí', 'Una zarigüeya', 'Un mensajero en bicicleta', 'Una lombriz', 'Un arácnido', 'Un cartero']);
    const unit = opts.unit || rng.pick(['metros', 'metros', 'cm']);
    const nLegs = rng.pick([3, 4]);
    const legs = [];
    const cardinals = rng.shuffle(['N', 'S', 'E', 'O']);
    const diag = rng.pick(['NE', 'NO', 'SE', 'SO']);
    for (let i = 0; i < nLegs; i++) {
      const dir = i === 1 ? diag : cardinals[i];
      let dist;
      if (opts.angled && i === 1) dist = rng.pick([40, 50, 60, 65, 100]);
      else dist = rng.pick([15, 20, 23, 25, 30, 40, 45, 50, 60, 65, 70, 80, 90]);
      const angle = (opts.angled && i === 1) ? rng.pick([30, 40, 45, 60, 120, 135, 210, 300]) : DIRS[dir];
      legs.push({ dir, dist, angle, angled: opts.angled && i === 1 });
    }
    const total = legs.reduce((s, l) => s + l.dist, 0);
    let rx = 0, ry = 0;
    legs.forEach((l) => { rx += l.dist * Math.cos(toRad(l.angle)); ry += l.dist * Math.sin(toRad(l.angle)); });
    const mod = Math.hypot(rx, ry);
    const ang = degNorm(toDeg(Math.atan2(ry, rx)));
    const legTxt = legs.map((l) => l.angled ? `${l.dist} ${unit} con un ángulo de ${l.angle}° respecto al eje de las "x" positivas` : `${l.dist} ${unit} al ${DIRNAME[l.dir]}`).join(', luego ');
    const legsTex = legs.map((l, i) => `\\vec d_{${i + 1}}=${l.dist}\\,(\\cos ${l.angle}^\\circ;\\,\\sin ${l.angle}^\\circ)=${texVec(l.dist * Math.cos(toRad(l.angle)), l.dist * Math.sin(toRad(l.angle)))}`).join('\\\\');
    return {
      topic: 'Vectores', title: 'Desplazamientos y vector resultante',
        hint: 'Descomponé cada tramo: (d·cos θ ; d·sen θ) con θ medido desde el Este. NE = 45°, NO = 135°, SO = 225°, SE = 315°. Sumá componentes; ángulo con arctan(y/x) ubicando el cuadrante.',
      statement: `<p>${animal} camina en busca de comida efectuando los siguientes desplazamientos: ${legTxt}. Calcule:</p>
<ul><li>La distancia recorrida.</li><li>El desplazamiento resultante, analítica y gráficamente (componentes y módulo).</li><li>El valor del ángulo formado con respecto al eje de abscisas positivo.</li></ul>
<p class="hint">Use un sistema de referencia con el Este en el sentido positivo de "x" y el Norte en el sentido positivo de "y". Observe la rosa de los vientos para las direcciones intermedias (NE, NO, SE, SO están a 45° de los ejes).</p>`,
      figure: global.C && global.C.compassSVG ? global.C.compassSVG() : null,
      items: [
        { key: 'd', type: 'number', label: `Distancia recorrida (${unit})`, answer: total, tol: 0.5 },
        { key: 'r', type: 'vector', label: `Desplazamiento resultante (componentes en ${unit})`, answer: [rx, ry], tol: 0.3 },
        { key: 'm', type: 'number', label: `Módulo del desplazamiento (${unit})`, answer: mod, tol: 0.3 },
        { key: 'a', type: 'number', label: 'Ángulo respecto del eje x positivo (grados, entre 0° y 360°)', answer: ang, tol: 0.6, unit: '°', check: (v) => Math.abs(degNorm(v) - ang) < 0.6 || Math.abs(degNorm(v) - ang) > 359.4 },
      ],
      solution: `<p><b>Distancia recorrida</b> (suma de los módulos): $${legs.map((l) => l.dist).join('+')}=${total}$ ${unit}.</p>
<p><b>Desplazamiento:</b> descomponemos cada tramo en componentes:</p>$$\\begin{gathered}${legsTex}\\end{gathered}$$
$$\\vec R=\\sum\\vec d_i=${texVec(rx, ry)}\\qquad |\\vec R|=\\sqrt{(${tex(rx)})^2+(${tex(ry)})^2}\\approx ${tex(mod)}\\ \\text{${unit}}$$
<p><b>Ángulo:</b> $\\varphi=\\arctan\\left(\\dfrac{${tex(ry)}}{${tex(rx)}}\\right)$ ubicado en el cuadrante correspondiente: $\\varphi\\approx ${tex(ang, 1)}^\\circ$.</p>`,
      figure2: global.C && global.C.chainSVG ? global.C.chainSVG(legs.map((l) => ({ dx: l.dist * Math.cos(toRad(l.angle)), dy: l.dist * Math.sin(toRad(l.angle)), label: `${l.dist}` })), { rx, ry }) : null,
    };
  };

  /* ======================= 5. POLINOMIOS ======================= */
  G.math.polinomioParametros = function (rng) {
    // P(x) = (pα+qβ)x³ + b x² + c x + (sα+tβ); P(1)=V y raíz r
    let best = null;
    for (let t = 0; t < 400 && !best; t++) {
      const A = rng.pick([1, 2, 3]);
      const r1 = rng.intNZ(-3, 3), r2 = rng.intNZ(-3, 3), r3 = rng.pick([r1, r2, rng.intNZ(-3, 3)]);
      const P = polyMul(polyMul([A, -r1], [1, -r2]), [1, -r3]);
      const D = P[3];
      if (D === 0) continue;
      const p = rng.intNZ(-4, 4), q = rng.intNZ(-4, 4), s = rng.intNZ(-4, 4), tt = rng.intNZ(-4, 4);
      const det = p * tt - q * s;
      if (det === 0) continue;
      const al = (A * tt - q * D) / det, be = (p * D - s * A) / det;
      if (!Number.isInteger(al) || !Number.isInteger(be) || al === 0 || be === 0 || Math.abs(al) > 6 || Math.abs(be) > 6) continue;
      best = { A, roots: [r1, r2, r3], P, p, q, s, t: tt, al, be };
    }
    if (!best) best = { A: 3, roots: [2, 2, -2], P: [3, -6, -12, 24], p: 4, q: 3, s: -3, t: 3, al: 3, be: -3 };
    const { A, roots, P, p, q, s, t, al, be } = best;
    const V = polyEval(P, 1);
    const r = roots[0];
    const lin = (u, v) => `(${u === 1 ? '' : u === -1 ? '-' : u}\\alpha${v === 1 ? '+' : v === -1 ? '-' : texSigned(v)}\\beta)`;
    const Ptex = `P(x)=${lin(p, q)}\\,x^3${texSC(P[1])}x^2${texSC(P[2])}x+${lin(s, t)}`;
    const ruf = ruffiniTable(P, r);
    const qr = quadRoots(ruf.q[0], ruf.q[1], ruf.q[2]);
    const sortedRoots = roots.slice().sort((x, y) => x - y);
    return {
      topic: 'Polinomios', title: 'Parámetros y factorización',
        hint: 'P(1) = valor y P(raíz) = 0 → sistema 2×2 en α y β. Luego Ruffini con la raíz conocida y resolvente para el cociente.',
      statement: `<p>El polinomio</p>$$${Ptex}$$<p>toma el valor ${fmt(V)} cuando $x=1$ y tiene a ${fmt(r)} como una de sus raíces. Encuentre los valores de los parámetros y factorice el polinomio.</p>`,
      items: [
        { key: 'al', type: 'number', label: 'α', answer: al, tol: 0 },
        { key: 'be', type: 'number', label: 'β', answer: be, tol: 0 },
        { key: 'A', type: 'number', label: 'Coeficiente principal del polinomio', answer: A, tol: 0 },
        { key: 'roots', type: 'set', label: 'Raíces (repita las múltiples)', answer: sortedRoots, slots: 3, labels: ['x₁', 'x₂', 'x₃'] },
      ],
      solution: `<p>Planteamos $P(1)=${fmt(V)}$ y $P(${fmt(r)})=0$ y obtenemos un sistema lineal en $\\alpha$ y $\\beta$:</p>
$$\\begin{cases}${lin(p, q)}${texSigned(P[1])}${texSigned(P[2])}+${lin(s, t)}=${tex(V)}\\\\ ${lin(p, q)}\\cdot ${tex(r ** 3)}${texSigned(P[1] * r * r)}${texSigned(P[2] * r)}+${lin(s, t)}=0\\end{cases}$$
<p>Resolviendo: $\\alpha=${tex(al)}$ y $\\beta=${tex(be)}$. Entonces $P(x)=${texPoly(P)}$.</p>
<p>Dividimos por Ruffini entre $(x${texSigned(-r)})$:</p>${ruf.html}
<p>El cociente $${texPoly(ruf.q)}$ tiene raíces $${qr.map((v) => tex(v)).join('$ y $')}$. Por lo tanto:</p>$$P(x)=${factorTex(A, roots)}$$`,
    };
  };

  G.math.polinomioDivisible = function (rng) {
    const cubic = rng.bool(0.6);
    if (cubic) {
      // P(x) = x³ − k x² + k x + c divisible por (x − r)
      const r = rng.pick([-3, -2, -1, 2, 3]); const k = rng.intNZ(-4, 5);
      const c = k * r * r - k * r - r ** 3;
      const P = [1, -k, k, c];
      const ruf = ruffiniTable(P, r);
      return {
        topic: 'Polinomios', title: 'Divisibilidad y teorema del resto',
        hint: 'Teorema del resto: P(x) es divisible por (x − r) ⇔ P(r) = 0. Reemplazá x = r, despejá k y luego Ruffini para el cociente.',
        statement: `<p>Encuentre el o los valores del parámetro "k" para que el polinomio</p>$$P(x)=x^3-k\\,x^2+k\\,x${texSigned(c)}$$<p>sea divisible por $(x${texSigned(-r)})$. Luego exprese el cociente de la división entre ambos polinomios.</p>`,
        items: [
          { key: 'k', type: 'number', label: 'Valor de k', answer: k, tol: 0 },
          { key: 'q', type: 'poly', label: 'Cociente C(x) = a·x² + b·x + c', answer: ruf.q, degree: 2 },
        ],
        solution: `<p>Por el teorema del resto, $P$ es divisible por $(x${texSigned(-r)})$ si $P(${tex(r)})=0$:</p>
$$${tex(r ** 3)}-k\\cdot ${tex(r * r)}+k\\cdot(${tex(r)})${texSigned(c)}=0\\ \\Rightarrow\\ ${tex(-r * r + r)}\\,k=${tex(-(r ** 3) - c)}\\ \\Rightarrow\\ k=${tex(k)}$$
<p>Con $k=${tex(k)}$: $P(x)=${texPoly(P)}$. Dividimos por Ruffini:</p>${ruf.html}
$$C(x)=${texPoly(ruf.q)}\\qquad\\text{resto}=0$$`,
      };
    }
    // P(x) = x⁴ − k x³ + k x² + c divisible por (x + 1) → 1 + k + k + c = 0
    const c = rng.pick([-7, -5, -3, -1, 1, 3, 5, 7]);
    const k = -(1 + c) / 2;
    const P = [1, -k, k, 0, c];
    const ruf = ruffiniTable(P, -1);
    return {
      topic: 'Polinomios', title: 'Divisibilidad y teorema del resto',
        hint: 'Teorema del resto: P(x) es divisible por (x − r) ⇔ P(r) = 0. Reemplazá x = r, despejá k y luego Ruffini para el cociente.',
      statement: `<p>Encuentre el o los valores del parámetro "k" para que el polinomio</p>$$P(x)=x^4-k\\,x^3+k\\,x^2${texSigned(c)}$$<p>sea divisible por $(x+1)$. Luego exprese el cociente de la división entre ambos polinomios.</p>`,
      items: [
        { key: 'k', type: 'number', label: 'Valor de k', answer: k, tol: 0 },
        { key: 'q', type: 'poly', label: 'Cociente C(x) = a·x³ + b·x² + c·x + d', answer: ruf.q, degree: 3 },
      ],
      solution: `<p>Debe cumplirse $P(-1)=0$: $1+k+k${texSigned(c)}=0\\Rightarrow k=${tex(k)}$.</p>
<p>Con ese valor, $P(x)=${texPoly(P)}$. Ruffini con $r=-1$:</p>${ruf.html}$$C(x)=${texPoly(ruf.q)}$$`,
    };
  };

  G.math.polinomioGauss = function (rng) {
    const a = rng.pick([1, 2, 2, 3]);
    let roots;
    if (a === 1) roots = rng.sample([-4, -3, -2, -1, 1, 2, 3, 4, 5, 6], 3);
    else { const ints = rng.sample([-4, -3, -2, -1, 1, 2, 3, 4, 6], 2); roots = [...ints, rng.pick([1 / a, -1 / a])]; }
    roots.sort((x, y) => x - y);
    const P = polyMul(polyMul([a, -a * roots[0]], [1, -roots[1]]), [1, -roots[2]]).map((v) => Math.round(v));
    const ge = rng.bool();
    const [s1, s2, s3] = roots;
    const I = (l, r, lc = false, rc = false) => `${lc ? '[' : '('}${l === -Infinity ? '-\\infty' : texFrac(l)}\\,;\\,${r === Infinity ? '+\\infty' : texFrac(r)}${rc ? ']' : ')'}`;
    // a>0: P>0 en (s1,s2)∪(s3,∞); P<0 en (−∞,s1)∪(s2,s3)
    const pos = (c) => `${I(s1, s2, c, c)}\\cup ${I(s3, Infinity, c, false)}`;
    const neg = (c) => `${I(-Infinity, s1, false, c)}\\cup ${I(s2, s3, c, c)}`;
    const correct = ge ? pos(true) : neg(true);
    const options = rng.shuffle([correct, ge ? neg(true) : pos(true), ge ? pos(false) : neg(false), ge ? `${I(-Infinity, s1, false, true)}\\cup ${I(s3, Infinity, true, false)}` : `${I(s1, s3, true, true)}`]);
    const intRoot = roots.find((r) => Number.isInteger(r)) ?? roots[0];
    const ruf = ruffiniTable(P, intRoot);
    const rest = roots.filter((r) => r !== intRoot);
    const signRow = (vals) => vals.map((v) => `<td class="px-2 text-center">${v}</td>`).join('');
    const intervals = [`(-∞;${fmt(s1)})`, `(${fmt(s1)};${fmt(s2)})`, `(${fmt(s2)};${fmt(s3)})`, `(${fmt(s3)};+∞)`];
    const signs = ['−', '+', '−', '+'];
    return {
      topic: 'Polinomios', title: 'Factorización (Gauss) e inecuación polinómica',
        hint: 'Gauss: probá raíces ±p/q (p divide al término independiente, q al coeficiente principal). Ruffini + resolvente. Cuadro de signos para la inecuación.',
      statement: `<p>Dado el polinomio $P(x)=${texPoly(P)}$:</p><ul><li>Exprese al polinomio en forma factorizada aplicando el Teorema de Gauss.</li><li>Resuelva $P(x)${ge ? '\\ge' : '\\le'}0$ y obtenga la solución en notación de intervalos.</li></ul>`,
      items: [
        { key: 'roots', type: 'set', label: 'Raíces de P(x)', answer: roots, slots: 3, labels: ['x₁', 'x₂', 'x₃'] },
        { key: 'a', type: 'number', label: 'Coeficiente principal (factor común en la forma factorizada)', answer: a, tol: 0 },
        { key: 'sol', type: 'choice', label: `Conjunto solución de P(x) ${ge ? '≥' : '≤'} 0`, options: options.map((o) => `$${o}$`), answer: options.indexOf(correct) },
      ],
      solution: `<p>Por Gauss, las raíces racionales son de la forma $\\pm\\frac{p}{q}$ con $p$ divisor de ${Math.abs(P[3])} y $q$ divisor de ${a}. Probando, $P(${texFrac(intRoot)})=0$. Ruffini:</p>${ruf.html}
<p>El cociente $${texPoly(ruf.q)}$ tiene raíces $${rest.map((r) => texFrac(r)).join('$ y $')}$ (resolvente). Entonces</p>$$P(x)=${a === 1 ? '' : a}${roots.map((r) => `(x${texSigned(-r)})`).join('')}${a !== 1 ? `\\ \\text{(o bien } ${roots.map((r, i) => (Number.isInteger(r) ? `(x${texSigned(-r)})` : `(${a}x${texSigned(-r * a)})`)).join('')}\\text{)}` : ''}$$
<p><b>Cuadro de signos</b> (coeficiente principal positivo, el signo alterna en cada raíz simple):</p>
<table class="mx-auto my-2 text-sm"><tbody><tr>${signRow(intervals)}</tr><tr class="font-bold">${signRow(signs)}</tr></tbody></table>
<p>Luego $P(x)${ge ? '\\ge' : '\\le'}0$ en $${correct}$.</p>`,
    };
  };

  G.math.polinomioProductoCociente = function (rng) {
    const P = [rng.pick([1, 2, 3, 4]), rng.intNZ(-3, 3), rng.intNZ(-4, 4), rng.intNZ(-3, 3), rng.intNZ(-5, 5)];
    const Q = rng.bool() ? [1, 0, rng.pick([-2, -3, -4, 2, 3])] : [1, rng.intNZ(-4, 4), 0];
    const producto = rng.bool();
    if (producto) {
      const R = polyMul(P, Q);
      return {
        topic: 'Polinomios', title: 'Producto de polinomios',
        hint: 'Distributiva término a término y agrupá los de igual grado. Ordená de mayor a menor grado.',
        statement: `<p>Calcule el producto entre los polinomios $(${texPoly(P)})$ y $(${texPoly(Q)})$.</p>`,
        items: [{ key: 'r', type: 'poly', label: 'Producto (coeficientes de mayor a menor grado)', answer: R, degree: 6 }],
        solution: `<p>Aplicamos la propiedad distributiva multiplicando cada término del primero por cada término del segundo y agrupamos los términos semejantes:</p>$$(${texPoly(P)})\\cdot(${texPoly(Q)})=${texPoly(R)}$$`,
      };
    }
    const { q, r } = polyDiv(P, Q);
    return {
      topic: 'Polinomios', title: 'Cociente de polinomios',
        hint: 'División ordinaria (el divisor no es x − a). Dividí el término principal, multiplicá, restá, bajá el siguiente.',
      statement: `<p>Calcule el cociente y el resto de la división entre los polinomios $(${texPoly(P)})$ y $(${texPoly(Q)})$.</p>`,
      items: [
        { key: 'q', type: 'poly', label: 'Cociente C(x)', answer: q, degree: 2 },
        { key: 'r', type: 'poly', label: 'Resto R(x) = a·x + b', answer: r.length === 2 ? r : [0, r[0]], degree: 1 },
      ],
      solution: `<p>Se realiza la división ordinaria de polinomios (el divisor no es de la forma $x-a$, así que no aplica Ruffini):</p>
$$${texPoly(P)}=(${texPoly(Q)})\\cdot(${texPoly(q)})+(${texPoly(r)})$$<p>Cociente: $C(x)=${texPoly(q)}$; resto: $R(x)=${texPoly(r)}$.</p>`,
    };
  };

  G.math.polinomioTresParametros = function (rng) {
    const variant = rng.int(0, 1);
    if (variant === 0) {
      // P = (x − r1)(x − r2)(x² + m x + n) → x⁴ + a x³ + b x² + c x + d
      const r1 = rng.pick([-1, -2, 1, 3]), r2 = rng.pick([2, -3, 4, -2].filter((v) => v !== r1));
      const m = rng.intNZ(-3, 3), n = rng.intNZ(-4, 4);
      const P = polyMul(polyMul([1, -r1], [1, -r2]), [1, m, n]);
      const [, a, b, c, d] = P;
      const V = polyEval(P, 1);
      return {
        topic: 'Polinomios', title: 'Polinomio con tres parámetros',
        hint: 'Cada condición (raíz, resto, valor numérico) da una ecuación lineal en los parámetros: armá un sistema 3×3 y resolvé por sustitución.',
        statement: `<p>Halle los valores "a", "b" y "c" tal que el polinomio $P(x)=x^4+a\\,x^3+b\\,x^2+c\\,x${texSigned(d)}$ sea divisible por $(x${texSigned(-r1)})$ y tenga una raíz en $x=${tex(r2)}$. Además, se sabe que el valor numérico de $P(1)$ es igual a ${fmt(V)}. Exprese al polinomio hallado en forma polinómica.</p>`,
        items: [
          { key: 'a', type: 'number', label: 'a', answer: a, tol: 0 },
          { key: 'b', type: 'number', label: 'b', answer: b, tol: 0 },
          { key: 'c', type: 'number', label: 'c', answer: c, tol: 0 },
        ],
        solution: `<p>Las tres condiciones dan un sistema lineal de 3×3: $P(${tex(r1)})=0$, $P(${tex(r2)})=0$ y $P(1)=${tex(V)}$:</p>
$$\\begin{cases}${tex(r1 ** 4)}+${tex(r1 ** 3)}a+${tex(r1 ** 2)}b${texSC(r1)}c${texSigned(d)}=0\\\\ ${tex(r2 ** 4)}+${tex(r2 ** 3)}a+${tex(r2 ** 2)}b${texSC(r2)}c${texSigned(d)}=0\\\\ 1+a+b+c${texSigned(d)}=${tex(V)}\\end{cases}$$
<p>Resolviendo (por sustitución o reducción): $a=${tex(a)}$, $b=${tex(b)}$, $c=${tex(c)}$.</p>$$P(x)=${texPoly(P)}=(x${texSigned(-r1)})(x${texSigned(-r2)})(${texPoly([1, m, n])})$$`,
      };
    }
    // P = −x⁴ + m x³ + n x + r, restos al dividir por (x+1) y (x−2), P(1) = V
    const m = rng.intNZ(-3, 3), n = rng.intNZ(-4, 4), r = rng.intNZ(-5, 5);
    const P = [-1, m, 0, n, r];
    const R1 = polyEval(P, -1), R2 = polyEval(P, 2), V = polyEval(P, 1);
    return {
      topic: 'Polinomios', title: 'Polinomio con tres parámetros',
        hint: 'Cada condición (raíz, resto, valor numérico) da una ecuación lineal en los parámetros: armá un sistema 3×3 y resolvé por sustitución.',
      statement: `<p>Halle los valores "m", "n" y "r" tal que al dividir el polinomio $P(x)=-x^4+m\\,x^3+n\\,x+r$ entre $(x+1)$ y $(x-2)$, se obtiene por resto ${fmt(R1)} y ${fmt(R2)}, respectivamente. Además, se sabe que el valor numérico de $P(x)$ en 1 es igual a ${fmt(V)}. Exprese al polinomio hallado en forma polinómica.</p>`,
      items: [
        { key: 'm', type: 'number', label: 'm', answer: m, tol: 0 },
        { key: 'n', type: 'number', label: 'n', answer: n, tol: 0 },
        { key: 'r', type: 'number', label: 'r', answer: r, tol: 0 },
      ],
      solution: `<p>Por el teorema del resto: $P(-1)=${tex(R1)}$, $P(2)=${tex(R2)}$ y $P(1)=${tex(V)}$:</p>
$$\\begin{cases}-1-m-n+r=${tex(R1)}\\\\ -16+8m+2n+r=${tex(R2)}\\\\ -1+m+n+r=${tex(V)}\\end{cases}$$
<p>Sumando la 1.ª y la 3.ª: $-2+2r=${tex(R1 + V)}\\Rightarrow r=${tex(r)}$. Luego $m=${tex(m)}$ y $n=${tex(n)}$.</p>$$P(x)=${texPoly(P)}$$`,
    };
  };

  /* ======================= 6. INECUACIONES ======================= */
  G.math.inecuacionModulo = function (rng) {
    const variant = rng.int(0, 1);
    const h = rng.intNZ(-3, 3);
    const abs = `|x${texSigned(-h)}|`;
    if (variant === 0) {
      // t² − (r1+r2)t + r1r2 ⋚ 0 con r1<0<r2
      const r1 = -rng.int(1, 3), r2 = rng.int(1, 4);
      const less = rng.bool();
      const strict = rng.bool();
      const op = less ? (strict ? '<' : '\\le') : (strict ? '>' : '\\ge');
      const bq = -(r1 + r2), cq = r1 * r2;
      // forma: |x-h|² + bq|x-h| + cq ⋚ 0, o pasando términos: |x-h|² ⋚ -bq|x-h| - cq
      const lhs = `${abs}^2${texSC(bq)}${abs}${texSigned(cq)}`;
      const moved = rng.bool();
      const ineq = moved ? `${abs}^2 ${op} ${bq === 0 ? '' : `${texCoefSimple(-bq)}${abs}`}${texSigned(-cq)}` : `${lhs} ${op} 0`;
      const lo = h - r2, hi = h + r2;
      const I = (l, r, lc, rc) => `${lc ? '[' : '('}${l === -Infinity ? '-\\infty' : tex(l)}\\,;\\,${r === Infinity ? '+\\infty' : tex(r)}${rc ? ']' : ')'}`;
      const inner = I(lo, hi, !strict, !strict);
      const outer = `${I(-Infinity, lo, false, !strict)}\\cup ${I(hi, Infinity, !strict, false)}`;
      const correct = less ? inner : outer;
      const options = rng.shuffle([correct, less ? outer : inner, less ? I(lo, hi, strict, strict) : `${I(-Infinity, lo, false, strict)}\\cup ${I(hi, Infinity, strict, false)}`, I(h - r2 * 2, h + r2 * 2, !strict, !strict)]);
      return {
        topic: 'Inecuaciones', title: 'Inecuación con valor absoluto',
        hint: 'Cambio de variable t = |x − h| (t ≥ 0). Factorizá y hacé cuadro de signos en t; luego volvé a x recordando −a < x − h < a ⇔ |x − h| < a.',
        statement: `<p>Encuentre el conjunto solución de la inecuación y represéntelo en la recta numérica:</p>$$${ineq}$$`,
        items: [{ key: 's', type: 'choice', label: 'Conjunto solución', options: options.map((o) => `$${o}$`), answer: options.indexOf(correct) }],
        solution: `<p>Hacemos el cambio de variable $t=${abs}$ (con $t\\ge0$): $t^2${texSC(bq)}t${texSigned(cq)}${op}0$, es decir $(t${texSigned(-r1)})(t${texSigned(-r2)})${op}0$.</p>
<p>Del cuadro de signos: ${less ? `$${tex(r1)}${strict ? '<' : '\\le'}t${strict ? '<' : '\\le'}${tex(r2)}$` : `$t${strict ? '<' : '\\le'}${tex(r1)}$ o $t${strict ? '>' : '\\ge'}${tex(r2)}$`}. Como $t=${abs}\\ge0$, la condición con ${tex(r1)} ${less ? 'se cumple siempre' : 'es imposible'}, y queda ${less ? `$${abs}${strict ? '<' : '\\le'}${tex(r2)}$` : `$${abs}${strict ? '>' : '\\ge'}${tex(r2)}$`}.</p>
<p>Entonces ${less ? `$${tex(-r2)}${strict ? '<' : '\\le'}x${texSigned(-h)}${strict ? '<' : '\\le'}${tex(r2)}$` : `$x${texSigned(-h)}${strict ? '<' : '\\le'}${tex(-r2)}$ o $x${texSigned(-h)}${strict ? '>' : '\\ge'}${tex(r2)}$`} y el conjunto solución es</p>$$S=${correct}$$`,
      };
    }
    // (|x-h| − 1)² > 0 → x ≠ h±1  o  ≤ 0 → x = h±1
    const strictGT = rng.bool();
    const ineq = `${abs}^2-2\\,${abs}+1 ${strictGT ? '>' : '\\le'} 0`;
    const correct = strictGT ? `\\mathbb{R}-\\{${tex(h - 1)}\\,;\\,${tex(h + 1)}\\}` : `\\{${tex(h - 1)}\\,;\\,${tex(h + 1)}\\}`;
    const options = rng.shuffle([correct, strictGT ? `\\{${tex(h - 1)}\\,;\\,${tex(h + 1)}\\}` : `\\mathbb{R}-\\{${tex(h - 1)}\\,;\\,${tex(h + 1)}\\}`, `(${tex(h - 1)}\\,;\\,${tex(h + 1)})`, strictGT ? '\\mathbb{R}' : '\\varnothing']);
    return {
      topic: 'Inecuaciones', title: 'Inecuación con valor absoluto',
        hint: 'Cambio de variable t = |x − h| (t ≥ 0). Factorizá y hacé cuadro de signos en t; luego volvé a x recordando −a < x − h < a ⇔ |x − h| < a.',
      statement: `<p>Encuentre el conjunto solución de la inecuación y represéntelo en la recta numérica:</p>$$${ineq}$$`,
      items: [{ key: 's', type: 'choice', label: 'Conjunto solución', options: options.map((o) => `$${o}$`), answer: options.indexOf(correct) }],
      solution: `<p>Con $t=${abs}$: $t^2-2t+1=(t-1)^2 ${strictGT ? '>' : '\\le'} 0$. Un cuadrado ${strictGT ? 'es positivo salvo cuando vale 0' : 'nunca es negativo, solo puede ser 0'}, así que ${strictGT ? '$t\\ne1$' : '$t=1$'}, es decir ${strictGT ? `$${abs}\\ne1$` : `$${abs}=1$`}.</p>
<p>${abs.replace(/\\/g, '')} $=1\\Rightarrow x=${tex(h + 1)}$ o $x=${tex(h - 1)}$. Por lo tanto $S=${correct}$.</p>`,
    };
  };
  function texCoefSimple(v) { return v === 1 ? '' : v === -1 ? '-' : tex(v); }

  G.math.inecuacionLineal = function (rng) {
    // (√a x − b + √c)/c ≥ 1/√c + 1 con b + c = a → x ≥ √a
    const c = rng.pick([2, 3, 5]);
    const b = rng.pick([1, 2, 3, 4, 5]);
    const a = b + c;
    const strict = rng.bool();
    const ge = rng.bool();
    const op = ge ? (strict ? '>' : '\\ge') : (strict ? '<' : '\\le');
    const sq = Number.isInteger(Math.sqrt(a)) ? `${Math.sqrt(a)}` : `\\sqrt{${a}}`;
    const correct = ge ? `${strict ? '(' : '['}${sq}\\,;\\,+\\infty)` : `(-\\infty\\,;\\,${sq}${strict ? ')' : ']'}`;
    const options = rng.shuffle([correct, ge ? `(-\\infty\\,;\\,${sq}${strict ? ')' : ']'}` : `${strict ? '(' : '['}${sq}\\,;\\,+\\infty)`, ge ? `${strict ? '(' : '['}${texFrac(a / Math.sqrt(a) * Math.sqrt(a) / a)}\\,;\\,+\\infty)`.replace(texFrac(1), `\\tfrac{${a}}{${a}}`) : `(-\\infty\\,;\\,${a}${strict ? ')' : ']'}`, `${strict ? '(' : '['}\\sqrt{${b}}\\,;\\,+\\infty)`]);
    return {
      topic: 'Inecuaciones', title: 'Inecuación lineal con radicales',
        hint: 'Multiplicá por el denominador (positivo). Racionalizá c/√c = √c. Despejá x dividiendo por √a (positivo, no cambia el sentido).',
      statement: `<p>Resuelva la siguiente inecuación y represente el conjunto solución en la recta numérica:</p>$$\\frac{\\sqrt{${a}}\\,x-${b}+\\sqrt{${c}}}{${c}} ${op} \\frac{1}{\\sqrt{${c}}}+1$$`,
      items: [
        { key: 's', type: 'choice', label: 'Conjunto solución', options: options.map((o) => `$${o}$`), answer: options.indexOf(correct) },
        { key: 'e', type: 'number', label: 'Extremo del intervalo (valor numérico)', answer: Math.sqrt(a), tol: 0.011 },
      ],
      solution: `<p>Multiplicamos por ${c} (positivo, no cambia el sentido): $\\sqrt{${a}}\\,x-${b}+\\sqrt{${c}} ${op} \\frac{${c}}{\\sqrt{${c}}}+${c}$. Como $\\frac{${c}}{\\sqrt{${c}}}=\\sqrt{${c}}$, se cancela con el $\\sqrt{${c}}$ del otro miembro:</p>
$$\\sqrt{${a}}\\,x ${op} ${b}+${c}=${a}\\ \\Rightarrow\\ x ${op} \\frac{${a}}{\\sqrt{${a}}}=${sq}\\approx ${tex(Math.sqrt(a), 3)}$$<p>$S=${correct}$.</p>`,
    };
  };

  /* ======================= 7. ECUACIONES ======================= */
  const DOMOPTS = (rng, correct, distractors) => {
    const opts = rng.shuffle([correct, ...distractors.filter((d) => d !== correct).slice(0, 3)]);
    return { options: opts.map((o) => `$${o}$`), answer: opts.indexOf(correct) };
  };
  G.math.ecuacionLog = function (rng) {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      // log_b(x+p) + log_b(x+q) = n
      const b = rng.pick([2, 3, 5, 10]), n = rng.pick([1, 2, 2]);
      const N = b ** n;
      const pairs = [];
      for (let m1 = 1; m1 * m1 <= N; m1++) if (N % m1 === 0) pairs.push([m1, N / m1]);
      const [m1, m2] = rng.pick(pairs);
      const x0 = rng.int(1, 5);
      const p = m1 - x0, q = m2 - x0;
      const x1 = -(p + q) - x0;
      const domLo = Math.max(-p, -q);
      const valid = [x0, x1].filter((v) => v + p > 0 && v + q > 0);
      const sub = b === 10 ? '' : `_{${b}}`;
      const term = (k) => (k === 0 ? 'x' : `(x${texSigned(k)})`);
      const dom = `(${tex(domLo)}\\,;\\,+\\infty)`;
      const d = DOMOPTS(rng, dom, [`(${tex(Math.min(-p, -q))}\\,;\\,+\\infty)`, `[${tex(domLo)}\\,;\\,+\\infty)`, `\\mathbb{R}-\\{${tex(-p)}\\,;\\,${tex(-q)}\\}`, '\\mathbb{R}']);
      return {
        topic: 'Ecuaciones', title: 'Ecuación logarítmica',
        hint: 'Primero el dominio (argumentos > 0). Propiedades: log a + log b = log(ab), log a − log b = log(a/b). Igualá argumentos o pasá a exponencial. Verificá con el dominio.',
        statement: `<p>Resuelva la siguiente ecuación, calcule su dominio y verifique los resultados obtenidos:</p>$$\\log${sub}${term(p)}+\\log${sub}${term(q)}=${n}$$`,
        items: [
          { key: 'dom', type: 'choice', label: 'Dominio', options: d.options, answer: d.answer },
          { key: 'x', type: 'set', label: 'Soluciones válidas', answer: valid, slots: 2, labels: ['x₁', 'x₂'] },
        ],
        solution: `<p><b>Dominio:</b> $x${texSigned(p)}>0\\Rightarrow x>${tex(-p)}$ y $x${texSigned(q)}>0\\Rightarrow x>${tex(-q)}$. Intersección: $D=${dom}$.</p>
<p><b>Resolución:</b> por propiedad del logaritmo de un producto, $\\log${sub}[${term(p)}${term(q)}]=${n}\\Rightarrow ${term(p)}${term(q)}=${b}^{${n}}=${N}$.</p>
$$x^2${texSC(p + q)}x${texSigned(p * q - N)}=0\\ \\Rightarrow\\ x_1=${tex(x0)},\\ x_2=${tex(x1)}$$
<p>${valid.length === 2 ? 'Ambas soluciones pertenecen al dominio.' : `Solo $x=${tex(valid[0])}$ pertenece al dominio; $x=${tex(valid[0] === x0 ? x1 : x0)}$ se descarta.`} Verificación: $\\log${sub}(${tex(valid[0] + p)})+\\log${sub}(${tex(valid[0] + q)})=\\log${sub}(${N})=${n}$ ✓</p>`,
      };
    }
    if (variant === 1) {
      // log((x−u)(x−v)) − log(2x − w) = log K
      let u, v, K, r1, r2, w, tries = 0;
      do {
        u = rng.int(1, 4); v = u + rng.int(1, 4); K = rng.pick([2, 3]);
        r1 = rng.int(v + 1, v + 6); r2 = rng.int(u + 1, v + 8);
        w = (r1 * r2 - u * v) / K;
        tries++;
      } while ((!Number.isInteger(w) || r1 === r2 || r1 + r2 !== u + v + 2 * K) && tries < 500);
      if (!Number.isInteger(w) || r1 + r2 !== u + v + 2 * K) { u = 3; v = 6; K = 2; r1 = 4; r2 = 9; w = 9; }
      const num = polyMul([1, -u], [1, -v]);
      const domLo = Math.max(v, w / 2);
      const valid = [r1, r2].filter((x) => (x - u) * (x - v) > 0 && 2 * x - w > 0);
      const dom = `(${tex(domLo)}\\,;\\,+\\infty)`;
      const d = DOMOPTS(rng, dom, [`(-\\infty\\,;\\,${tex(u)})\\cup(${tex(v)}\\,;\\,+\\infty)`, `(${tex(w / 2)}\\,;\\,+\\infty)`, `(${tex(v)}\\,;\\,+\\infty)`, '\\mathbb{R}']);
      return {
        topic: 'Ecuaciones', title: 'Ecuación logarítmica',
        hint: 'Primero el dominio (argumentos > 0). Propiedades: log a + log b = log(ab), log a − log b = log(a/b). Igualá argumentos o pasá a exponencial. Verificá con el dominio.',
        statement: `<p>Resuelva la siguiente ecuación, calcule su dominio y verifique los resultados obtenidos:</p>$$\\log(${texPoly(num)})-\\log(2x${texSigned(-w)})=\\log(${K})$$`,
        items: [
          { key: 'dom', type: 'choice', label: 'Dominio', options: d.options, answer: d.answer },
          { key: 'x', type: 'set', label: 'Soluciones válidas', answer: valid, slots: 2, labels: ['x₁', 'x₂'] },
        ],
        solution: `<p><b>Dominio:</b> $${texPoly(num)}=(x-${u})(x-${v})>0\\Rightarrow x<${u}$ o $x>${v}$; además $2x${texSigned(-w)}>0\\Rightarrow x>${tex(w / 2)}$. Intersección: $D=${dom}$.</p>
<p><b>Resolución:</b> $\\log\\dfrac{${texPoly(num)}}{2x${texSigned(-w)}}=\\log ${K}\\Rightarrow ${texPoly(num)}=${K}(2x${texSigned(-w)})$</p>
$$x^2${texSC(-(u + v) - 2 * K)}x${texSigned(u * v + K * w)}=0\\Rightarrow x_1=${tex(Math.min(r1, r2))},\\ x_2=${tex(Math.max(r1, r2))}$$
<p>${valid.length === 2 ? 'Ambas pertenecen al dominio.' : `Solo $x=${tex(valid[0])}$ pertenece al dominio; la otra se descarta.`}</p>`,
      };
    }
    // log(x² + c) − log(x − 1) − log(x + 1) = 1 → (x²+c)/(x²−1) = 10
    const c = rng.pick([8, 17, 26, 35]);
    const x0 = Math.sqrt((10 + c) / 9);
    const d = DOMOPTS(rng, '(1\\,;\\,+\\infty)', ['(-1\\,;\\,+\\infty)', '\\mathbb{R}-\\{-1\\,;\\,1\\}', '(-\\infty\\,;\\,-1)\\cup(1\\,;\\,+\\infty)', '\\mathbb{R}']);
    return {
      topic: 'Ecuaciones', title: 'Ecuación logarítmica',
        hint: 'Primero el dominio (argumentos > 0). Propiedades: log a + log b = log(ab), log a − log b = log(a/b). Igualá argumentos o pasá a exponencial. Verificá con el dominio.',
      statement: `<p>Resuelva la siguiente ecuación, calcule su dominio y verifique los resultados obtenidos:</p>$$\\log(x^2+${c})-\\log(x-1)-\\log(x+1)=1$$`,
      items: [
        { key: 'dom', type: 'choice', label: 'Dominio', options: d.options, answer: d.answer },
        { key: 'x', type: 'set', label: 'Soluciones válidas', answer: [x0], slots: 2, labels: ['x₁', 'x₂'] },
      ],
      solution: `<p><b>Dominio:</b> $x^2+${c}>0$ siempre; $x-1>0$ y $x+1>0\\Rightarrow x>1$. $D=(1;+\\infty)$.</p>
<p><b>Resolución:</b> $\\log\\dfrac{x^2+${c}}{(x-1)(x+1)}=1\\Rightarrow \\dfrac{x^2+${c}}{x^2-1}=10\\Rightarrow x^2+${c}=10x^2-10\\Rightarrow 9x^2=${10 + c}$</p>
$$x=\\pm\\sqrt{\\tfrac{${10 + c}}{9}}=\\pm ${texFrac(x0)}${Number.isInteger(x0) ? '' : `\\approx\\pm ${tex(x0, 3)}`}$$<p>Solo la raíz positiva pertenece al dominio: $x=${texFrac(x0)}$.</p>`,
    };
  };

  G.math.ecuacionExp = function (rng) {
    const variant = rng.int(0, 1);
    if (variant === 0) {
      // b^(2x+1) − c·b^(x+1) + d = 0 → t=b^x: b t² − c b t + d = 0
      const b = rng.pick([2, 3, 5, 7]);
      const k1 = rng.pick([0, 1]), k2 = rng.pick([0, 1, 2]);
      const t1 = b ** k1, t2 = b ** k2;
      const c = t1 + t2, d = b * t1 * t2;
      const sols = [...new Set([k1, k2])].sort((x, y) => x - y);
      return {
        topic: 'Ecuaciones', title: 'Ecuación exponencial',
        hint: 'Sustitución t = bˣ (usá bˣ⁺¹ = b·bˣ y b²ˣ = (bˣ)²). Resolvé la cuadrática en t, descartá t ≤ 0 y volvé con logaritmo.',
        statement: `<p>Halle el o los valores de "x" tal que:</p>$$${b}^{2x+1}-${c}\\cdot ${b}^{x+1}+${d}=0$$`,
        items: [{ key: 'x', type: 'set', label: 'Soluciones', answer: sols, slots: 2, labels: ['x₁', 'x₂'] }],
        solution: `<p>Aplicamos propiedades de la potencia: $${b}^{2x+1}=${b}\\cdot(${b}^{x})^2$ y $${b}^{x+1}=${b}\\cdot ${b}^x$. Con la sustitución $t=${b}^x$:</p>
$$${b}t^2-${c * b}t+${d}=0\\ \\Rightarrow\\ t^2-${c}t+${d / b}=0\\ \\Rightarrow\\ t_1=${t1},\\ t_2=${t2}$$
<p>Volviendo a la variable: $${b}^x=${t1}\\Rightarrow x=${k1}$${k1 !== k2 ? ` y $${b}^x=${t2}\\Rightarrow x=${k2}$` : ' (raíz doble)'}.</p>`,
      };
    }
    // b^x − b^(−x) = r, con t0 = b^(1/m)
    const cfg = rng.pick([{ b: 8, t0: 2, x: 1 / 3 }, { b: 4, t0: 2, x: 1 / 2 }, { b: 9, t0: 3, x: 1 / 2 }, { b: 27, t0: 3, x: 1 / 3 }, { b: 2, t0: 2, x: 1 }, { b: 16, t0: 2, x: 1 / 4 }]);
    const r = cfg.t0 - 1 / cfg.t0;
    return {
      topic: 'Ecuaciones', title: 'Ecuación exponencial',
        hint: 'Sustitución t = bˣ (usá bˣ⁺¹ = b·bˣ y b²ˣ = (bˣ)²). Resolvé la cuadrática en t, descartá t ≤ 0 y volvé con logaritmo.',
      statement: `<p>Resuelva la siguiente ecuación:</p>$$${cfg.b}^{x}-${cfg.b}^{-x}-${texFrac(r)}=0$$`,
      items: [{ key: 'x', type: 'set', label: 'Soluciones', answer: [cfg.x], slots: 2, labels: ['x₁', 'x₂'] }],
      solution: `<p>Con $t=${cfg.b}^x>0$ queda $t-\\frac1t=${texFrac(r)}$. Multiplicando por $t$: $t^2-${texFrac(r)}t-1=0$, cuyas raíces son $t=${cfg.t0}$ y $t=${texFrac(-1 / cfg.t0)}$ (se descarta por ser negativa).</p>
<p>$${cfg.b}^x=${cfg.t0}\\Rightarrow x=\\log_{${cfg.b}}${cfg.t0}=${texFrac(cfg.x)}$, ya que $${cfg.b}^{${texFrac(cfg.x)}}=${cfg.t0}$.</p>`,
    };
  };

  G.math.ecuacionRacional = function (rng) {
    // (x + a)/x − b/(x − 1) + c/(x² − x) = 0 → x² + (a − 1 − b)x + (c − a) = 0
    const a = rng.intNZ(-4, 4);
    const r1 = rng.pick([0, 1, 2, -2, 3, -3, 4]);
    const r2 = rng.pick([2, -2, 3, -3, 4, 5, -1].filter((v) => v !== r1));
    const b = a - 1 + r1 + r2, c = a + r1 * r2;
    const valid = [r1, r2].filter((v) => v !== 0 && v !== 1);
    const d = DOMOPTS(rng, '\\mathbb{R}-\\{0\\,;\\,1\\}', ['\\mathbb{R}-\\{0\\}', '\\mathbb{R}-\\{1\\}', '\\mathbb{R}', '(0\\,;\\,1)']);
    const bt = b === 0 ? '' : `${b > 0 ? '-' : '+'}\\frac{${Math.abs(b)}}{x-1}`;
    const ct = c === 0 ? '' : `${c > 0 ? '+' : '-'}\\frac{${Math.abs(c)}}{x^2-x}`;
    return {
      topic: 'Ecuaciones', title: 'Ecuación racional',
        hint: 'Dominio: denominadores ≠ 0 (factorizá x² − x = x(x − 1)). Multiplicá por el denominador común y resolvé la cuadrática. Descartá soluciones fuera del dominio.',
      statement: `<p>Resuelva la siguiente ecuación, calculando previamente su dominio:</p>$$\\frac{x${texSigned(a)}}{x}${bt}${ct}=0$$`,
      items: [
        { key: 'dom', type: 'choice', label: 'Dominio', options: d.options, answer: d.answer },
        { key: 'x', type: 'set', label: 'Soluciones válidas', answer: valid, slots: 2, labels: ['x₁', 'x₂'], allowEmpty: true },
      ],
      solution: `<p><b>Dominio:</b> los denominadores no pueden anularse: $x\\ne0$, $x-1\\ne0$ y $x^2-x=x(x-1)\\ne0$. $D=\\mathbb{R}-\\{0;1\\}$.</p>
<p><b>Resolución:</b> el denominador común es $x(x-1)$. Multiplicando toda la ecuación por él:</p>
$$(x${texSigned(a)})(x-1)${b === 0 ? '' : `${b > 0 ? '-' : '+'}${Math.abs(b)}x`}${texSigned(c)}=0\\ \\Rightarrow\\ x^2${texSC(a - 1 - b)}x${texSigned(c - a)}=0$$
$$x_1=${tex(r1)},\\qquad x_2=${tex(r2)}$$
<p>${valid.length === 2 ? 'Ambas soluciones pertenecen al dominio.' : valid.length === 1 ? `$x=${tex(valid[0] === r1 ? r2 : r1)}$ no pertenece al dominio, se descarta. Solución: $x=${tex(valid[0])}$.` : 'Ninguna pertenece al dominio: la ecuación no tiene solución.'}</p>`,
    };
  };

  G.math.ecuacionRaiz = function (rng) {
    // p x + q = s √(x + r)
    let p, q, s, r, x0, k, roots, valid, tries = 0;
    do {
      s = rng.pick([2, 3, 4, 9]); k = rng.pick([1, 2, 3, 4]); r = rng.int(-3, 5); x0 = k * k - r;
      p = rng.pick([1, 2]); q = s * k - p * x0;
      // p²x² + (2pq − s²)x + q² − s² r = 0
      roots = quadRoots(p * p, 2 * p * q - s * s, q * q - s * s * r);
      valid = roots.filter((x) => x + r >= 0 && Math.abs(p * x + q - s * Math.sqrt(x + r)) < 1e-6);
      tries++;
    } while ((roots.length !== 2 || x0 === 0 || Math.abs(q) > 20) && tries < 300);
    const domTex = `[${tex(-r)}\\,;\\,+\\infty)`;
    const d = DOMOPTS(rng, domTex, [`(${tex(-r)}\\,;\\,+\\infty)`, `[${tex(r)}\\,;\\,+\\infty)`, '\\mathbb{R}', `(-\\infty\\,;\\,${tex(-r)}]`]);
    return {
      topic: 'Ecuaciones', title: 'Ecuación con radicales',
        hint: 'Dominio: radicando ≥ 0. Elevá al cuadrado ambos miembros, resolvé la cuadrática y VERIFICÁ cada solución en la ecuación original.',
      statement: `<p>Resuelva la siguiente ecuación, calculando previamente su dominio y verificando las soluciones:</p>$$${p === 1 ? '' : p}x${texSigned(q)}=${s}\\sqrt{x${texSigned(r)}}$$`,
      items: [
        { key: 'dom', type: 'choice', label: 'Dominio', options: d.options, answer: d.answer },
        { key: 'x', type: 'set', label: 'Soluciones válidas', answer: valid, slots: 2, labels: ['x₁', 'x₂'], allowEmpty: true },
      ],
      solution: `<p><b>Dominio:</b> el radicando debe ser no negativo: $x${texSigned(r)}\\ge0\\Rightarrow D=${domTex}$.</p>
<p><b>Resolución:</b> elevamos ambos miembros al cuadrado:</p>
$$(${p === 1 ? '' : p}x${texSigned(q)})^2=${s * s}(x${texSigned(r)})\\ \\Rightarrow\\ ${p * p}x^2${texSC(2 * p * q - s * s)}x${texSigned(q * q - s * s * r)}=0$$
$$x_1=${texFrac(roots[0])},\\qquad x_2=${texFrac(roots[1])}$$
<p><b>Verificación</b> (al elevar al cuadrado pueden aparecer soluciones extrañas): ${roots.map((x) => `para $x=${texFrac(x)}$: $${tex(p * x + q)}${valid.includes(x) ? '=' : '\\ne'}${tex(s * Math.sqrt(Math.max(0, x + r)))}$ ${valid.includes(x) ? '✓' : '✗'}`).join('; ')}.</p>
<p>${valid.length === 2 ? 'Ambas soluciones son válidas.' : valid.length === 1 ? `Solución: $x=${texFrac(valid[0])}$.` : 'No tiene solución.'}</p>`,
    };
  };
})(window);
