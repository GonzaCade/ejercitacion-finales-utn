/* ==========================================================================
   gen-final.js — Generadores calcados del final del 3/11/2026 (Temas A y B).
   Un generador por punto del examen real; el nivel "Final" usa solo estos.
   ========================================================================== */
(function (global) {
  'use strict';
  const { tex, texSigned, texSC, texPoly, texFrac, texVec, fmt, round, quadRoots, polyMul, polyEval, toDeg, toRad } = global.U;
  const G = global.GEN = global.GEN || {};
  G.math = G.math || {};
  const C = () => global.C;
  const xs = (k) => (k === 0 ? 'x' : `x${texSigned(k)}`);
  const choice = (rng, key, label, correct, wrongs) => {
    const opts = [correct];
    wrongs.forEach((w) => { if (!opts.includes(w)) opts.push(w); });
    const sh = rng.shuffle(opts.slice(0, 4));
    return { key, type: 'choice', label, options: sh.map((o) => `$${o}$`), answer: sh.indexOf(correct) };
  };
  const iv = (lo, hi, lc, hc) => `${lc ? '[' : '('}${lo === -Infinity ? '-\\infty' : texFrac(lo)}\\,;\\,${hi === Infinity ? '+\\infty' : texFrac(hi)}${hc ? ']' : ')'}`;

  /* ---------- 1. Cálculo combinado + notación científica ---------- */
  G.math.finalCalculo = function (rng) {
    let expr, value, sol;
    if (rng.bool()) {
      // [(p/q)^-1 − r/s]·√(m²/n²) + ⁴√(k⁴) − ∛(−j³)
      const [p, q] = rng.pick([[2, 3], [3, 4], [2, 5], [3, 5], [4, 5]]), [r, s] = rng.pick([[1, 2], [1, 3], [1, 4]]);
      const [m, n] = rng.pick([[4, 5], [3, 4], [2, 3], [5, 6], [3, 5]]), k = rng.pick([2, 3]), j = rng.pick([2, 3]);
      const br = q / p - r / s;
      value = br * (m / n) + k + j;
      expr = `\\left[\\left(\\tfrac{${p}}{${q}}\\right)^{-1}-\\tfrac{${r}}{${s}}\\right]\\cdot\\sqrt{\\tfrac{${m * m}}{${n * n}}}+\\sqrt[4]{${k ** 4}}-\\sqrt[3]{-${j ** 3}}`;
      sol = `$$\\left(\\tfrac{${q}}{${p}}-\\tfrac{${r}}{${s}}\\right)\\cdot\\tfrac{${m}}{${n}}+${k}-(-${j})=${texFrac(br, 100)}\\cdot\\tfrac{${m}}{${n}}+${k + j}=${texFrac(value, 400)}$$`;
    } else {
      // [√(m²/n²) − ∛(−j³)] / ⁴√(k⁴) + (−2)^−2
      const [m, n] = rng.pick([[5, 2], [3, 2], [7, 2], [4, 3], [5, 3]]), j = rng.pick([2, 3, 5]), k = rng.pick([2, 3, 5]);
      value = (m / n + j) / k + 0.25;
      expr = `\\dfrac{\\left[\\sqrt{\\tfrac{${m * m}}{${n * n}}}-\\sqrt[3]{-${j ** 3}}\\right]}{\\sqrt[4]{${k ** 4}}}+(-2)^{-2}`;
      sol = `$$\\dfrac{\\tfrac{${m}}{${n}}+${j}}{${k}}+\\tfrac{1}{4}=\\dfrac{${texFrac(m / n + j, 100)}}{${k}}+\\tfrac14=${texFrac((m / n + j) / k, 100)}+\\tfrac14=${texFrac(value, 400)}$$`;
    }
    const a = rng.pick([2, 3, 4, 5, 6, 8]), b = rng.pick([1.5, 2.5, 3.5, 4.5, 5.5, 1.2, 2.4]), e = rng.int(3, 5), f = rng.int(1, 3);
    const obj = rng.pick([['piezas de metal', 'una maquinaria'], ['piezas de madera', 'muebles'], ['tornillos', 'una estructura'], ['chips', 'placas electrónicas']]);
    let man = round(a * b, 3), ex = e + f - 6;
    if (man >= 10) { man = round(man / 10, 4); ex++; }
    return {
      topic: 'Cálculo numérico', title: 'Cálculo combinado y notación científica',
      hint: 'Exponente −1: invertí la fracción. Raíz de índice impar de un negativo es negativa. 1 kg = 10⁶ mg: multiplicá mantisas, sumá exponentes y restá 6.',
      statement: `<p><b>a.</b> Calcule y simplifique:</p>$$${expr}$$<p><b>b.</b> Un lote contiene $${a}\\times10^{${e}}$ ${obj[0]} para la construcción de ${obj[1]} de $${tex(b)}\\times10^{${f}}$ mg cada una. Calcule la masa total del lote en kg y exprésela en notación científica.</p>`,
      items: [
        { key: 'r', type: 'number', label: 'a. Resultado', answer: value, tol: 0.011 },
        { key: 'm', type: 'number', label: 'b. Masa en kg — mantisa m (1 ≤ m < 10)', answer: man, tol: 0.006 },
        { key: 'n', type: 'number', label: 'b. Masa en kg — exponente n', answer: ex, tol: 0 },
      ],
      solution: `<p><b>a.</b></p>${sol}<p><b>b.</b> $${a}\\times10^{${e}}\\cdot ${tex(b)}\\times10^{${f}}\\text{ mg}=${tex(round(a * b, 3))}\\times10^{${e + f}}\\text{ mg}$. Como $1\\text{ kg}=10^{6}\\text{ mg}$, se divide por $10^6$:</p>$$${tex(man, 4)}\\times10^{${ex}}\\text{ kg}$$`,
    };
  };

  /* ---------- 2. Polinomio con resto y divisibilidad (cuártico) ---------- */
  G.math.finalPolinomioResto = function (rng) {
    let roots, P, s, R;
    for (let t = 0; t < 300; t++) {
      roots = rng.sample([-4, -3, -2, -1, 1, 2, 3, 4], 4);
      P = roots.reduce((acc, r) => polyMul(acc, [1, -r]), [1]);
      s = rng.pick([1, -1, 2, -2]);
      R = polyEval(P, s);
      if (Math.abs(P[4]) <= 36 && Math.abs(roots[0]) !== Math.abs(s) && R !== 0 && P[1] !== 0 && P[2] !== 0 && P[3] !== 0) break;
    }
    const r0 = roots[0], [, a, c2, b, d] = P;
    const sorted = roots.slice().sort((x, y) => x - y);
    const fac = sorted.map((r) => `(x${texSigned(-r)})`).join('');
    return {
      topic: 'Polinomios', title: 'Teorema del resto y divisibilidad',
      hint: 'Resto de dividir por (x − s) = P(s). Divisible por (x − r) ⇔ P(r) = 0. Armá el sistema 2×2 en a y b; después Ruffini con la raíz conocida.',
      statement: `<p>Se considera el polinomio $P(x)=x^4+a\\,x^3${texSC(c2)}x^2+b\\,x${texSigned(d)}$. Se sabe que al dividir $P(x)$ por $(x${texSigned(-s)})$ se obtiene un resto igual a ${fmt(R)}, y que $P(x)$ es divisible por $(x${texSigned(-r0)})$.</p><ul><li><b>a.</b> Determine los coeficientes a y b.</li><li><b>b.</b> Halle todas las raíces reales de $P(x)$ y expréselo en forma factorizada.</li></ul>`,
      items: [
        { key: 'a', type: 'number', label: 'a', answer: a, tol: 0 },
        { key: 'b', type: 'number', label: 'b', answer: b, tol: 0 },
        { key: 'roots', type: 'set', label: 'Raíces reales de P(x)', answer: sorted, slots: 4, labels: ['x₁', 'x₂', 'x₃', 'x₄'] },
      ],
      solution: `<p>Teorema del resto: $P(${tex(s)})=${tex(R)}$ y $P(${tex(r0)})=0$:</p>
$$\\begin{cases}${tex(s ** 4)}${texSC(s ** 3)}a${texSigned(c2 * s * s)}${texSC(s)}b${texSigned(d)}=${tex(R)}\\\\ ${tex(r0 ** 4)}${texSC(r0 ** 3)}a${texSigned(c2 * r0 * r0)}${texSC(r0)}b${texSigned(d)}=0\\end{cases}\\Rightarrow a=${tex(a)},\\ b=${tex(b)}$$
<p>$P(x)=${texPoly(P)}$. Ruffini con $x=${tex(r0)}$ y luego Gauss/resolvente sobre el cociente dan las raíces $${sorted.map((r) => tex(r)).join(';\\ ')}$.</p>$$P(x)=${fac}$$`,
    };
  };

  /* ---------- 3. Valor absoluto: tolerancia o dominio ---------- */
  G.math.finalModulo = function (rng) {
    if (rng.bool()) {
      const [obj, n] = rng.pick([['Un eje cilíndrico de motor', 25], ['Un perno de acero', 12], ['Un rodamiento', 40], ['Un pistón', 50], ['Un tubo de aluminio', 18]]);
      const t = rng.pick([0.08, 0.05, 0.1, 0.02, 0.15]);
      const off = rng.pick([-t - 0.01, -t + 0.01, t - 0.01, t + 0.01, t + 0.02, -t - 0.02]);
      const p = round(n + off, 2), ok = Math.abs(p - n) <= t + 1e-9;
      return {
        topic: 'Valor absoluto', title: 'Tolerancia con valor absoluto',
        hint: '|d − n| ≤ t ⇔ −t ≤ d − n ≤ t ⇔ n − t ≤ d ≤ n + t. La pieza se acepta si cae dentro del intervalo.',
        statement: `<p>${obj} debe fabricarse con un diámetro nominal de ${fmt(n)} mm. La tolerancia está dada por la expresión $|d-${n}|\\le ${tex(t)}\\text{ mm}$. Determine el intervalo de diámetros aceptables e indique si una pieza de ${fmt(p)} mm es aceptada o rechazada.</p>`,
        items: [
          { key: 'lo', type: 'number', label: 'Diámetro mínimo aceptable (mm)', answer: round(n - t, 2), tol: 0.001 },
          { key: 'hi', type: 'number', label: 'Diámetro máximo aceptable (mm)', answer: round(n + t, 2), tol: 0.001 },
          { key: 'ok', type: 'choice', label: `La pieza de ${fmt(p)} mm es…`, options: ['Aceptada', 'Rechazada'], answer: ok ? 0 : 1 },
        ],
        solution: `$$|d-${n}|\\le ${tex(t)}\\iff -${tex(t)}\\le d-${n}\\le ${tex(t)}\\iff ${tex(n - t)}\\le d\\le ${tex(n + t)}$$<p>Intervalo aceptable: $[${tex(n - t)}\\,;\\,${tex(n + t)}]$ mm. Como $${tex(p)}${ok ? '\\in' : '\\notin'}[${tex(n - t)};${tex(n + t)}]$, la pieza es <b>${ok ? 'aceptada' : 'rechazada'}</b>.</p>`,
      };
    }
    // f(x) = √(|ax − b|² − k|ax − b| − m) con t² − kt − m = (t − r2)(t + r1)
    const a = rng.pick([1, 2, 2, 3]), b = rng.intNZ(-4, 4), r2 = rng.int(2, 6), r1 = rng.int(1, Math.min(3, r2 - 1));
    const k = r2 - r1, m = r1 * r2, L = (b - r2) / a, H = (b + r2) / a;
    const abs = `|${a === 1 ? '' : a}x${texSigned(-b)}|`;
    const correct = `${iv(-Infinity, L, false, true)}\\cup ${iv(H, Infinity, true, false)}`;
    return {
      topic: 'Valor absoluto', title: 'Dominio con valor absoluto',
      hint: 'El radicando debe ser ≥ 0. Cambio t = |ax − b| (t ≥ 0), factorizá la cuadrática en t y volvé a x: |u| ≥ c ⇔ u ≤ −c o u ≥ c.',
      statement: `<p>Halle el dominio de la función $f(x)=\\sqrt{${abs}^2${texSC(-k)}${abs}-${m}}$ y exprese el resultado en notación de intervalos sobre la recta real.</p>`,
      items: [
        { key: 'e', type: 'set', label: 'Extremos del dominio', answer: [L, H], slots: 2, labels: ['x₁', 'x₂'] },
        choice(rng, 'd', 'Dominio', correct, [iv(L, H, true, true), `${iv(-Infinity, L, false, false)}\\cup ${iv(H, Infinity, false, false)}`, `${iv(-Infinity, (b - r1) / a, false, true)}\\cup ${iv((b + r1) / a, Infinity, true, false)}`]),
      ],
      solution: `<p>Debe ser $${abs}^2${texSC(-k)}${abs}-${m}\\ge0$. Con $t=${abs}\\ge0$: $t^2${texSC(-k)}t-${m}=(t-${r2})(t+${r1})\\ge0\\Rightarrow t\\le-${r1}$ (imposible) o $t\\ge${r2}$.</p>
<p>$${abs}\\ge${r2}\\iff ${a === 1 ? '' : a}x${texSigned(-b)}\\le-${r2}$ o $${a === 1 ? '' : a}x${texSigned(-b)}\\ge${r2}\\iff x\\le${texFrac(L)}$ o $x\\ge${texFrac(H)}$.</p>$$D_f=${correct}$$`,
    };
  };

  /* ---------- 4. Vectores con condición sobre el módulo ---------- */
  G.math.finalVectores = function (rng) {
    let u, w, x, st, sol;
    if (rng.bool()) {
      // u = (x ; x + a), w = (x + b ; x − c) mismo módulo → x(2a − 2b + 2c) = b² + c² − a²
      let a, b, c;
      for (let t = 0; t < 500; t++) {
        a = rng.intNZ(-4, 4); b = rng.intNZ(-4, 4); c = rng.intNZ(-4, 4);
        const den = 2 * (a - b + c), num = b * b + c * c - a * a;
        x = den ? num / den : NaN;
        if (Number.isInteger(x) && x !== 0 && x + a !== 0 && x + b !== 0 && x - c !== 0 && Math.abs(x) <= 8) break;
      }
      if (!Number.isInteger(x)) { a = 1; b = 2; c = 3; x = 3; }
      u = [x, x + a]; w = [x + b, x - c];
      st = `<p>Considerando que los vectores $\\vec u=(x\\,;\\,${xs(a)})$ y $\\vec w=(${xs(b)}\\,;\\,${xs(-c)})$ tienen el mismo módulo:</p>`;
      sol = `<p>$|\\vec u|^2=|\\vec w|^2$: $x^2+(${xs(a)})^2=(${xs(b)})^2+(${xs(-c)})^2$. Los $2x^2$ se cancelan y queda una ecuación lineal: $${tex(2 * a)}x${texSigned(a * a)}=${tex(2 * (b - c))}x${texSigned(b * b + c * c)}\\Rightarrow x=${tex(x)}$.</p>`;
    } else {
      // |w| = k|u| con w = (kx + q ; k·e), u = (x + d ; e)
      const k = rng.pick([2, 3]), e = rng.intNZ(-5, 5);
      let d, q;
      for (let t = 0; t < 200; t++) {
        x = rng.intNZ(-5, 6); d = rng.intNZ(-4, 4); q = -2 * k * x - k * d;
        if (x + d !== 0 && q !== 0) break;
      }
      u = [x + d, e]; w = [k * x + q, k * e];
      st = `<p>Considerando que el vector $\\vec w=(${k}x${texSigned(q)}\\,;\\,${k * e})$ tiene el ${k === 2 ? 'doble' : 'triple'} de módulo respecto del vector $\\vec u=(${xs(d)}\\,;\\,${e})$:</p>`;
      sol = `<p>$|\\vec w|^2=${k * k}|\\vec u|^2$: $(${k}x${texSigned(q)})^2+${k * k * e * e}=${k * k}\\left[(${xs(d)})^2+${e * e}\\right]$. Los términos en $x^2$ y las constantes ${k * k * e * e} se cancelan: $${tex(2 * k * q)}x${texSigned(q * q)}=${tex(2 * k * k * d)}x${texSigned(k * k * d * d)}\\Rightarrow x=${tex(x)}$.</p>`;
    }
    return {
      topic: 'Vectores', title: 'Vectores con condición sobre el módulo',
      hint: 'Módulo: |v| = √(v₁² + v₂²). Elevá al cuadrado ambos lados de la condición: los x² se cancelan y queda una ecuación lineal.',
      statement: `${st}<ul><li><b>a.</b> Halle el valor de x.</li><li><b>b.</b> Exprese las componentes de ambos vectores y represéntelos gráficamente.</li></ul>`,
      items: [
        { key: 'x', type: 'number', label: 'Valor de x', answer: x, tol: 0 },
        { key: 'u', type: 'vector', label: 'Vector u', answer: u, tol: 0 },
        { key: 'w', type: 'vector', label: 'Vector w', answer: w, tol: 0 },
      ],
      solution: `${sol}$$\\vec u=${texVec(...u)}\\qquad\\vec w=${texVec(...w)}\\qquad |\\vec u|=${tex(Math.hypot(...u))},\\ |\\vec w|=${tex(Math.hypot(...w))}$$`,
      figure2: C() && C().vectorsSVG ? C().vectorsSVG([{ x: u[0], y: u[1], label: 'u', color: '#00455C' }, { x: w[0], y: w[1], label: 'w', color: '#d97706' }]) : null,
    };
  };

  /* ---------- 5. Ecuación logarítmica con dominio ---------- */
  G.math.finalLog = function (rng) {
    if (rng.bool()) {
      // log(x + p) − log(x + q) = log k → x = solución entera
      const k = rng.pick([2, 3, 4]), q = rng.intNZ(-5, 3);
      const x = -q + rng.int(1, 4), p = k * (x + q) - x;
      const sub = rng.pick(['', '', '_{2}', '_{3}']);
      const dom = iv(-q, Infinity, false, false);
      return {
        topic: 'Logaritmos', title: 'Ecuación logarítmica',
        hint: 'Dominio: cada argumento > 0. log A − log B = log(A/B); si log M = log N entonces M = N. Verificá que la solución esté en el dominio.',
        statement: `<ul><li><b>a.</b> Resuelva la siguiente ecuación:</li></ul>$$\\log${sub}(${xs(p)})-\\log${sub}(${xs(q)})=\\log${sub}${k}$$<ul><li><b>b.</b> Determine el dominio.</li></ul>`,
        items: [
          { key: 'x', type: 'number', label: 'Solución x', answer: x, tol: 0 },
          choice(rng, 'dom', 'Dominio', dom, [iv(-p, Infinity, false, false), iv(-q, Infinity, true, false), iv(-Infinity, -q, false, false), `\\mathbb{R}-\\{${tex(-q)}\\}`]),
        ],
        solution: `<p><b>Dominio:</b> $${xs(p)}>0\\Rightarrow x>${tex(-p)}$ y $${xs(q)}>0\\Rightarrow x>${tex(-q)}$, entonces $D=${dom}$.</p>
<p>$\\log${sub}\\dfrac{${xs(p)}}{${xs(q)}}=\\log${sub}${k}\\Rightarrow ${xs(p)}=${k}(${xs(q)})\\Rightarrow x=${tex(x)}\\in D$ ✓</p>`,
      };
    }
    // log_b x + log_b(2x − c) − log_b(dx + e) = 0 → 2x² − (c + d)x − e = 0
    let x1, x2, c, d, e;
    for (let t = 0; t < 200; t++) {
      x1 = rng.int(2, 5); x2 = rng.pick([-0.5, -1, -1.5]);
      const s = 2 * (x1 + x2); e = -2 * x1 * x2;
      if (s < 2) continue;
      c = rng.int(1, s - 1); d = s - c;
      if (c < 2 * x1) break;
    }
    const b = rng.pick([2, 3, 5]);
    const dom = iv(c / 2, Infinity, false, false);
    return {
      topic: 'Logaritmos', title: 'Ecuación logarítmica',
      hint: 'Dominio: cada argumento > 0. Agrupá: log x + log A − log B = log(x·A/B) = 0 ⇒ x·A/B = 1. Resolvé la cuadrática y descartá lo que no esté en el dominio.',
      statement: `<ul><li><b>a.</b> Resuelva la siguiente ecuación:</li></ul>$$\\log_{${b}}x+\\log_{${b}}(2x-${c})-\\log_{${b}}(${d === 1 ? '' : d}x+${e})=0$$<ul><li><b>b.</b> Determine el dominio.</li></ul>`,
      items: [
        { key: 'x', type: 'number', label: 'Solución x (válida)', answer: x1, tol: 0 },
        choice(rng, 'dom', 'Dominio', dom, [iv(0, Infinity, false, false), iv(c / 2, Infinity, true, false), iv(-e / d, Infinity, false, false), '\\mathbb{R}']),
      ],
      solution: `<p><b>Dominio:</b> $x>0$, $2x-${c}>0\\Rightarrow x>${texFrac(c / 2)}$ y $${d === 1 ? '' : d}x+${e}>0\\Rightarrow x>${texFrac(-e / d)}$. Entonces $D=${dom}$.</p>
<p>$\\log_{${b}}\\dfrac{x(2x-${c})}{${d === 1 ? '' : d}x+${e}}=0\\Rightarrow x(2x-${c})=${d === 1 ? '' : d}x+${e}\\Rightarrow 2x^2${texSC(-(c + d))}x${texSigned(-e)}=0$.</p>
<p>Resolvente: $x_1=${tex(x1)}$ y $x_2=${texFrac(x2)}$ (se descarta, no pertenece al dominio). Solución: $x=${tex(x1)}$.</p>`,
    };
  };

  /* ---------- 6. Rectas perpendiculares ---------- */
  G.math.finalRectas = function (rng) {
    let m1, b1, st, sol1;
    if (rng.bool()) {
      let A, B;
      do { A = [rng.int(-5, 5), rng.int(-5, 6)]; B = [rng.int(-5, 6), rng.int(-5, 6)]; } while (A[0] === B[0] || A[1] === B[1]);
      m1 = (B[1] - A[1]) / (B[0] - A[0]); b1 = A[1] - m1 * A[0];
      st = `la recta $L_1$ que pasa por los puntos $A=(${A[0]}\\,;\\,${A[1]})$ y $B=(${B[0]}\\,;\\,${B[1]})$, halle su ecuación explícita`;
      sol1 = `<p>$m_1=\\dfrac{${B[1]}-(${A[1]})}{${B[0]}-(${A[0]})}=${texFrac(m1)}$; reemplazando $A$: $${A[1]}=${texFrac(m1)}\\cdot(${A[0]})+b_1\\Rightarrow b_1=${texFrac(b1)}$.</p>`;
    } else {
      const a = rng.intNZ(-6, 6), bb = rng.pick([1, 2, 3, -2]), cc = rng.intNZ(-10, 10);
      m1 = -a / bb; b1 = -cc / bb;
      st = `la recta $L_1$ expresada en su forma implícita $${a}x${texSC(bb)}y${texSigned(cc)}=0$, escríbala en su forma explícita, indique su pendiente`;
      sol1 = `<p>Despejando $y$: $${bb === 1 ? '' : bb === -1 ? '-' : bb}y=${tex(-a)}x${texSigned(-cc)}\\Rightarrow y=${texFrac(m1)}x${b1 < 0 ? '-' : '+'}${texFrac(Math.abs(b1))}$, con $m_1=${texFrac(m1)}$.</p>`;
    }
    const P = [rng.intNZ(-4, 4), rng.intNZ(-4, 4)];
    const m2 = -1 / m1, b2 = P[1] - m2 * P[0];
    return {
      topic: 'Rectas', title: 'Recta perpendicular por un punto',
      hint: 'Pendiente por dos puntos: m = (y₂ − y₁)/(x₂ − x₁). Perpendiculares: m₂ = −1/m₁. La ordenada sale reemplazando el punto en y = mx + b.',
      statement: `<p>Dada ${st} y encuentre la ecuación explícita de la recta $L_2$ que es perpendicular a $L_1$ y pasa por el punto $P=(${P[0]}\\,;\\,${P[1]})$.</p>`,
      items: [
        { key: 'm1', type: 'number', label: 'Pendiente de L₁', answer: m1 },
        { key: 'b1', type: 'number', label: 'Ordenada al origen de L₁', answer: b1 },
        { key: 'm2', type: 'number', label: 'Pendiente de L₂', answer: m2 },
        { key: 'b2', type: 'number', label: 'Ordenada al origen de L₂', answer: b2 },
      ],
      solution: `${sol1}<p>$m_2=-\\dfrac{1}{m_1}=${texFrac(m2)}$; por $P$: $${P[1]}=${texFrac(m2)}\\cdot(${P[0]})+b_2\\Rightarrow b_2=${texFrac(b2)}$.</p>$$L_2:\\ y=${texFrac(m2)}x${b2 < 0 ? '-' : '+'}${texFrac(Math.abs(b2))}$$`,
      chart: C().linesChart([{ label: 'L1', f: (x) => m1 * x + b1, color: '#00455C' }, { label: 'L2', f: (x) => m2 * x + b2, color: '#d97706' }], { xMin: P[0] - 6, xMax: P[0] + 6, points: [{ x: P[0], y: P[1], label: 'P' }] }),
    };
  };

  /* ---------- 7. Función cuadrática en contexto (tiro vertical) ---------- */
  G.math.finalCuadratica = function (rng) {
    if (rng.bool()) {
      const v0 = rng.pick([20, 30, 40, 50]), h0 = rng.pick([20, 45, 60, 80, 100]), t1 = rng.pick([1, 2, 3]);
      const H1 = -5 * t1 * t1 + v0 * t1 + h0, tv = v0 / 10, hm = -5 * tv * tv + v0 * tv + h0, ts = quadRoots(-5, v0, h0)[1];
      return {
        topic: 'Función cuadrática', title: 'Tiro vertical: velocidad inicial y altura máxima',
        hint: 'Reemplazá t = 2 y S = dato para despejar v₀. Vértice: t_v = −b/(2a). Llega al suelo cuando S(t) = 0 (raíz positiva).',
        statement: `<p>Un proyectil se lanza verticalmente hacia arriba desde la terraza de un edificio. Su altura $S(t)$ en metros respecto del suelo, a los t segundos de ser lanzado, está expresada por la función $S(t)=-5t^2+v_0\\,t+${h0}$. Sabiendo que a los ${t1} segundos del lanzamiento el proyectil alcanza una altura de ${fmt(H1)} metros respecto del suelo, determine:</p><ul><li><b>a.</b> El valor de la velocidad inicial y la fórmula completa de $S(t)$.</li><li><b>b.</b> El instante en que la altura es máxima, la altura alcanzada en ese instante y el momento en el que el objeto llega al suelo.</li><li><b>c.</b> Dominio, imagen y ordenada al origen en el contexto del problema. Grafique.</li></ul>`,
        items: [
          { key: 'v0', type: 'number', label: 'v₀ (m/s)', answer: v0 },
          { key: 'tv', type: 'number', label: 'Instante de altura máxima (s)', answer: tv },
          { key: 'hm', type: 'number', label: 'Altura máxima (m)', answer: hm },
          { key: 'ts', type: 'number', label: 'Instante en que llega al suelo (s)', answer: ts, tol: 0.02 },
          { key: 'oo', type: 'number', label: 'Ordenada al origen (m)', answer: h0 },
        ],
        solution: `<p><b>a.</b> $S(${t1})=${fmt(H1)}$: $-5\\cdot${t1 * t1}+${t1}v_0+${h0}=${fmt(H1)}\\Rightarrow v_0=${v0}$ m/s. $S(t)=-5t^2+${v0}t+${h0}$.</p>
<p><b>b.</b> $t_v=-\\dfrac{${v0}}{2\\cdot(-5)}=${tex(tv)}$ s; $S(${tex(tv)})=${tex(hm)}$ m. $S(t)=0\\Rightarrow t=\\dfrac{-${v0}\\pm\\sqrt{${v0 * v0}+${20 * h0}}}{-10}$: $t\\approx${tex(ts, 3)}$ s (la raíz negativa se descarta).</p>
<p><b>c.</b> Dominio $[0\\,;\\,${tex(ts)}]$, imagen $[0\\,;\\,${tex(hm)}]$, ordenada al origen $S(0)=${h0}$ m: la altura de la terraza desde la que se lanza.</p>`,
        chart: C().linesChart([{ label: 'S(t)', f: (t) => -5 * t * t + v0 * t + h0, color: '#00455C' }], { xMin: 0, xMax: ts, xLabel: 't (s)', yLabel: 'S (m)', points: [{ x: tv, y: hm, label: 'Máx' }, { x: ts, y: 0 }] }),
      };
    }
    const h = rng.pick([30, 45, 60, 80]), v0 = rng.pick([2, 5, 8, 10]);
    let t1 = 2; if (-4.9 * 4 - 2 * v0 + h <= 0) t1 = 1;
    const y1 = -4.9 * t1 * t1 - v0 * t1 + h, ts = quadRoots(-4.9, -v0, h)[1];
    const obj = rng.pick(['un puente', 'un edificio', 'un acantilado']);
    const okOpt = `La altura inicial (${h} m) desde la que se lanza`;
    const opts = rng.shuffle([okOpt, 'El tiempo que tarda en llegar al suelo', `La velocidad inicial (${v0} m/s)`, 'La altura máxima que alcanza la piedra']);
    return {
      topic: 'Función cuadrática', title: 'Caída con velocidad inicial',
      hint: 'Reemplazá t en y(t). Impacto: y(t) = 0, resolvente y quedate con el tiempo positivo. La ordenada al origen es y(0).',
      statement: `<p>Una piedra se lanza hacia abajo desde lo alto de ${obj} de ${h} metros de altura con una velocidad inicial de ${v0} m/s. Su posición respecto al suelo se modela como $y(t)=-4{,}9t^2-${v0}t+${h}$.</p><ul><li><b>a.</b> ¿Cuál es la altura de la piedra a los ${t1} segundos de haber sido lanzada?</li><li><b>b.</b> Plantee y resuelva la ecuación cuadrática para averiguar cuánto tiempo exacto tarda la piedra en impactar contra el suelo.</li><li><b>c.</b> Indique qué representa la ordenada al origen de esta función en el contexto real del problema.</li></ul>`,
      items: [
        { key: 'y1', type: 'number', label: `Altura a los ${t1} s (m)`, answer: y1 },
        { key: 'ts', type: 'number', label: 'Tiempo de impacto (s)', answer: ts, tol: 0.02 },
        { key: 'oo', type: 'choice', label: 'La ordenada al origen representa…', options: opts, answer: opts.indexOf(okOpt) },
      ],
      solution: `<p><b>a.</b> $y(${t1})=-4{,}9\\cdot${t1 * t1}-${v0}\\cdot${t1}+${h}=${tex(y1)}$ m.</p>
<p><b>b.</b> $-4{,}9t^2-${v0}t+${h}=0\\Rightarrow t=\\dfrac{${v0}\\pm\\sqrt{${v0 * v0}+4\\cdot4{,}9\\cdot${h}}}{-9{,}8}$: $t\\approx${tex(ts, 3)}$ s (la otra raíz es negativa y se descarta).</p>
<p><b>c.</b> $y(0)=${h}$ m: la altura de ${obj} desde donde se lanza la piedra.</p>`,
      chart: C().linesChart([{ label: 'y(t)', f: (t) => -4.9 * t * t - v0 * t + h, color: '#00455C' }], { xMin: 0, xMax: ts, xLabel: 't (s)', yLabel: 'y (m)', points: [{ x: t1, y: y1 }, { x: ts, y: 0 }] }),
    };
  };

  /* ---------- 8. Trigonometría en el triángulo rectángulo ---------- */
  G.math.finalTriangulo = function (rng) {
    if (rng.bool()) {
      const h = rng.pick([6.5, 7.2, 8.4, 9, 10.5, 12]), th = rng.pick([28, 32, 36, 40, 42]);
      const L = h / Math.cos(toRad(th)), al = 90 - th;
      return {
        topic: 'Trigonometría', title: 'Cable tensor de un poste',
        hint: 'El ángulo dado está arriba: la altura del poste es el cateto adyacente. cos θ = adyacente/hipotenusa. Los ángulos agudos suman 90°.',
        statement: `<p>Un poste de luz está sostenido por un cable tensor fijado en su parte superior, a una altura de ${fmt(h)} m. Entre el poste y el cable se forma un ángulo de ${th}°.</p><ul><li><b>a.</b> Calcule la longitud del cable.</li><li><b>b.</b> Halle el ángulo que éste forma con el suelo.</li></ul>`,
        items: [
          { key: 'L', type: 'number', label: 'Longitud del cable (m)', answer: L, tol: 0.02 },
          { key: 'a', type: 'number', label: 'Ángulo con el suelo (°)', answer: al, tol: 0.1, unit: '°' },
        ],
        solution: `<p><b>a.</b> $\\cos ${th}^\\circ=\\dfrac{${tex(h)}}{x}\\Rightarrow x=\\dfrac{${tex(h)}}{\\cos ${th}^\\circ}\\approx${tex(L)}$ m.</p><p><b>b.</b> $\\alpha=180^\\circ-90^\\circ-${th}^\\circ=${al}^\\circ$.</p>`,
      };
    }
    const s = rng.pick([12, 15, 18, 20, 24, 30]), be = rng.pick([25, 32, 37, 41, 53]);
    const H = s * Math.tan(toRad(be)), D = s / Math.cos(toRad(be));
    return {
      topic: 'Trigonometría', title: 'Altura de un monumento por su sombra',
      hint: 'La sombra es el cateto adyacente al ángulo de elevación: tg β = altura/sombra, cos β = sombra/distancia.',
      statement: `<p>Un monumento histórico proyecta una sombra en el suelo horizontal. Un turista mide con su goniómetro y detecta que el ángulo de elevación desde el extremo de la sombra hasta la cúspide del monumento es de ${be}°. Si la sombra en ese instante mide ${s} m de largo:</p><ul><li><b>a.</b> Calcule la altura del monumento.</li><li><b>b.</b> Determine la distancia en línea recta desde el extremo de la sombra hasta la parte más alta del monumento.</li></ul>`,
      items: [
        { key: 'h', type: 'number', label: 'Altura (m)', answer: H, tol: 0.03 },
        { key: 'd', type: 'number', label: 'Distancia a la cúspide (m)', answer: D, tol: 0.03 },
      ],
      solution: `<p><b>a.</b> $\\tan ${be}^\\circ=\\dfrac{h}{${s}}\\Rightarrow h=${s}\\cdot\\tan ${be}^\\circ\\approx${tex(H)}$ m.</p><p><b>b.</b> $\\cos ${be}^\\circ=\\dfrac{${s}}{d}\\Rightarrow d=\\dfrac{${s}}{\\cos ${be}^\\circ}\\approx${tex(D)}$ m (o por Pitágoras).</p>`,
    };
  };

  /* ---------- 9. Función trigonométrica en contexto ---------- */
  G.math.finalFuncionTrig = function (rng) {
    if (rng.bool()) {
      const A = rng.pick([3, 4, 5, 6, 8]), n = rng.pick([2, 4, 6, 8]), P = 2 * n;
      const tMax = [n / 2, n / 2 + P], tMin = [3 * n / 2, 3 * n / 2 + P];
      return {
        topic: 'Funciones trigonométricas', title: 'Máximos y mínimos de una función seno',
        hint: 'sen vale 1 cuando su argumento es π/2 + 2kπ y −1 cuando es 3π/2 + 2kπ. Período: T = 2π/ω.',
        statement: `<p>La altura de una boya respecto de un nivel de referencia está modelada por la función $f(t)=${A}\\,\\text{sen}\\left(\\tfrac{\\pi}{${n}}t\\right)$ con $0\\le t\\le ${2 * P}$, donde t representa el tiempo transcurrido en segundos y $f(t)$ expresa la altura en metros. ¿Cuál fue la altura máxima y mínima registrada? Indique en qué instantes ocurren y realice la gráfica en un período.</p>`,
        items: [
          { key: 'max', type: 'number', label: 'Altura máxima (m)', answer: A, tol: 0 },
          { key: 'tmax', type: 'set', label: 'Instantes de la altura máxima (s)', answer: tMax, slots: 2, labels: ['t₁', 't₂'] },
          { key: 'min', type: 'number', label: 'Altura mínima (m)', answer: -A, tol: 0 },
          { key: 'tmin', type: 'set', label: 'Instantes de la altura mínima (s)', answer: tMin, slots: 2, labels: ['t₁', 't₂'] },
        ],
        solution: `<p>Período $T=\\dfrac{2\\pi}{\\pi/${n}}=${P}$ s, así que en $[0;${2 * P}]$ hay dos períodos.</p>
<p>Máximo ${A} m cuando $\\tfrac{\\pi}{${n}}t=\\tfrac{\\pi}{2}+2k\\pi\\Rightarrow t=${tex(n / 2)}+${P}k$: $t=${tex(tMax[0])}$ y $t=${tex(tMax[1])}$ s.</p>
<p>Mínimo $-${A}$ m cuando $\\tfrac{\\pi}{${n}}t=\\tfrac{3\\pi}{2}+2k\\pi\\Rightarrow t=${tex(3 * n / 2)}+${P}k$: $t=${tex(tMin[0])}$ y $t=${tex(tMin[1])}$ s.</p>`,
        chart: C().linesChart([{ label: 'f(t)', f: (t) => A * Math.sin(Math.PI * t / n), color: '#00455C' }], { xMin: 0, xMax: P, n: 80, xLabel: 't (s)', yLabel: 'f (m)', points: [{ x: tMax[0], y: A, label: 'Máx' }, { x: tMin[0], y: -A, label: 'Mín' }] }),
      };
    }
    const m = rng.pick([2, 3, 4, 6]), K = rng.int(2, 9), D = rng.intNZ(-15, 15);
    const P = 2 * m;
    return {
      topic: 'Funciones trigonométricas', title: 'Parámetro, amplitud y período de un coseno',
      hint: 'Imagen de k·cos(ωx) + D: [D − |k|; D + |k|]. Amplitud |k| = (máx − mín)/2. Período T = 2π/ω.',
      statement: `<p>La función $p(x)=k\\cos\\left(\\tfrac{\\pi}{${m}}x\\right)${texSigned(D)}$ modela el movimiento de una partícula que oscila alrededor de su posición de equilibrio, donde x está expresada en segundos. Halle k negativo y, a partir de él, calcule la amplitud y el período, si se conoce que la imagen de la función es $\\text{Im}(p)=[${D - K}\\,;\\,${D + K}]$. Grafique para un período.</p>`,
      items: [
        { key: 'k', type: 'number', label: 'k', answer: -K, tol: 0 },
        { key: 'A', type: 'number', label: 'Amplitud', answer: K, tol: 0 },
        { key: 'T', type: 'number', label: 'Período (s)', answer: P, tol: 0 },
      ],
      solution: `<p>La imagen es $[${D}-|k|\\,;\\,${D}+|k|]=[${D - K};${D + K}]\\Rightarrow |k|=${K}$ y, como k es negativo, $k=-${K}$.</p><p>Amplitud $|k|=${K}$. Período $T=\\dfrac{2\\pi}{\\pi/${m}}=${P}$ s.</p>`,
      chart: C().linesChart([{ label: 'p(x)', f: (x) => -K * Math.cos(Math.PI * x / m) + D, color: '#00455C' }], { xMin: 0, xMax: P, n: 80, xLabel: 'x (s)', yLabel: 'p(x)' }),
    };
  };
})(window);
