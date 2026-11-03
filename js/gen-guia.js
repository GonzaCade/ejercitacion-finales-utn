/* ==========================================================================
   gen-guia.js — Generadores de los temas de la "Guía: Nociones de Precálculo
   para el inicio en Carreras Tecnológicas" que no aparecían en los modelos de
   examen: conjuntos e intervalos, fracciones, racionalización, notación y
   unidades, versor y producto escalar, ecuaciones (lineales, cuadráticas,
   bicuadráticas, con módulo), inecuaciones no lineales y de problemas, dominio,
   transformaciones, rectas, parábolas, sistemas, ángulos y magnitudes físicas.
   ========================================================================== */
(function (global) {
  'use strict';
  const { tex, texSigned, texSC, texPoly, texFrac, texVec, fmt, round, gcd, toDeg, toRad } = global.U;
  const G = global.GEN = global.GEN || {};
  G.math = G.math || {};
  G.fisica = G.fisica || {};
  const C = () => global.C;

  /* ---------- helpers ---------- */
  // racionales exactos
  const R = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; };
  const rAdd = (a, b) => R(a.n * b.d + b.n * a.d, a.d * b.d);
  const rSub = (a, b) => R(a.n * b.d - b.n * a.d, a.d * b.d);
  const rMul = (a, b) => R(a.n * b.n, a.d * b.d);
  const rDiv = (a, b) => R(a.n * b.d, a.d * b.n);
  const rVal = (a) => a.n / a.d;
  const rTex = (a) => (a.d === 1 ? String(a.n) : `${a.n < 0 ? '-' : ''}\\tfrac{${Math.abs(a.n)}}{${a.d}}`);
  const fx = (r) => (r === 0 ? 'x' : `(x${texSigned(-r)})`);
  const coef = (v) => (v === 1 ? '' : v === -1 ? '-' : String(v));
  const INF = '\\infty';

  /** intervalo en KaTeX */
  const ivTex = (lo, hi, loC, hiC) => {
    const l = lo === -Infinity ? `-${INF}` : tex(lo);
    const h = hi === Infinity ? INF : tex(hi);
    return `${loC && lo !== -Infinity ? '[' : '('}${l}\\,;\\,${h}${hiC && hi !== Infinity ? ']' : ')'}`;
  };

  /** ítem de elección múltiple con 4 opciones (la correcta + distractores únicos) */
  function mkChoice(rng, key, label, correct, wrongs, fill, math = true) {
    const set = [correct];
    wrongs.forEach((w) => { if (!set.includes(w)) set.push(w); });
    for (let i = 0; set.length < 4 && fill && i < 60; i++) { const f = fill(i); if (!set.includes(f)) set.push(f); }
    const opts = rng.shuffle(set.slice(0, 4));
    return { key, type: 'choice', label, options: opts.map((o) => (math ? `$${o}$` : o)), answer: opts.indexOf(correct) };
  }

  /* ======================= 1. CONJUNTOS E INTERVALOS ======================= */
  G.math.intervalos = function (rng) {
    if (rng.bool(0.5)) {
      const a = rng.int(-8, 3), b = a + rng.int(2, 9);
      const loC = rng.bool(), hiC = rng.bool();
      const setTex = `\\{x\\in\\mathbb{R}\\ /\\ ${tex(a)}${loC ? '\\le' : '<'}x${hiC ? '\\le' : '<'}${tex(b)}\\}`;
      const correct = ivTex(a, b, loC, hiC);
      return {
        topic: 'Conjuntos e intervalos', title: 'Notación de intervalo y amplitud',
        hint: 'Desigualdad estricta (<) → paréntesis (extremo no incluido); con igualdad (≤) → corchete. Amplitud = |extremo superior − extremo inferior|.',
        statement: `<p>Dado el conjunto $A=${setTex}$, exprésalo en notación de intervalo, represéntelo en la recta numérica y, si es posible, encuentre la amplitud del intervalo.</p>`,
        items: [
          mkChoice(rng, 'iv', 'Notación de intervalo', correct, [ivTex(a, b, !loC, hiC), ivTex(a, b, loC, !hiC), ivTex(a, b, !loC, !hiC)]),
          { key: 'amp', type: 'number', label: 'Amplitud del intervalo', answer: b - a, tol: 0.01 },
        ],
        solution: `<p>El extremo inferior $${tex(a)}$ ${loC ? 'se incluye' : 'no se incluye'} y el superior $${tex(b)}$ ${hiC ? 'se incluye' : 'no se incluye'}:</p>$$A=${correct}$$
<p>Amplitud: $|${tex(b)}-(${tex(a)})|=${tex(b - a)}$.</p>`,
      };
    }
    // operación entre dos intervalos (a < c < b < d)
    const a = rng.int(-9, -2), c = a + rng.int(1, 4), b = c + rng.int(2, 5), d = b + rng.int(1, 5);
    const c1 = rng.bool(), c2 = rng.bool(), c3 = rng.bool(), c4 = rng.bool();
    const inter = rng.bool();
    const I1 = ivTex(a, b, c1, c2), I2 = ivTex(c, d, c3, c4);
    const rInter = ivTex(c, b, c3, c2), rUnion = ivTex(a, d, c1, c4);
    const correct = inter ? rInter : rUnion;
    const lo = inter ? c : a, hi = inter ? b : d;
    return {
      topic: 'Conjuntos e intervalos', title: 'Unión e intersección de intervalos',
      hint: 'Intersección: lo que está en ambos (tomá el extremo inferior mayor y el superior menor). Unión: todo lo que está en alguno (el menor inferior y el mayor superior).',
      statement: `<p>Resuelva y exprese el resultado en notación de intervalo:</p>$$${I1}\\ ${inter ? '\\cap' : '\\cup'}\\ ${I2}$$`,
      items: [
        mkChoice(rng, 'r', 'Resultado', correct, [inter ? rUnion : rInter, ivTex(lo, hi, !(inter ? c3 : c1), inter ? c2 : c4), ivTex(lo, hi, inter ? c3 : c1, !(inter ? c2 : c4))]),
        { key: 'amp', type: 'number', label: 'Amplitud del resultado', answer: hi - lo, tol: 0.01 },
      ],
      solution: `<p>Ubicamos ambos intervalos en la recta numérica. ${inter ? `La parte común va desde $${tex(c)}$ (extremo inferior del segundo) hasta $${tex(b)}$ (extremo superior del primero).` : `Juntos cubren desde $${tex(a)}$ hasta $${tex(d)}$ sin huecos, porque se superponen entre $${tex(c)}$ y $${tex(b)}$.`}</p>$$${I1}\\ ${inter ? '\\cap' : '\\cup'}\\ ${I2}=${correct}$$<p>Amplitud: $|${tex(hi)}-(${tex(lo)})|=${tex(hi - lo)}$.</p>`,
    };
  };

  /* ======================= 2. CONJUNTOS NUMÉRICOS ======================= */
  G.math.conjuntosNumericos = function (rng) {
    // i: 0 N, 1 Z, 2 Q, 3 I (conjunto más pequeño al que pertenece)
    const pool = [
      { t: '7', p: '7', i: 0 }, { t: '\\sqrt{9}', p: '√9', i: 0, n: '$\\sqrt9=3$' }, { t: '\\frac{12}{4}', p: '12/4', i: 0, n: '$\\frac{12}{4}=3$' },
      { t: '0', p: '0', i: 1 }, { t: '-4', p: '−4', i: 1 }, { t: '-\\sqrt{25}', p: '−√25', i: 1, n: '$-\\sqrt{25}=-5$' }, { t: '\\sqrt[3]{-8}', p: '∛(−8)', i: 1, n: '$\\sqrt[3]{-8}=-2$' },
      { t: '\\frac{3}{5}', p: '3/5', i: 2 }, { t: '0{,}25', p: '0,25', i: 2, n: '$0{,}25=\\frac14$' }, { t: '-\\frac{7}{2}', p: '−7/2', i: 2 }, { t: '0{,}\\overline{3}', p: '0,333… (periódico)', i: 2, n: '$0{,}\\overline3=\\frac13$' },
      { t: '\\sqrt{2}', p: '√2', i: 3 }, { t: '\\pi', p: 'π', i: 3 }, { t: '\\sqrt{5}', p: '√5', i: 3 }, { t: 'e', p: 'e', i: 3 }, { t: '\\frac{\\sqrt2}{2}', p: '√2/2', i: 3 },
    ];
    const chosen = rng.sample(pool, 5);
    const names = ['Naturales (ℕ)', 'Enteros (ℤ)', 'Racionales (ℚ)', 'Irracionales (𝕀)'];
    const short = ['ℕ', 'ℤ', 'ℚ', '𝕀'];
    return {
      topic: 'Conjuntos numéricos', title: 'Clasificación de números',
      hint: 'ℕ ⊂ ℤ ⊂ ℚ; los irracionales tienen infinitas cifras decimales no periódicas. Simplificá primero (raíces exactas, fracciones, decimales).',
      statement: `<p>Coloque cada número en el conjunto numérico más pequeño al que pertenece (considere $\\mathbb{N}=\\{1,2,3,\\dots\\}$):</p><ul>${chosen.map((q, k) => `<li>${String.fromCharCode(97 + k)}) $${q.t}$</li>`).join('')}</ul>`,
      items: chosen.map((q, k) => ({ key: 'n' + k, type: 'choice', label: `${String.fromCharCode(97 + k)}) ${q.p}`, options: names, answer: q.i })),
      solution: `<ul>${chosen.map((q, k) => `<li>${String.fromCharCode(97 + k)}) $${q.t}$ ${q.n ? `(${q.n})` : ''} pertenece a ${short[q.i]}${q.i === 3 ? ' (parte decimal infinita no periódica)' : ''}.</li>`).join('')}</ul>`,
    };
  };

  /* ======================= 3. FRACCIONES ======================= */
  G.math.fracciones = function (rng) {
    const fr = () => { const d = rng.int(2, 9); let n; do { n = rng.int(1, 9); } while (n % d === 0); return R(n, d); };
    const [a, b, c, d] = [fr(), fr(), fr(), fr()];
    if (rng.bool(0.5)) {
      const res = rSub(rMul(rAdd(a, b), c), d);
      return {
        topic: 'Fracciones', title: 'Operaciones combinadas con fracciones',
        hint: 'Primero el paréntesis (común denominador), luego el producto (numerador × numerador, denominador × denominador) y por último la resta.',
        statement: `<p>Realice las siguientes operaciones y exprese el resultado como fracción irreducible:</p>$$\\left(${rTex(a)}+${rTex(b)}\\right)\\cdot${rTex(c)}-${rTex(d)}$$`,
        items: [{ key: 'r', type: 'number', label: 'Resultado (fracción o decimal)', answer: rVal(res), tol: 0.011 }],
        solution: `$$${rTex(a)}+${rTex(b)}=${rTex(rAdd(a, b))}$$$$${rTex(rAdd(a, b))}\\cdot${rTex(c)}=${rTex(rMul(rAdd(a, b), c))}$$$$${rTex(rMul(rAdd(a, b), c))}-${rTex(d)}=${rTex(res)}\\approx ${tex(rVal(res), 3)}$$`,
      };
    }
    const den = rAdd(c, d);
    const num = rSub(a, b);
    if (num.n === 0) return G.math.fracciones(rng);
    const res = rDiv(num, den);
    return {
      topic: 'Fracciones', title: 'Operaciones combinadas con fracciones',
      hint: 'Resolvé cada paréntesis por separado con común denominador. Dividir por una fracción es multiplicar por su inversa.',
      statement: `<p>Realice las siguientes operaciones y exprese el resultado como fracción irreducible:</p>$$\\left(${rTex(a)}-${rTex(b)}\\right)\\div\\left(${rTex(c)}+${rTex(d)}\\right)$$`,
      items: [{ key: 'r', type: 'number', label: 'Resultado (fracción o decimal)', answer: rVal(res), tol: 0.011 }],
      solution: `$$${rTex(a)}-${rTex(b)}=${rTex(num)}\\qquad ${rTex(c)}+${rTex(d)}=${rTex(den)}$$$$${rTex(num)}\\div${rTex(den)}=${rTex(num)}\\cdot${rTex(R(den.d, den.n))}=${rTex(res)}\\approx ${tex(rVal(res), 3)}$$`,
    };
  };

  /* ======================= 4. RACIONALIZACIÓN ======================= */
  G.math.racionalizacion = function (rng) {
    const NS = [2, 3, 5, 6, 7, 10];
    const t = rng.int(0, 2);
    const m = rng.int(2, 9);
    if (t === 0) {
      const n = rng.pick(NS);
      const correct = `\\frac{${m}\\sqrt{${n}}}{${n}}`;
      return {
        topic: 'Racionalización', title: 'Racionalizar un denominador',
        hint: 'Multiplicá numerador y denominador por la raíz del denominador: √n · √n = n.',
        statement: `<p>Racionalice el denominador:</p>$$\\frac{${m}}{\\sqrt{${n}}}$$`,
        items: [
          mkChoice(rng, 'r', 'Expresión racionalizada', correct, [`\\frac{${m}}{${n}}`, `${m}\\sqrt{${n}}`, `\\frac{\\sqrt{${n}}}{${m}}`], (i) => `\\frac{${m + i + 1}\\sqrt{${n}}}{${n}}`),
          { key: 'v', type: 'number', label: 'Valor numérico (decimal)', answer: m / Math.sqrt(n), tol: 0.011 },
        ],
        solution: `$$\\frac{${m}}{\\sqrt{${n}}}\\cdot\\frac{\\sqrt{${n}}}{\\sqrt{${n}}}=\\frac{${m}\\sqrt{${n}}}{${n}}\\approx ${tex(m / Math.sqrt(n), 3)}$$`,
      };
    }
    if (t === 1) {
      const a = rng.int(1, 3), b = rng.pick(NS.filter((v) => v !== a * a));
      const D = a * a - b;
      const form = (num, den) => (den < 0 ? `-\\frac{${num}}{${-den}}` : `\\frac{${num}}{${den}}`);
      const correct = form(`${m}(${a}-\\sqrt{${b}})`, D);
      return {
        topic: 'Racionalización', title: 'Racionalizar un denominador',
        hint: 'Multiplicá por el conjugado del denominador: (a + √b)(a − √b) = a² − b.',
        statement: `<p>Racionalice el denominador:</p>$$\\frac{${m}}{${a}+\\sqrt{${b}}}$$`,
        items: [
          mkChoice(rng, 'r', 'Expresión racionalizada', correct, [form(`${m}(${a}+\\sqrt{${b}})`, D), form(`${m}(${a}-\\sqrt{${b}})`, a * a + b), form(`${m}(${a}-\\sqrt{${b}})`, a + b)], (i) => form(`${m}(${a}-\\sqrt{${b}})`, D + i + 2)),
          { key: 'v', type: 'number', label: 'Valor numérico (decimal)', answer: m / (a + Math.sqrt(b)), tol: 0.011 },
        ],
        solution: `$$\\frac{${m}}{${a}+\\sqrt{${b}}}\\cdot\\frac{${a}-\\sqrt{${b}}}{${a}-\\sqrt{${b}}}=\\frac{${m}(${a}-\\sqrt{${b}})}{${a}^2-(\\sqrt{${b}})^2}=\\frac{${m}(${a}-\\sqrt{${b}})}{${D}}\\approx ${tex(m / (a + Math.sqrt(b)), 3)}$$`,
      };
    }
    const pa = rng.sample(NS, 2).sort((x, y) => y - x);
    const [a, b] = pa;
    const correct = `\\frac{${m}(\\sqrt{${a}}+\\sqrt{${b}})}{${a - b}}`;
    return {
      topic: 'Racionalización', title: 'Racionalizar un denominador',
      hint: 'Conjugado de (√a − √b) es (√a + √b); el producto da a − b.',
      statement: `<p>Racionalice el denominador:</p>$$\\frac{${m}}{\\sqrt{${a}}-\\sqrt{${b}}}$$`,
      items: [
        mkChoice(rng, 'r', 'Expresión racionalizada', correct, [`\\frac{${m}(\\sqrt{${a}}-\\sqrt{${b}})}{${a - b}}`, `\\frac{${m}(\\sqrt{${a}}+\\sqrt{${b}})}{${a + b}}`, `\\frac{${m}(\\sqrt{${a}}+\\sqrt{${b}})}{\\sqrt{${a - b}}}`], (i) => `\\frac{${m + i + 1}(\\sqrt{${a}}+\\sqrt{${b}})}{${a - b}}`),
        { key: 'v', type: 'number', label: 'Valor numérico (decimal)', answer: m / (Math.sqrt(a) - Math.sqrt(b)), tol: 0.011 },
      ],
      solution: `$$\\frac{${m}}{\\sqrt{${a}}-\\sqrt{${b}}}\\cdot\\frac{\\sqrt{${a}}+\\sqrt{${b}}}{\\sqrt{${a}}+\\sqrt{${b}}}=\\frac{${m}(\\sqrt{${a}}+\\sqrt{${b}})}{${a}-${b}}=\\frac{${m}(\\sqrt{${a}}+\\sqrt{${b}})}{${a - b}}\\approx ${tex(m / (Math.sqrt(a) - Math.sqrt(b)), 3)}$$`,
    };
  };

  /* ======================= 5. NOTACIÓN CIENTÍFICA Y UNIDADES ======================= */
  G.math.pasajeNotacion = function (rng) {
    const sci = (m, n) => `${tex(m, 3)}\\times10^{${n}}`;
    const m1 = rng.pick([1.15, 2.34, 7.54, 4.3, 5.97, 8.459, 6.58]), e1 = rng.pick([-4, -3, -2, 3, 4, 5]);
    const dec = m1 * Math.pow(10, e1);
    const m2 = rng.pick([4.3, 5.97, 8.459, 6.58, 1.28, 3.7]), e2 = rng.pick([-6, -5, -4, 6, 7, 8]);
    const v2 = m2 * Math.pow(10, e2);
    const U = [
      { f: 'cm', t: 'm', k: 1e-2 }, { f: 'hm', t: 'm', k: 100 }, { f: 'mg', t: 'kg', k: 1e-6 }, { f: 'g', t: 'kg', k: 1e-3 },
      { f: 'min', t: 's', k: 60 }, { f: 'h', t: 's', k: 3600 }, { f: 'km/h', t: 'm/s', k: 1 / 3.6 },
    ];
    const u = rng.pick(U);
    const mu = rng.pick([2.85, 6.3, 3.55, 4.35, 1.2, 9.5]), eu = rng.pick([1, 2, 3, 4, 5]);
    const vu = mu * Math.pow(10, eu), ru = vu * u.k;
    const decTxt = v2 < 1 ? v2.toFixed(Math.min(14, e2 < 0 ? -e2 + (String(m2).split('.')[1] || '').length : 0)).replace('.', ',') : String(Math.round(v2)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return {
      topic: 'Notación científica', title: 'Pasajes de notación y de unidades',
      hint: 'Exponente positivo: la coma se corre a la derecha; negativo: a la izquierda. Para unidades usá factores de conversión (1 h = 3600 s, km/h ÷ 3,6 = m/s).',
      statement: `<ol class="list-[lower-alpha] pl-6"><li>Exprese en notación decimal: $${sci(m1, e1)}$</li><li>Exprese en notación científica: ${decTxt}</li><li>Exprese en <b>${u.t}</b>: $${sci(mu, eu)}\\ \\text{${u.f}}$</li></ol>`,
      items: [
        { key: 'a', type: 'number', label: 'a) Notación decimal', answer: dec, tol: Math.abs(dec) * 0.001 },
        { key: 'b1', type: 'number', label: 'b) Mantisa m', answer: m2, tol: 0.006 },
        { key: 'b2', type: 'number', label: 'b) Exponente n', answer: e2, tol: 0 },
        { key: 'c', type: 'number', label: `c) Valor en ${u.t}`, answer: ru, tol: Math.abs(ru) * 0.005, unit: u.t },
      ],
      solution: `<p>a) $${sci(m1, e1)}=${tex(dec, 12)}$ (la coma se corre ${Math.abs(e1)} lugares hacia la ${e1 > 0 ? 'derecha' : 'izquierda'}).</p>
<p>b) ${decTxt} $=${sci(m2, e2)}$.</p>
<p>c) $${sci(mu, eu)}\\ \\text{${u.f}}\\cdot ${u.k >= 1 ? tex(u.k, 4) : u.f === 'km/h' ? '\\tfrac{1}{3{,}6}' : tex(u.k, 8)}=${tex(ru, 10)}\\ \\text{${u.t}}$.</p>`,
    };
  };

  /* ======================= 6. VECTORES: VERSOR Y PRODUCTO ESCALAR ======================= */
  G.math.versorProductoEscalar = function (rng) {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      const t = rng.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [7, 24, 25], [20, 21, 29]]);
      const sx = rng.sign(), sy = rng.sign();
      const [a, b, c] = [t[0] * sx, t[1] * sy, t[2]];
      const swap = rng.bool();
      const vx = swap ? b : a, vy = swap ? a : b;
      return {
        topic: 'Vectores', title: 'Vector unitario (versor)',
        hint: 'Versor = vector ÷ su módulo: â = a / |a|. Módulo: |a| = √(aₓ² + a_y²).',
        statement: `<p>Halle el vector unitario que va en el mismo sentido y dirección que el vector $\\vec a=${texVec(vx, vy)}$.</p>`,
        items: [
          { key: 'm', type: 'number', label: 'Módulo de a', answer: c, tol: 0.01 },
          { key: 'u', type: 'vector', label: 'Versor â = (x ; y)', answer: [vx / c, vy / c], paren: true, tol: 0.011 },
        ],
        solution: `$$|\\vec a|=\\sqrt{(${vx})^2+(${vy})^2}=\\sqrt{${vx * vx + vy * vy}}=${c}$$$$\\hat a=\\frac{\\vec a}{|\\vec a|}=\\left(\\frac{${vx}}{${c}}\\,;\\,\\frac{${vy}}{${c}}\\right)=${texVec(vx / c, vy / c, 3)}$$`,
      };
    }
    if (variant === 1) {
      const m = rng.pick([6, 8, 10, 12, 20]), n = rng.pick([5, 10, 15, 20, 30]), th = rng.pick([30, 45, 60, 90, 120, 135, 150]);
      const val = Math.round(m * n * Math.cos(toRad(th)) * 1e6) / 1e6;
      return {
        topic: 'Vectores', title: 'Producto escalar con módulos y ángulo',
        hint: 'u · v = |u|·|v|·cos θ, siendo θ el ángulo entre los vectores.',
        statement: `<p>Dos vectores $\\vec u$ y $\\vec v$ tienen módulos $|\\vec u|=${m}$ y $|\\vec v|=${n}$ y forman entre sí un ángulo de ${th}°. Determine el valor del producto escalar.</p>`,
        items: [{ key: 'p', type: 'number', label: 'u · v', answer: val, tol: Math.max(0.6, Math.abs(val) * 0.005) }],
        solution: `$$\\vec u\\cdot\\vec v=|\\vec u|\\,|\\vec v|\\cos ${th}^\\circ=${m}\\cdot${n}\\cdot ${tex(Math.cos(toRad(th)), 4)}\\approx ${tex(val, 2)}$$`,
      };
    }
    let ux, uy, vx, vy, dot, cos;
    do {
      ux = rng.intNZ(-5, 5); uy = rng.intNZ(-5, 5); vx = rng.intNZ(-5, 5); vy = rng.intNZ(-5, 5);
      dot = ux * vx + uy * vy;
      cos = dot / (Math.hypot(ux, uy) * Math.hypot(vx, vy));
    } while (Math.abs(cos) > 0.98);
    const ang = toDeg(Math.acos(cos));
    return {
      topic: 'Vectores', title: 'Producto escalar y ángulo entre vectores',
      hint: 'u · v = uₓvₓ + u_y v_y. Además u · v = |u||v| cos θ ⇒ θ = arccos[(u·v)/(|u||v|)].',
      statement: `<p>Sean $\\vec u=${texVec(ux, uy)}$ y $\\vec v=${texVec(vx, vy)}$. Calcule el producto escalar y el ángulo que forman los vectores.</p>`,
      items: [
        { key: 'p', type: 'number', label: 'u · v', answer: dot, tol: 0.01 },
        { key: 'a', type: 'number', label: 'Ángulo θ (grados)', answer: ang, tol: 0.6 },
      ],
      solution: `$$\\vec u\\cdot\\vec v=${ux}\\cdot(${vx})+(${uy})\\cdot(${vy})=${dot}$$$$|\\vec u|=\\sqrt{${ux * ux + uy * uy}},\\ |\\vec v|=\\sqrt{${vx * vx + vy * vy}}\\ \\Rightarrow\\ \\cos\\theta=\\frac{${dot}}{\\sqrt{${ux * ux + uy * uy}}\\sqrt{${vx * vx + vy * vy}}}\\approx ${tex(cos, 4)}\\ \\Rightarrow\\ \\theta\\approx ${tex(ang, 1)}^\\circ$$`,
    };
  };

  /* ======================= 7. ECUACIONES ======================= */
  G.math.ecuacionLineal = function (rng) {
    if (rng.bool(0.7)) {
      let r, u, p, s, q, t, x0;
      do {
        r = rng.int(2, 6); u = rng.int(2, 6); p = rng.intNZ(-5, 5); s = rng.intNZ(-5, 5); q = rng.int(-6, 6); t = rng.int(-6, 6); x0 = rng.int(-6, 6);
      } while (p * u === s * r);
      const w = rSub(R(p * x0 + q, r), R(s * x0 - t, u));
      const L = (r * u) / gcd(r, u);
      const Lr = L / r, Lu = L / u;
      const A = p * Lr - s * Lu, B = q * Lr + t * Lu, rhs = Lr * (p * x0 + q) - Lu * (s * x0 - t);
      return {
        topic: 'Ecuaciones', title: 'Ecuación lineal fraccionaria',
        hint: 'Multiplicá ambos miembros por el mínimo común múltiplo de los denominadores para eliminarlos; luego despejá x.',
        statement: `<p>Resuelva la ecuación:</p>$$\\frac{${texPoly([p, q], 'x', 0)}}{${r}}-\\frac{${texPoly([s, -t], 'x', 0)}}{${u}}=${rTex(w)}$$`,
        items: [{ key: 'x', type: 'number', label: 'x =', answer: x0, tol: 0.011 }],
        solution: `<p>El mínimo común múltiplo de $${r}$ y $${u}$ es $${L}$. Multiplicando toda la ecuación:</p>
$$${Lr === 1 ? '' : Lr}(${texPoly([p, q], 'x', 0)})-${Lu === 1 ? '' : Lu}(${texPoly([s, -t], 'x', 0)})=${L}\\cdot${w.n < 0 ? `(${rTex(w)})` : rTex(w)}$$
$$${texPoly([A, B], 'x', 0)}=${rhs}\\ \\Rightarrow\\ ${tex(A)}x=${rhs - B}\\ \\Rightarrow\\ x=${tex(x0)}$$`,
      };
    }
    const n = rng.int(3, 40), S = 3 * n + 3;
    return {
      topic: 'Ecuaciones', title: 'Planteo de una ecuación lineal',
      hint: 'Llamá x al menor de los números: los otros son x + 1 y x + 2. Planteá la suma igual a la dada.',
      statement: `<p>Plantee y resuelva: la suma de tres números enteros consecutivos es ${S}. ¿Cuáles son esos números?</p>`,
      items: [
        { key: 'a', type: 'number', label: 'El menor', answer: n, tol: 0 },
        { key: 'b', type: 'number', label: 'El mayor', answer: n + 2, tol: 0 },
      ],
      solution: `$$x+(x+1)+(x+2)=${S}\\ \\Rightarrow\\ 3x+3=${S}\\ \\Rightarrow\\ x=${n}$$<p>Los números son $${n}$, $${n + 1}$ y $${n + 2}$.</p>`,
    };
  };

  G.math.ecuacionCuadratica = function (rng) {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      let q1, p1, q2, p2;
      do { q1 = rng.pick([1, 1, 2, 3]); q2 = rng.pick([1, 1, 2, 3]); p1 = rng.int(-6, 6); p2 = rng.int(-6, 6); } while (p1 * q2 === p2 * q1 || p1 === 0 || p2 === 0);
      const A = q1 * q2, B = -(q1 * p2 + q2 * p1), Cc = p1 * p2;
      const D = B * B - 4 * A * Cc;
      const roots = [p1 / q1, p2 / q2];
      return {
        topic: 'Ecuaciones', title: 'Ecuación cuadrática: resolvente y discriminante',
        hint: 'Resolvente: x = (−b ± √(b² − 4ac)) / 2a. El discriminante Δ = b² − 4ac indica cuántas raíces reales hay.',
        statement: `<p>Determine la solución de la ecuación y calcule su discriminante:</p>$$${texPoly([A, B, Cc], 'x', 0)}=0$$`,
        items: [
          { key: 'D', type: 'number', label: 'Discriminante Δ', answer: D, tol: 0.01 },
          { key: 'x', type: 'set', label: 'Soluciones', answer: roots, slots: 2, labels: ['x₁', 'x₂'] },
        ],
        solution: `$$\\Delta=b^2-4ac=(${B})^2-4\\cdot${A}\\cdot(${Cc})=${D}>0$$$$x_{1,2}=\\frac{${-B}\\pm\\sqrt{${D}}}{${2 * A}}=\\frac{${-B}\\pm ${Math.sqrt(D)}}{${2 * A}}\\ \\Rightarrow\\ x_1=${texFrac(roots[0])},\\ x_2=${texFrac(roots[1])}$$`,
      };
    }
    if (variant === 1) {
      let a, b, c;
      do { a = rng.int(1, 3); b = rng.int(-4, 4); c = rng.int(1, 6); } while (b * b - 4 * a * c >= 0);
      const D = b * b - 4 * a * c;
      return {
        topic: 'Ecuaciones', title: 'Ecuación cuadrática: naturaleza de las raíces',
        hint: 'Si Δ = b² − 4ac < 0 no hay raíces reales; si Δ = 0, una raíz doble; si Δ > 0, dos raíces reales distintas.',
        statement: `<p>Determine la solución real de la ecuación:</p>$$${texPoly([a, b, c], 'x', 0)}=0$$`,
        items: [
          { key: 'D', type: 'number', label: 'Discriminante Δ', answer: D, tol: 0.01 },
          { key: 'x', type: 'set', label: 'Soluciones reales', answer: [], slots: 2, labels: ['x₁', 'x₂'], allowEmpty: true },
        ],
        solution: `$$\\Delta=(${b})^2-4\\cdot${a}\\cdot${c}=${D}<0$$<p>El discriminante es negativo: la ecuación no tiene soluciones reales.</p>`,
      };
    }
    const l = rng.int(3, 12), w = rng.int(2, l - 1);
    return {
      topic: 'Ecuaciones', title: 'Problema con ecuación cuadrática',
      hint: 'Si el semiperímetro es s y un lado es x, el otro es s − x. El área es x(s − x): ecuación cuadrática.',
      statement: `<p>Un terreno rectangular tiene ${2 * (l + w)} metros de perímetro y ${l * w} m² de superficie. Plantee y resuelva la ecuación para hallar las dimensiones del terreno.</p>`,
      items: [{ key: 'x', type: 'set', label: 'Lados (m)', answer: [l, w], slots: 2, labels: ['largo', 'ancho'] }],
      solution: `<p>Semiperímetro $${l + w}$: si un lado mide $x$ el otro mide $${l + w}-x$.</p>$$x(${l + w}-x)=${l * w}\\ \\Rightarrow\\ x^2-${l + w}x+${l * w}=0\\ \\Rightarrow\\ x=\\frac{${l + w}\\pm\\sqrt{${(l + w) ** 2 - 4 * l * w}}}{2}$$<p>Los lados miden $${l}$ m y $${w}$ m.</p>`,
    };
  };

  G.math.ecuacionBicuadratica = function (rng) {
    const a = rng.pick([1, 1, 2]);
    const both = rng.bool(0.6);
    let m, n;
    if (both) { m = rng.int(1, 4); do { n = rng.int(1, 4); } while (n === m); } else { m = rng.int(1, 4); n = 0; }
    const y1 = m * m, y2 = both ? n * n : -rng.int(1, 9);
    const B = -a * (y1 + y2), Cc = a * y1 * y2;
    const roots = both ? [-m, m, -n, n] : [-m, m];
    return {
      topic: 'Ecuaciones', title: 'Ecuación bicuadrática',
      hint: 'Sustitución: y = x². Resolvé la cuadrática en y y luego x = ±√y (solo si y ≥ 0).',
      statement: `<p>Resuelva la ecuación bicuadrática (halle las soluciones reales; deje en blanco los casilleros que no use):</p>$$${texPoly([a, 0, B, 0, Cc], 'x', 0)}=0$$`,
      items: [{ key: 'x', type: 'set', label: 'Soluciones reales', answer: roots, slots: 4, labels: ['x₁', 'x₂', 'x₃', 'x₄'] }],
      solution: `<p>Con $y=x^2$: $${texPoly([a, B, Cc], 'y', 0)}=0\\ \\Rightarrow\\ y=${y1}$ o $y=${y2}$.</p>
<p>$x^2=${y1}\\Rightarrow x=\\pm ${m}$. ${both ? `$x^2=${y2}\\Rightarrow x=\\pm ${n}$.` : `$x^2=${y2}$ no tiene solución real.`}</p>`,
    };
  };

  G.math.ecuacionModulo = function (rng) {
    if (rng.bool(0.5)) {
      const a = rng.pick([1, 2, 3]), b = rng.int(-9, 9), c = rng.int(1, 9);
      const x1 = (-b + c) / a, x2 = (-b - c) / a;
      return {
        topic: 'Ecuaciones', title: 'Ecuación con módulo',
        hint: '|E| = c (c > 0) equivale a E = c  ó  E = −c. Resolvé las dos ecuaciones.',
        statement: `<p>Resuelva la ecuación con módulo:</p>$$\\left|${texPoly([a, b], 'x', 0)}\\right|=${c}$$`,
        items: [{ key: 'x', type: 'set', label: 'Soluciones', answer: [x1, x2], slots: 2, labels: ['x₁', 'x₂'] }],
        solution: `$$${texPoly([a, b], 'x', 0)}=${c}\\Rightarrow x=${texFrac(x1)}\\qquad ${texPoly([a, b], 'x', 0)}=-${c}\\Rightarrow x=${texFrac(x2)}$$`,
      };
    }
    let a, b, c, d, x1, x2, valid;
    const ok = (x, E) => E >= -1e-9;
    do {
      a = rng.intNZ(-4, 4); b = rng.int(-6, 6); c = rng.intNZ(-3, 3); d = rng.int(-6, 6);
      if (Math.abs(a) === Math.abs(c)) { valid = []; continue; }
      x1 = (d - b) / (a - c); x2 = (-d - b) / (a + c);
      valid = [x1, x2].filter((x) => ok(x, c * x + d));
    } while (valid.length === 0 || (valid.length === 2 && Math.abs(x1 - x2) < 1e-9));
    const rhs = texPoly([c, d], 'x', 0);
    return {
      topic: 'Ecuaciones', title: 'Ecuación con módulo y verificación',
      hint: '|E| = F exige F ≥ 0. Resolvé E = F y E = −F, y verificá cada solución reemplazándola.',
      statement: `<p>Resuelva la ecuación y verifique las soluciones obtenidas:</p>$$\\left|${texPoly([a, b], 'x', 0)}\\right|=${rhs}$$`,
      items: [{ key: 'x', type: 'set', label: 'Soluciones válidas', answer: valid, slots: 2, labels: ['x₁', 'x₂'] }],
      solution: `<p>Caso 1: $${texPoly([a, b], 'x', 0)}=${rhs}\\Rightarrow x=${texFrac(x1)}$ ${ok(x1, c * x1 + d) ? '(válida: el segundo miembro es ≥ 0)' : '(no es válida: el segundo miembro da negativo)'}.</p>
<p>Caso 2: $-(${texPoly([a, b], 'x', 0)})=${rhs}\\Rightarrow x=${texFrac(x2)}$ ${ok(x2, c * x2 + d) ? '(válida)' : '(no es válida: el segundo miembro da negativo)'}.</p>`,
    };
  };

  /* ======================= 8. INECUACIONES ======================= */
  G.math.inecuacionNoLineal = function (rng) {
    const type = rng.int(0, 2);
    const pts = rng.sample([-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6], 3).sort((x, y) => x - y);
    const num = type === 0 ? pts : type === 1 ? [pts[0]] : [pts[0], pts[2]];
    const den = type === 0 ? [] : type === 1 ? [pts[1]] : [pts[1]];
    const ops = ['>', '<', '\\ge', '\\le'];
    const op = rng.pick(ops);
    const flip = { '>': '<', '<': '>', '\\ge': '\\le', '\\le': '\\ge' };
    const toggle = { '>': '\\ge', '\\ge': '>', '<': '\\le', '\\le': '<' };
    const crit = [...num.map((r) => ({ r, num: true })), ...den.map((r) => ({ r, num: false }))].sort((a, b) => a.r - b.r);
    const sign = (x) => [...num, ...den].reduce((s, r) => s * Math.sign(x - r), 1);
    const solve = (o, denClosed = false) => {
      const strict = o === '>' || o === '<';
      const want = o === '>' || o === '\\ge' ? 1 : -1;
      const bounds = [-Infinity, ...crit.map((c) => c.r), Infinity];
      const parts = [];
      for (let i = 0; i < bounds.length - 1; i++) {
        const lo = bounds[i], hi = bounds[i + 1];
        const t = lo === -Infinity ? hi - 1 : hi === Infinity ? lo + 1 : (lo + hi) / 2;
        if (sign(t) !== want) continue;
        const cl = (v) => { const c = crit.find((q) => q.r === v); return !!c && (c.num ? !strict : denClosed); };
        parts.push(ivTex(lo, hi, cl(lo), cl(hi)));
      }
      return parts.length ? parts.join('\\cup') : '\\varnothing';
    };
    const fxs = (list) => (list.length === 1 && den.length ? (list[0] === 0 ? 'x' : `x${texSigned(-list[0])}`) : list.map(fx).join(''));
    const numTex = fxs(num);
    const expr = den.length ? `\\frac{${numTex}}{${den.map(fx).join('')}}` : numTex;
    const correct = solve(op);
    const opT = { '>': '>', '<': '<', '\\ge': '\\ge', '\\le': '\\le' }[op];
    return {
      topic: 'Inecuaciones', title: 'Inecuación no lineal (tabla de signos)',
      hint: 'Hallá los ceros del numerador y denominador, ubicalos en la recta, analizá el signo de cada factor en cada tramo (tabla de signos). Los ceros del denominador nunca se incluyen.',
      statement: `<p>Resuelva la inecuación no lineal y exprese el conjunto solución como intervalo:</p>$$${expr}\\ ${opT}\\ 0$$`,
      items: [mkChoice(rng, 'S', 'Conjunto solución', correct, [solve(flip[op]), solve(toggle[op]), solve(op, true), solve(flip[toggle[op]])], (i) => ivTex(pts[0] + i, pts[2] + i + 1, false, false))],
      solution: `<p>Puntos críticos: ${crit.map((c) => `$${tex(c.r)}$ (${c.num ? 'cero del numerador' : 'cero del denominador'})`).join(', ')}. Se analiza el signo del cociente/producto en cada tramo:</p>
<p>${[-Infinity, ...crit.map((c) => c.r), Infinity].slice(0, -1).map((lo, i, arr) => { const b = [-Infinity, ...crit.map((c) => c.r), Infinity]; const hi = b[i + 1]; const t = lo === -Infinity ? hi - 1 : hi === Infinity ? lo + 1 : (lo + hi) / 2; return `$${ivTex(lo, hi, false, false)}$: ${sign(t) > 0 ? '+' : '−'}`; }).join(' · ')}</p>
<p>Se buscan los tramos ${op === '>' || op === '\\ge' ? 'positivos' : 'negativos'}${op === '\\ge' || op === '\\le' ? ' (incluyendo los ceros del numerador)' : ''}:</p>$$S=${correct}$$`,
    };
  };

  G.math.inecuacionProblema = function (rng) {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      const c0 = rng.int(-5, 6), r = rng.int(2, 8);
      const less = rng.bool(), eq = rng.bool();
      const lo = c0 - r, hi = c0 + r;
      const mk = (l, e) => (l ? ivTex(lo, hi, e, e) : `(-${INF}\\,;\\,${tex(lo)}${e ? ']' : ')'}\\cup${e ? '[' : '('}${tex(hi)}\\,;\\,${INF})`);
      const correct = mk(less, eq);
      return {
        topic: 'Inecuaciones', title: 'Inecuación con distancia (módulo)',
        hint: 'La distancia de x a c es |x − c|. "Menor" → |x − c| < r (entre c − r y c + r); "mayor" → x < c − r ó x > c + r.',
        statement: `<p>Halle el conjunto de todos los números reales tales que su distancia a ${c0} sea ${less ? 'menor' : 'mayor'} ${eq ? 'o igual ' : ''}que ${r}. Plantéelo como inecuación.</p>`,
        items: [mkChoice(rng, 'S', 'Conjunto solución', correct, [mk(less, !eq), mk(!less, eq), mk(!less, !eq)])],
        solution: `$$|x-${tex(c0)}|${less ? (eq ? '\\le' : '<') : (eq ? '\\ge' : '>')}${r}\\ \\Rightarrow\\ ${less ? `${tex(lo)}${eq ? '\\le' : '<'}x${eq ? '\\le' : '<'}${tex(hi)}` : `x${eq ? '\\le' : '<'}${tex(lo)}\\ \\text{ó}\\ x${eq ? '\\ge' : '>'}${tex(hi)}`}$$$$S=${correct}$$`,
      };
    }
    if (variant === 1) {
      const F = rng.pick([5000, 6000, 8000, 8500]), p = rng.pick([5, 10, 15, 20]), S0 = rng.pick([30000, 40000, 50000, 60000, 80000]);
      const M = F + S0 * p / 100;
      return {
        topic: 'Inecuaciones', title: 'Problema con inecuación lineal',
        hint: 'Ingreso = fijo + porcentaje × ventas. Planteá ingreso > monto y despejá las ventas.',
        statement: `<p>Un vendedor recibe un salario conformado de la siguiente manera: sueldo fijo de $${F.toLocaleString('de-DE')} más ${p}% de comisión por las ventas realizadas. ¿Cuánto deben sumar sus ventas para que su ingreso sea superior a $${M.toLocaleString('de-DE')}?</p>`,
        items: [{ key: 'v', type: 'number', label: 'Las ventas deben superar los ($)', answer: S0, tol: 1 }],
        solution: `$$${F}+${tex(p / 100, 2)}\\,x>${M}\\ \\Rightarrow\\ ${tex(p / 100, 2)}\\,x>${M - F}\\ \\Rightarrow\\ x>${S0}$$<p>Las ventas deben superar los $${S0.toLocaleString('de-DE')}.</p>`,
      };
    }
    const w = rng.pick([10, 12.5, 15, 20]), P = rng.pick([60, 70, 75, 80]), Cap = rng.pick([200, 225, 250, 300]);
    const n = Math.floor((Cap - P) / w + 1e-9);
    return {
      topic: 'Inecuaciones', title: 'Problema con inecuación lineal',
      hint: 'Peso total = peso de la persona + n · peso de cada caja ≤ capacidad. Despejá n y quedate con el mayor entero.',
      statement: `<p>El peso máximo que soporta un ascensor es de ${Cap} kg. Un hombre de ${P} kg transporta consigo cajas que pesan ${fmt(w, 1)} kg cada una. ¿Cuántas cajas puede transportar como máximo?</p>`,
      items: [{ key: 'n', type: 'number', label: 'Cantidad máxima de cajas', answer: n, tol: 0 }],
      solution: `$$${P}+${tex(w, 1)}\\,n\\le ${Cap}\\ \\Rightarrow\\ n\\le\\frac{${Cap - P}}{${tex(w, 1)}}=${tex((Cap - P) / w, 2)}$$<p>Como n es entero, la cantidad máxima es $${n}$ cajas.</p>`,
    };
  };

  /* ======================= 9. DOMINIO DE FUNCIONES ======================= */
  G.math.dominioFuncion = function (rng) {
    const variant = rng.int(0, 3);
    const Rl = '\\mathbb{R}';
    if (variant === 0) {
      const a = rng.pick([1, 2, 3, -1, -2]), b = rng.int(-8, 8);
      const x0 = -b / a;
      const ge = a > 0;
      const correct = ge ? ivTex(x0, Infinity, true, false) : ivTex(-Infinity, x0, false, true);
      return {
        topic: 'Funciones', title: 'Dominio de una función irracional',
        hint: 'Raíz de índice par: el radicando debe ser ≥ 0. Planteá la inecuación y resolvela (si dividís por un número negativo, el sentido cambia).',
        statement: `<p>Halle el dominio de la función $f(x)=\\sqrt{${texPoly([a, b], 'x', 0)}}$.</p>`,
        items: [mkChoice(rng, 'd', 'Dominio', correct, [ge ? ivTex(x0, Infinity, false, false) : ivTex(-Infinity, x0, false, false), ge ? ivTex(-Infinity, x0, false, true) : ivTex(x0, Infinity, true, false), Rl], (i) => ivTex(x0 + i + 1, Infinity, true, false))],
        solution: `$$${texPoly([a, b], 'x', 0)}\\ge 0\\ \\Rightarrow\\ x${ge ? '\\ge' : '\\le'}${texFrac(x0)}$$$$Dom(f)=${correct}$$`,
      };
    }
    if (variant === 1) {
      const m = rng.int(1, 7);
      const correct = `${Rl}-\\{-${m},${m}\\}`;
      return {
        topic: 'Funciones', title: 'Dominio de una función racional',
        hint: 'El denominador no puede ser cero: resolvé x² − m² = 0 y excluí esos valores.',
        statement: `<p>Halle el dominio de la función $f(x)=\\dfrac{x+1}{x^2-${m * m}}$.</p>`,
        items: [mkChoice(rng, 'd', 'Dominio', correct, [`${Rl}-\\{${m}\\}`, Rl, ivTex(-m, m, false, false), `${Rl}-\\{0\\}`])],
        solution: `$$x^2-${m * m}=0\\ \\Rightarrow\\ x=\\pm ${m}$$$$Dom(f)=${correct}$$`,
      };
    }
    if (variant === 2) {
      const a = rng.pick([1, 2, 3]), b = rng.int(-8, 8);
      const x0 = -b / a;
      const correct = ivTex(x0, Infinity, false, false);
      return {
        topic: 'Funciones', title: 'Dominio de una función logarítmica',
        hint: 'El argumento del logaritmo debe ser estrictamente positivo: ax + b > 0.',
        statement: `<p>Halle el dominio de la función $f(x)=\\log\\left(${texPoly([a, b], 'x', 0)}\\right)$.</p>`,
        items: [mkChoice(rng, 'd', 'Dominio', correct, [ivTex(x0, Infinity, true, false), ivTex(-Infinity, x0, false, false), Rl], (i) => ivTex(x0 + i + 1, Infinity, false, false))],
        solution: `$$${texPoly([a, b], 'x', 0)}>0\\ \\Rightarrow\\ x>${texFrac(x0)}$$$$Dom(f)=${correct}$$`,
      };
    }
    const p = rng.int(-4, 2), q = p + rng.int(1, 4);
    const correct = `${ivTex(p, Infinity, true, false)}-\\{${q}\\}`;
    return {
      topic: 'Funciones', title: 'Dominio de una función combinada',
      hint: 'Dos restricciones: radicando ≥ 0 y denominador ≠ 0. El dominio es la intersección de ambas condiciones.',
      statement: `<p>Halle el dominio de la función $f(x)=\\dfrac{\\sqrt{${texPoly([1, -p], 'x', 0)}}}{${texPoly([1, -q], 'x', 0)}}$.</p>`,
      items: [mkChoice(rng, 'd', 'Dominio', correct, [ivTex(p, Infinity, true, false), `${ivTex(p, Infinity, false, false)}-\\{${q}\\}`, `${Rl}-\\{${q}\\}`])],
      solution: `<p>Radicando: $${texPoly([1, -p], 'x', 0)}\\ge0\\Rightarrow x\\ge ${tex(p)}$. Denominador: $${texPoly([1, -q], 'x', 0)}\\ne0\\Rightarrow x\\ne ${tex(q)}$.</p>$$Dom(f)=${correct}$$`,
    };
  };

  /* ======================= 10. TRANSFORMACIÓN DE FUNCIONES ======================= */
  G.math.transformacionFunciones = function (rng) {
    const bases = [
      { n: 'x^2', f: (x) => x * x, inner: (h) => `(x${texSigned(-h)})^2`, xs: () => rng.int(-3, 3) },
      { n: '|x|', f: (x) => Math.abs(x), inner: (h) => `|x${texSigned(-h)}|`, xs: () => rng.int(-3, 3) },
      { n: 'x^3', f: (x) => x * x * x, inner: (h) => `(x${texSigned(-h)})^3`, xs: () => rng.int(-2, 2) },
      { n: '\\sqrt{x}', f: (x) => Math.sqrt(x), inner: (h) => `\\sqrt{x${texSigned(-h)}}`, xs: () => rng.pick([0, 1, 4, 9]) },
    ];
    const B = rng.pick(bases);
    const h = rng.intNZ(-4, 4), k = rng.intNZ(-5, 5), s = rng.sign();
    const dx = B.xs();
    const x0 = h + dx;
    const val = s * B.f(dx) + k;
    const gTex = `${s < 0 ? '-' : ''}${B.inner(h)}${texSigned(k)}`;
    return {
      topic: 'Funciones', title: 'Transformaciones de funciones',
      hint: 'g(x) = ±f(x − h) + k: h desplaza horizontalmente (a la derecha si h > 0), k verticalmente (hacia arriba si k > 0), el signo "−" delante refleja respecto del eje x.',
      statement: `<p>A partir de la gráfica de $f(x)=${B.n}$ se obtiene la función $g(x)=${gTex}$ mediante transformaciones. Indique el desplazamiento horizontal, el vertical, si hay reflexión respecto del eje x y calcule $g(${tex(x0)})$.</p>`,
      items: [
        { key: 'h', type: 'number', label: 'Desplazamiento horizontal (positivo = derecha)', answer: h, tol: 0 },
        { key: 'k', type: 'number', label: 'Desplazamiento vertical (positivo = arriba)', answer: k, tol: 0 },
        { key: 'r', type: 'choice', label: 'Reflexión respecto del eje x', options: ['Sí', 'No'], answer: s < 0 ? 0 : 1 },
        { key: 'g', type: 'number', label: `g(${fmt(x0, 0)})`, answer: val, tol: 0.011 },
      ],
      solution: `<p>Comparando con $g(x)=\\pm f(x-h)+k$: $h=${tex(h)}$ (${h > 0 ? 'derecha' : 'izquierda'}), $k=${tex(k)}$ (${k > 0 ? 'arriba' : 'abajo'})${s < 0 ? ' y el signo menos delante indica reflexión respecto del eje x' : ', sin reflexión'}.</p>$$g(${tex(x0)})=${tex(val, 3)}$$`,
      chart: C().linesChart([{ label: 'f(x)', f: B.f, color: '#00455C', dashed: true }, { label: 'g(x)', f: (x) => s * B.f(x - h) + k, color: '#d97706' }], { xMin: Math.min(-3, h - 2), xMax: Math.max(3, h + 5), n: 120 }),
    };
  };

  /* ======================= 11. RECTAS ======================= */
  G.math.rectaPendiente = function (rng) {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      const m = rng.intNZ(-4, 4), x1 = rng.int(-4, 3), dx = rng.int(1, 4), y1 = rng.int(-5, 5);
      const x2 = x1 + dx, y2 = y1 + m * dx, b = y1 - m * x1;
      const x0 = -b / m;
      return {
        topic: 'Rectas', title: 'Recta por dos puntos',
        hint: 'Pendiente m = (y₂ − y₁)/(x₂ − x₁). Ordenada al origen: b = y₁ − m·x₁. Corte con el eje x: y = 0.',
        statement: `<p>Determine la ecuación de la recta que pasa por los puntos $A=${texVec(x1, y1)}$ y $B=${texVec(x2, y2)}$. Indique su pendiente, su ordenada al origen y la intersección con el eje x.</p>`,
        items: [
          { key: 'm', type: 'number', label: 'Pendiente m', answer: m, tol: 0.01 },
          { key: 'b', type: 'number', label: 'Ordenada al origen b', answer: b, tol: 0.01 },
          { key: 'x', type: 'number', label: 'Intersección con el eje x', answer: x0, tol: 0.011 },
        ],
        solution: `$$m=\\frac{${y2}-(${y1})}{${x2}-(${x1})}=${m}\\qquad b=${y1}-(${m})(${x1})=${b}\\qquad y=${texPoly([m, b], 'x', 0)}$$$$y=0\\ \\Rightarrow\\ x=${texFrac(x0)}$$`,
        chart: C().linesChart([{ label: 'recta', f: (x) => m * x + b, color: '#00455C' }], { xMin: Math.min(x1, x0) - 2, xMax: Math.max(x2, x0) + 2, points: [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }] }),
      };
    }
    if (variant === 1) {
      const th = rng.pick([45, 135, 60, 30]), b = rng.intNZ(-6, 6);
      const m = Math.tan(toRad(th));
      const x0 = -b / m;
      return {
        topic: 'Rectas', title: 'Recta con ángulo de inclinación',
        hint: 'La pendiente es la tangente del ángulo de inclinación: m = tg α. Luego y = m·x + b.',
        statement: `<p>Obtenga la ecuación de la recta de ordenada al origen igual a ${b} y ángulo de inclinación de ${th}°. Indique la pendiente y el punto de corte con el eje de abscisas.</p>`,
        items: [
          { key: 'm', type: 'number', label: 'Pendiente m', answer: m, tol: 0.011 },
          { key: 'x', type: 'number', label: 'Intersección con el eje x', answer: x0, tol: Math.max(0.02, Math.abs(x0) * 0.005) },
        ],
        solution: `$$m=\\tan ${th}^\\circ\\approx ${tex(m, 3)}\\ \\Rightarrow\\ y=${tex(m, 3)}\\,x${texSigned(b)}$$$$y=0\\ \\Rightarrow\\ x=\\frac{${tex(-b)}}{${tex(m, 3)}}\\approx ${tex(x0, 3)}$$`,
      };
    }
    const par = rng.bool();
    const mm = rng.pick([R(2), R(-3), R(1, 2), R(-2, 3), R(3, 4), R(-1, 2), R(4, 3), R(5, 2)]);
    const c = rng.pick([2, 3, 4, 5]);
    const k = par ? -c * rVal(mm) : c / rVal(mm);
    const nn = rng.intNZ(-5, 5);
    return {
      topic: 'Rectas', title: 'Parámetro para paralelismo o perpendicularidad',
      hint: 'Pendiente de kx + cy − e = 0 es −k/c. Paralelas: m₁ = m₂. Perpendiculares: m₁·m₂ = −1.',
      statement: `<p>Encuentre el valor del parámetro "k" de modo que la recta $kx+${c}y-2=0$ sea ${par ? 'paralela' : 'perpendicular'} a la recta $y=${rTex(mm)}\\,x${texSigned(nn)}$.</p>`,
      items: [{ key: 'k', type: 'number', label: 'k =', answer: k, tol: 0.011 }],
      solution: `<p>La pendiente de la primera recta es $-\\dfrac{k}{${c}}$ y la de la segunda $m=${rTex(mm)}$.</p>${par ? `$$-\\frac{k}{${c}}=${rTex(mm)}\\ \\Rightarrow\\ k=${texFrac(k)}$$` : `$$-\\frac{k}{${c}}=-\\frac{1}{m}=${texFrac(-1 / rVal(mm))}\\ \\Rightarrow\\ k=${c}\\cdot\\left(${texFrac(1 / rVal(mm))}\\right)=${texFrac(k)}$$`}`,
    };
  };

  /* ======================= 12. PARÁBOLA: ELEMENTOS ======================= */
  G.math.parabolaElementos = function (rng) {
    if (rng.bool(0.65)) {
      const a = rng.pick([1, -1, 2, -2, 3]), xv = rng.int(-4, 4);
      const m = rng.int(1, 4);
      const yv = rng.bool(0.6) ? -a * m * m : -rng.sign() * a * rng.int(1, 6) * (rng.bool() ? 1 : -1);
      const b = -2 * a * xv, c = a * xv * xv + yv;
      const D = b * b - 4 * a * c;
      const roots = D < 0 ? [] : D === 0 ? [xv] : [xv - Math.sqrt(D) / (2 * Math.abs(a)), xv + Math.sqrt(D) / (2 * Math.abs(a))];
      return {
        topic: 'Función cuadrática', title: 'Elementos característicos de una parábola',
        hint: 'Vértice: xᵥ = −b/2a, yᵥ = f(xᵥ). Raíces: resolvente; el discriminante dice cuántas hay. Concavidad según el signo de "a".',
        statement: `<p>Encuentre los elementos característicos de la parábola $f(x)=${texPoly([a, b, c], 'x', 0)}$: concavidad, vértice, discriminante y raíces (en caso de existir).</p>`,
        items: [
          { key: 'c', type: 'choice', label: 'Concavidad', options: ['Hacia arriba (∪)', 'Hacia abajo (∩)'], answer: a > 0 ? 0 : 1 },
          { key: 'v', type: 'vector', label: 'Vértice (xᵥ ; yᵥ)', answer: [xv, yv], paren: true, tol: 0.011 },
          { key: 'D', type: 'number', label: 'Discriminante Δ', answer: D, tol: 0.01 },
          { key: 'x', type: 'set', label: 'Raíces', answer: roots, slots: 2, labels: ['x₁', 'x₂'], allowEmpty: true },
        ],
        solution: `<p>$a=${a}$ ${a > 0 ? '> 0: concavidad hacia arriba' : '< 0: concavidad hacia abajo'}.</p>$$x_v=\\frac{-b}{2a}=\\frac{${-b}}{${2 * a}}=${tex(xv)}\\qquad y_v=f(${tex(xv)})=${tex(yv)}$$$$\\Delta=b^2-4ac=${D}${D < 0 ? '<0\\ \\Rightarrow\\ \\text{no hay raíces reales}' : D === 0 ? '=0\\ \\Rightarrow\\ \\text{raíz doble } x=' + tex(xv) : `>0\\ \\Rightarrow\\ x=\\dfrac{${-b}\\pm\\sqrt{${D}}}{${2 * a}}\\Rightarrow x_1\\approx ${tex(roots[0], 3)},\\ x_2\\approx ${tex(roots[1], 3)}`}$$`,
        chart: C().linesChart([{ label: 'f(x)', f: (x) => a * x * x + b * x + c, color: '#00455C' }], { xMin: xv - 5, xMax: xv + 5, n: 120, points: [{ x: xv, y: yv, label: 'V' }, ...roots.map((r) => ({ x: r, y: 0 }))] }),
      };
    }
    const a = rng.pick([1, -1, 2, -2, 3]), h = rng.intNZ(-4, 4), k = rng.intNZ(-6, 6);
    const b = -2 * a * h, c = a * h * h + k;
    return {
      topic: 'Función cuadrática', title: 'De forma canónica a forma polinómica',
      hint: 'Desarrollá el cuadrado: a(x − h)² + k = a·x² − 2ah·x + (a·h² + k).',
      statement: `<p>Dada la función en forma canónica $f(x)=${a === 1 ? '' : a === -1 ? '-' : a}(x${texSigned(-h)})^2${texSigned(k)}$, exprésela en forma polinómica $f(x)=ax^2+bx+c$ e indique su vértice.</p>`,
      items: [
        { key: 'b', type: 'number', label: 'Coeficiente b', answer: b, tol: 0.01 },
        { key: 'c', type: 'number', label: 'Coeficiente c (ordenada al origen)', answer: c, tol: 0.01 },
        { key: 'v', type: 'vector', label: 'Vértice (h ; k)', answer: [h, k], paren: true, tol: 0.011 },
      ],
      solution: `$$f(x)=${a}(x^2${texSigned(-2 * h)}x${texSigned(h * h)})${texSigned(k)}=${texPoly([a, b, c], 'x', 0)}$$<p>El vértice de la forma canónica es $V=${texVec(h, k)}$.</p>`,
    };
  };

  /* ======================= 13. SISTEMAS: CLASIFICACIÓN ======================= */
  G.math.sistemaClasificar = function (rng) {
    if (rng.bool(0.5)) {
      const kind = rng.int(0, 2); // 0 SCD, 1 SCI, 2 SI
      let a1, b1, c1, a2, b2, c2, x0, y0;
      if (kind === 0) {
        do { a1 = rng.intNZ(-4, 4); b1 = rng.intNZ(-4, 4); a2 = rng.intNZ(-4, 4); b2 = rng.intNZ(-4, 4); } while (a1 * b2 === a2 * b1);
        x0 = rng.int(-4, 4); y0 = rng.int(-4, 4);
        c1 = a1 * x0 + b1 * y0; c2 = a2 * x0 + b2 * y0;
      } else {
        const m = rng.pick([2, 3, -1, -2]);
        a1 = rng.intNZ(-4, 4); b1 = rng.intNZ(-4, 4); c1 = rng.int(-6, 6);
        a2 = a1 * m; b2 = b1 * m; c2 = kind === 1 ? c1 * m : c1 * m + rng.pick([1, 2, 3, -1, -2]);
      }
      const names = ['Compatible determinado (S.C.D.)', 'Compatible indeterminado (S.C.I.)', 'Incompatible (S.I.)'];
      const items = [{ key: 't', type: 'choice', label: 'Clasificación del sistema', options: names, answer: kind }];
      if (kind === 0) { items.push({ key: 'x', type: 'number', label: 'x =', answer: x0, tol: 0.011 }, { key: 'y', type: 'number', label: 'y =', answer: y0, tol: 0.011 }); }
      return {
        topic: 'Sistemas de ecuaciones', title: 'Clasificación de un sistema 2×2',
        hint: 'Si a₁/a₂ ≠ b₁/b₂: una solución (S.C.D.). Si los tres cocientes son iguales: infinitas soluciones (S.C.I.). Si a₁/a₂ = b₁/b₂ ≠ c₁/c₂: sin solución (S.I.).',
        statement: `<p>Resuelva el sistema de ecuaciones y clasifíquelo. Si tiene solución única, indíquela.</p>$$\\begin{cases}${coef(a1)}x${texSC(b1)}y=${c1}\\\\ ${coef(a2)}x${texSC(b2)}y=${c2}\\end{cases}$$`,
        items,
        solution: kind === 0
          ? `<p>Los coeficientes no son proporcionales ($\\frac{${a1}}{${a2}}\\ne\\frac{${b1}}{${b2}}$): el sistema es <b>compatible determinado</b>. Resolviendo por sustitución, igualación o reducción: $x=${x0}$, $y=${y0}$.</p>`
          : kind === 1
            ? `<p>La segunda ecuación es la primera multiplicada por $${a2 / a1}$: los cocientes $\\frac{a_1}{a_2}=\\frac{b_1}{b_2}=\\frac{c_1}{c_2}$ son iguales. Las dos rectas coinciden: <b>compatible indeterminado</b> (infinitas soluciones).</p>`
            : `<p>Los coeficientes de $x$ e $y$ son proporcionales (factor $${a2 / a1}$) pero el término independiente no. Las rectas son paralelas distintas: <b>incompatible</b> (sin solución).</p>`,
      };
    }
    const m = rng.pick([2, 3, -1, -2, 4]);
    const a1 = rng.intNZ(-3, 4), b1 = rng.intNZ(-4, 4), c1 = rng.intNZ(-6, 6);
    const sci = rng.bool();
    const kVal = a1 * m;
    const c2 = sci ? c1 * m : c1 * m + rng.pick([1, 2, 3]);
    return {
      topic: 'Sistemas de ecuaciones', title: 'Parámetro k en un sistema',
      hint: 'Para que las rectas sean coincidentes (S.C.I.) o paralelas (S.I.) los coeficientes de x e y deben ser proporcionales. El término independiente decide cuál de los dos casos ocurre.',
      statement: `<p>Determine el valor de "k" para que el sistema sea ${sci ? 'compatible indeterminado' : 'incompatible'}:</p>$$\\begin{cases}${coef(a1)}x${texSC(b1)}y=${c1}\\\\ kx${texSC(b1 * m)}y=${c2}\\end{cases}$$`,
      items: [{ key: 'k', type: 'number', label: 'k =', answer: kVal, tol: 0.01 }],
      solution: `<p>Los coeficientes de $y$ cumplen $\\dfrac{${b1 * m}}{${b1}}=${m}$; para que sean proporcionales debe ser $\\dfrac{k}{${a1}}=${m}\\Rightarrow k=${kVal}$.</p><p>Con ese valor, ${sci ? 'el término independiente también está multiplicado por ' + m + ': las ecuaciones son equivalentes (infinitas soluciones).' : 'el término independiente no está multiplicado por ' + m + ': las rectas son paralelas distintas (sin solución).'}</p>`,
    };
  };

  /* ======================= 14. TRIGONOMETRÍA: ÁNGULOS Y VALORES ======================= */
  G.math.angulosConversion = function (rng) {
    if (rng.bool(0.55)) {
      const degs = rng.sample([30, 45, 60, 90, 120, 135, 150, 210, 225, 240, 270, 300, 315, 330, 36, 72], 2);
      const radDen = rng.pick([[1, 6], [5, 6], [2, 3], [3, 4], [7, 6], [4, 3], [3, 2], [5, 4], [5, 3], [7, 4], [11, 6], [1, 4]]);
      const rd = radDen[0] * 180 / radDen[1];
      return {
        topic: 'Trigonometría', title: 'Sistema sexagesimal y circular',
        hint: 'π rad = 180°. De grados a radianes: α·π/180. De radianes a grados: α·180/π.',
        statement: `<p>Realice los siguientes pasajes de sistema de medición de ángulos:</p><ol class="list-[lower-alpha] pl-6"><li>${degs[0]}° a radianes</li><li>${degs[1]}° a radianes</li><li>$\\dfrac{${radDen[0] === 1 ? '' : radDen[0]}\\pi}{${radDen[1]}}$ rad a grados sexagesimales</li></ol><p class="hint">Radianes: puede escribir pi/6 o el decimal.</p>`,
        items: [
          { key: 'a', type: 'number', label: `a) ${degs[0]}° en radianes`, answer: degs[0] * Math.PI / 180, tol: 0.006 },
          { key: 'b', type: 'number', label: `b) ${degs[1]}° en radianes`, answer: degs[1] * Math.PI / 180, tol: 0.006 },
          { key: 'c', type: 'number', label: `c) ${radDen[0] === 1 ? '' : radDen[0]}π/${radDen[1]} rad en grados`, answer: rd, tol: 0.1 },
        ],
        solution: `<p>a) $${degs[0]}^\\circ\\cdot\\dfrac{\\pi}{180^\\circ}=${texFrac(degs[0] / 180, 60)}\\pi\\approx ${tex(degs[0] * Math.PI / 180, 3)}$ rad.</p>
<p>b) $${degs[1]}^\\circ\\cdot\\dfrac{\\pi}{180^\\circ}=${texFrac(degs[1] / 180, 60)}\\pi\\approx ${tex(degs[1] * Math.PI / 180, 3)}$ rad.</p>
<p>c) $\\dfrac{${radDen[0] === 1 ? '' : radDen[0]}\\pi}{${radDen[1]}}\\cdot\\dfrac{180^\\circ}{\\pi}=${tex(rd, 2)}^\\circ$.</p>`,
      };
    }
    const T = {
      sin: { 30: ['\\tfrac12', 0.5], 45: ['\\tfrac{\\sqrt2}{2}', Math.SQRT2 / 2], 60: ['\\tfrac{\\sqrt3}{2}', Math.sqrt(3) / 2] },
      cos: { 30: ['\\tfrac{\\sqrt3}{2}', Math.sqrt(3) / 2], 45: ['\\tfrac{\\sqrt2}{2}', Math.SQRT2 / 2], 60: ['\\tfrac12', 0.5] },
      tan: { 30: ['\\tfrac{\\sqrt3}{3}', Math.sqrt(3) / 3], 45: ['1', 1], 60: ['\\sqrt3', Math.sqrt(3)] },
    };
    const nm = { sin: '\\sin', cos: '\\cos', tan: '\\tan' };
    const pick = () => { const f = rng.pick(['sin', 'cos', 'tan']); const a = rng.pick([30, 45, 60]); return { f, a, t: T[f][a][0], v: T[f][a][1] }; };
    const t1 = pick(), t2 = pick(), t3 = pick();
    const prod = rng.bool();
    const val = prod ? t1.v * t2.v + t3.v : (t1.v + t2.v) / t3.v;
    const lab = (t) => `${nm[t.f]}\\,${t.a}^\\circ`;
    const expr = prod ? `${lab(t1)}\\cdot ${lab(t2)}+${lab(t3)}` : `\\frac{${lab(t1)}+${lab(t2)}}{${lab(t3)}}`;
    return {
      topic: 'Trigonometría', title: 'Valor numérico con ángulos notables',
      hint: 'Valores notables: sen30°=1/2, sen45°=√2/2, sen60°=√3/2 (el coseno los invierte); tan30°=√3/3, tan45°=1, tan60°=√3.',
      statement: `<p>Determine el valor numérico de la expresión (sin calculadora, usando los valores de los ángulos notables):</p>$$${expr}$$`,
      items: [{ key: 'v', type: 'number', label: 'Valor (decimal o con raíces)', answer: val, tol: 0.011 }],
      solution: `<p>${[t1, t2, t3].map((t) => `$${lab(t)}=${t.t}$`).join(', ')}.</p>$$${prod ? `${t1.t}\\cdot ${t2.t}+${t3.t}` : `\\frac{${t1.t}+${t2.t}}{${t3.t}}`}\\approx ${tex(val, 3)}$$`,
    };
  };

  G.math.funcionTrigTransformada = function (rng) {
    const A = rng.int(1, 5), D = rng.int(-3, 4), B = rng.pick([1, 2, 3, 4]);
    const Cs = [{ t: '\\frac{\\pi}{2}', v: Math.PI / 2 }, { t: '\\pi', v: Math.PI }, { t: '\\frac{\\pi}{4}', v: Math.PI / 4 }, { t: '\\frac{3\\pi}{2}', v: 3 * Math.PI / 2 }, { t: '\\frac{\\pi}{3}', v: Math.PI / 3 }];
    const Cc = rng.pick(Cs);
    const useCos = rng.bool(0.4);
    const fn = useCos ? 'cos' : 'sen';
    const T = 2 * Math.PI / B, desf = Cc.v / B;
    const f = (x) => A * (useCos ? Math.cos(B * x - Cc.v) : Math.sin(B * x - Cc.v)) + D;
    return {
      topic: 'Funciones trigonométricas', title: 'Función trigonométrica transformada',
      hint: 'f(x) = A·sen(Bx − C) + D: amplitud |A|, pulsación B, período 2π/B, ángulo de desfasaje C/B, desplazamiento vertical D, imagen [D − A ; D + A].',
      statement: `<p>Dada la función $f(x)=${A === 1 ? '' : A}\\,${fn}\\left(${B === 1 ? '' : B}x-${Cc.t}\\right)${D === 0 ? '' : texSigned(D)}$, determine amplitud, pulsación, período, ángulo de desfasaje e imagen.</p>`,
      items: [
        { key: 'A', type: 'number', label: 'Amplitud', answer: A, tol: 0.01 },
        { key: 'B', type: 'number', label: 'Pulsación B', answer: B, tol: 0.01 },
        { key: 'T', type: 'number', label: 'Período', answer: T, tol: 0.01 },
        { key: 'd', type: 'number', label: 'Ángulo de desfasaje C/B', answer: desf, tol: 0.01 },
        { key: 'im', type: 'vector', label: 'Imagen [mín ; máx]', answer: [D - A, D + A], paren: true },
      ],
      solution: `<p>Amplitud $A=${A}$; pulsación $B=${B}$; período $T=\\dfrac{2\\pi}{${B}}\\approx ${tex(T, 3)}$.</p><p>Ángulo de desfasaje: $\\dfrac{C}{B}=\\dfrac{${Cc.t}}{${B}}\\approx ${tex(desf, 3)}$ (corrimiento horizontal hacia la derecha).</p><p>Imagen: $[D-A;D+A]=[${D - A};${D + A}]$.</p>`,
      chart: C().linesChart([{ label: 'f(x)', f, color: '#00455C' }], { xMin: 0, xMax: Math.max(2 * T, desf + T), n: 200, xLabel: 'x', yLabel: 'f(x)' }),
    };
  };

  /* ======================= 15. FRACCIONES ALGEBRAICAS ======================= */
  G.math.fraccionesAlgebraicas = function (rng) {
    const a = rng.int(1, 5);
    let b;
    do { b = rng.int(1, 6); } while (b === a);
    const x0 = rng.pick([2, 3, 4, 5, 6, 7, 8].filter((v) => v !== a && v !== b));
    const T = [
      { e: `\\frac{1}{x-${a}}-\\frac{1}{x+${a}}`, r: `\\frac{${2 * a}}{x^2-${a * a}}`, w: [`\\frac{-${2 * a}}{x^2-${a * a}}`, `\\frac{${2 * a}}{x^2+${a * a}}`, `\\frac{2}{x^2-${a * a}}`], f: (x) => 1 / (x - a) - 1 / (x + a), s: `<p>Común denominador $(x-${a})(x+${a})=x^2-${a * a}$: $\\dfrac{(x+${a})-(x-${a})}{x^2-${a * a}}=\\dfrac{${2 * a}}{x^2-${a * a}}$.</p>` },
      { e: `\\frac{1}{x-${a}}+\\frac{1}{x-${b}}`, r: `\\frac{2x${texSigned(-(a + b))}}{(x-${a})(x-${b})}`, w: [`\\frac{2}{(x-${a})(x-${b})}`, `\\frac{2x${texSigned(a + b)}}{(x-${a})(x-${b})}`, `\\frac{1}{2x${texSigned(-(a + b))}}`], f: (x) => 1 / (x - a) + 1 / (x - b), s: `<p>Común denominador $(x-${a})(x-${b})$: $\\dfrac{(x-${b})+(x-${a})}{(x-${a})(x-${b})}=\\dfrac{2x${texSigned(-(a + b))}}{(x-${a})(x-${b})}$.</p>` },
      { e: `\\frac{x}{x^2-${a * a}}-\\frac{1}{x+${a}}`, r: `\\frac{${a}}{x^2-${a * a}}`, w: [`\\frac{x-1}{x^2-${a * a}}`, `\\frac{${a}}{x+${a}}`, `\\frac{2x-${a}}{x^2-${a * a}}`], f: (x) => x / (x * x - a * a) - 1 / (x + a), s: `<p>$x^2-${a * a}=(x-${a})(x+${a})$. Amplificamos el segundo término por $(x-${a})$: $\\dfrac{x-(x-${a})}{x^2-${a * a}}=\\dfrac{${a}}{x^2-${a * a}}$.</p>` },
      { e: `\\frac{x^2-${a * a}}{x+${b}}\\cdot\\frac{x+${b}}{x-${a}}`, r: `x+${a}`, w: [`x-${a}`, `\\frac{x+${a}}{x+${b}}`, `(x+${a})(x+${b})`], f: (x) => x + a, s: `<p>$x^2-${a * a}=(x-${a})(x+${a})$; se simplifican $(x+${b})$ y $(x-${a})$ y queda $x+${a}$.</p>` },
    ];
    const t = rng.pick(T);
    const val = t.f(x0);
    return {
      topic: 'Expresiones algebraicas', title: 'Operaciones con fracciones algebraicas',
      hint: 'Factorizá los denominadores, buscá el mínimo común denominador, operá en el numerador y simplificá. Para el producto: factorizá y simplificá factores iguales.',
      statement: `<p>Realice la operación entre expresiones algebraicas fraccionarias y simplifique:</p>$$${t.e}$$<p>Luego calcule el valor numérico para $x=${x0}$.</p>`,
      items: [
        mkChoice(rng, 'r', 'Resultado simplificado', t.r, t.w),
        { key: 'v', type: 'number', label: `Valor para x = ${x0}`, answer: val, tol: 0.011 },
      ],
      solution: `${t.s}<p>Resultado: $${t.r}$. Para $x=${x0}$ vale $${tex(val, 4)}$.</p>`,
    };
  };

  /* ======================= 16. MAGNITUDES FÍSICAS ======================= */
  G.fisica.magnitudes = function (rng) {
    const fund = [['la longitud', 'metro (m)'], ['la masa', 'kilogramo (kg)'], ['el tiempo', 'segundo (s)'], ['la temperatura', 'kelvin (K)'], ['la intensidad de corriente eléctrica', 'ampere (A)'], ['la cantidad de sustancia', 'mol'], ['la intensidad luminosa', 'candela (cd)']];
    const deri = [['la velocidad', 'derivada'], ['la aceleración', 'derivada'], ['la fuerza', 'derivada'], ['el volumen', 'derivada'], ['la densidad', 'derivada'], ['la energía', 'derivada'], ['la presión', 'derivada']];
    const pickF = rng.sample(fund, 2), pickD = rng.sample(deri, 2);
    const q1 = rng.shuffle([...pickF.map((q) => ({ n: q[0], fund: true })), ...pickD.map((q) => ({ n: q[0], fund: false }))]).slice(0, 4);
    const esc = [['la masa'], ['la temperatura'], ['el tiempo'], ['la energía'], ['la densidad'], ['el volumen']];
    const vec = [['la velocidad'], ['la aceleración'], ['la fuerza'], ['el desplazamiento']];
    const q2 = rng.shuffle([{ n: rng.pick(esc)[0], vec: false }, { n: rng.pick(vec)[0], vec: true }]);
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    return {
      topic: 'Magnitudes físicas', title: 'Clasificación de magnitudes',
      hint: 'Fundamentales (SI): longitud, masa, tiempo, temperatura, intensidad de corriente, cantidad de sustancia e intensidad luminosa. Las derivadas se obtienen combinándolas. Vectorial = módulo, dirección y sentido.',
      statement: `<p>Clasifique las siguientes magnitudes físicas.</p>`,
      items: [
        ...q1.map((q, i) => ({ key: 'f' + i, type: 'choice', label: `${cap(q.n)}: ¿fundamental o derivada?`, options: ['Fundamental', 'Derivada'], answer: q.fund ? 0 : 1 })),
        ...q2.map((q, i) => ({ key: 'v' + i, type: 'choice', label: `${cap(q.n)}: ¿escalar o vectorial?`, options: ['Escalar', 'Vectorial'], answer: q.vec ? 1 : 0 })),
      ],
      solution: `<ul>${q1.map((q) => `<li>${cap(q.n)} es una magnitud <b>${q.fund ? 'fundamental' : 'derivada'}</b>.</li>`).join('')}${q2.map((q) => `<li>${cap(q.n)} es una magnitud <b>${q.vec ? 'vectorial' : 'escalar'}</b>${q.vec ? ' (necesita módulo, dirección y sentido)' : ' (queda definida con un número y su unidad)'}.</li>`).join('')}</ul>`,
    };
  };
  /* ======================= 17. NÚMEROS COMPLEJOS ======================= */
  // como en el final: |conj(z)| con z = [(a + bi) + iⁿ] / (c + di)
  G.math.complejos = function (rng) {
    const c = rng.pick([1, 1, 2]), d = rng.pick(c === 1 ? [1, -1, 2, -2] : [1, -1]);
    let p, q;
    do { p = rng.intNZ(-7, 7); q = rng.int(-7, 7); } while (q === 0 && rng.bool(0.7));
    const k = rng.int(0, 3), pw = [[1, 0], [0, 1], [-1, 0], [0, -1]][k], n = 4 * rng.int(2, 7) + k;
    const Nre = p * c - q * d, Nim = p * d + q * c, a = Nre - pw[0], b = Nim - pw[1];
    const num = b === 0 ? `(${a})` : `(${a}${texSC(b)}i)`;
    const zt = (re, im) => (im === 0 ? tex(re) : `${re === 0 ? '' : tex(re)}${re === 0 && im > 0 ? '' : im > 0 ? '+' : '-'}${Math.abs(im) === 1 ? '' : tex(Math.abs(im))}i`);
    const den = c * c + d * d, mod = Math.hypot(p, q);
    return {
      topic: 'Números complejos', title: 'Módulo del conjugado de un cociente',
      hint: 'Las potencias de i se repiten cada 4: iⁿ = i^(resto de n÷4). Cociente: multiplicá numerador y denominador por el conjugado del denominador. Conjugado: cambiá el signo de la parte imaginaria; tiene el mismo módulo √(a² + b²).',
      statement: `<p>Determine el módulo del complejo conjugado siendo</p>$$z=\\dfrac{\\left[${num}+i^{${n}}\\right]}{${c}${texSC(d)}i}$$`,
      items: [
        { key: 'zc', type: 'vector', label: 'Conjugado z̄ = (parte real ; parte imaginaria)', answer: [p, -q], tol: 0.011 },
        { key: 'mod', type: 'number', label: '|z̄|', answer: mod, tol: 0.011 },
      ],
      solution: `<p>$i^{${n}}=i^{${k}}=${['1', 'i', '-1', '-i'][k]}$ (${n} = 4·${(n - k) / 4} + ${k}), entonces el numerador es $${zt(Nre, Nim)}$.</p>
<p>Multiplicamos por el conjugado del denominador:</p>$$z=\\dfrac{(${zt(Nre, Nim)})(${c}${texSC(-d)}i)}{${c * c}+${d * d}}=\\dfrac{${zt(Nre * c + Nim * d, Nim * c - Nre * d)}}{${den}}=${zt(p, q)}$$
<p>$\\overline{z}=${zt(p, -q)}$ y $|\\overline{z}|=\\sqrt{${p * p}+${q * q}}${Number.isInteger(mod) ? '' : `=\\sqrt{${p * p + q * q}}`}\\approx${tex(mod, 3)}$.</p>`,
    };
  };
})(window);
