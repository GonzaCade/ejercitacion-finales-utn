/* ==========================================================================
   gen-math-2.js — Generadores de Matemática, parte 2: rectas, funciones
   lineales en contexto, sistemas, cuadráticas, trigonometría, funciones
   trigonométricas, expresiones algebraicas, lectura de gráficos.
   ========================================================================== */
(function (global) {
  'use strict';
  const { tex, texSigned, texSC, texPoly, texFrac, texVec, fmt, round, quadRoots, polyMul, toDeg, toRad } = global.U;
  const G = global.GEN;
  const C = () => global.C;
  const line = (m, b) => `y=${m === 1 ? '' : m === -1 ? '-' : texFrac(m)}x${b === 0 ? '' : (b > 0 ? '+' : '-') + texFrac(Math.abs(b))}`;

  /* ======================= 8. RECTAS ======================= */
  G.math.rectas = function (rng) {
    const perp = rng.bool();
    // L1: a x + b y = c
    const a = rng.intNZ(-6, 9), b = rng.intNZ(-6, 6), c = rng.intNZ(-10, 15);
    const m1 = -a / b, b1 = c / b;
    if (perp) {
      const x0 = c / a; // intersección con eje x
      const m2 = b / a, b2 = -m2 * x0;
      return {
        topic: 'Rectas', title: 'Recta perpendicular por un punto',
        hint: 'Perpendiculares: m₂ = −1/m₁. Despejá "y" de L1 para ver su pendiente; la intersección con el eje x se obtiene con y = 0.',
        statement: `<p>Dada la recta $L_1$ con ecuación $${a}x${texSC(b)}y=${c}$, encuentre la ecuación de la recta $L_2$ que es perpendicular a $L_1$ y que pasa por el punto de intersección de $L_1$ con el eje de abscisas. Grafique ambas rectas en un mismo sistema de ejes cartesianos.</p>`,
        items: [
          { key: 'm', type: 'number', label: 'Pendiente de L₂', answer: m2 },
          { key: 'b', type: 'number', label: 'Ordenada al origen de L₂', answer: b2 },
        ],
        solution: `<p><b>Pendiente de $L_1$:</b> despejamos $y$: $${line(m1, b1)}$, entonces $m_1=${texFrac(m1)}$.</p>
<p><b>Intersección con el eje x:</b> hacemos $y=0$: $${a}x=${c}\\Rightarrow x=${texFrac(x0)}$. Punto $P=(${texFrac(x0)};0)$.</p>
<p><b>Perpendicularidad:</b> $m_2=-\\dfrac{1}{m_1}=${texFrac(m2)}$.</p>
<p><b>Ordenada al origen:</b> $L_2$ pasa por $P$: $0=${texFrac(m2)}\\cdot ${texFrac(x0)}+b\\Rightarrow b=${texFrac(b2)}$.</p>$$L_2:\\ ${line(m2, b2)}$$`,
        chart: C().linesChart([{ label: 'L1', f: (x) => m1 * x + b1, color: '#00455C' }, { label: 'L2', f: (x) => m2 * x + b2, color: '#d97706' }], { xMin: x0 - 5, xMax: x0 + 5, points: [{ x: x0, y: 0, label: 'P' }] }),
      };
    }
    const P = [rng.intNZ(-5, 5), rng.intNZ(-5, 5)];
    const b2 = P[1] - m1 * P[0];
    return {
      topic: 'Rectas', title: 'Recta paralela por un punto',
      hint: 'Paralelas: misma pendiente. Despejá "y" de L2 para leer m, luego reemplazá el punto en y = m·x + b para hallar b.',
      statement: `<p>Encuentre la ecuación de la recta $L_1$ que pasa por el punto $(${P[0]}\\,;\\,${P[1]})$ y que es paralela a la recta $L_2$ de ecuación $${a}x${texSC(b)}y=${c}$. Grafique ambas rectas en un mismo sistema de ejes cartesianos.</p>`,
      items: [
        { key: 'm', type: 'number', label: 'Pendiente de L₁', answer: m1 },
        { key: 'b', type: 'number', label: 'Ordenada al origen de L₁', answer: b2 },
      ],
      solution: `<p>La recta buscada tiene la forma $y=m_1x+b$. En rectas paralelas $m_1=m_2$.</p>
<p>Despejamos $y$ de $L_2$: $${line(m1, b1)}\\Rightarrow m_2=${texFrac(m1)}=m_1$.</p>
<p>Debe pasar por $(${P[0]};${P[1]})$: $${P[1]}=${texFrac(m1)}\\cdot(${P[0]})+b\\Rightarrow b=${texFrac(b2)}$.</p>$$L_1:\\ ${line(m1, b2)}$$`,
      chart: C().linesChart([{ label: 'L2', f: (x) => m1 * x + b1, color: '#00455C' }, { label: 'L1', f: (x) => m1 * x + b2, color: '#d97706' }], { xMin: P[0] - 5, xMax: P[0] + 5, points: [{ x: P[0], y: P[1], label: 'P' }] }),
    };
  };

  /* ======================= 9. FUNCIÓN LINEAL EN CONTEXTO ======================= */
  G.math.linealContexto = function (rng) {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      const T0 = rng.pick([16, 18, 20, 22, 25]), T1 = T0 - rng.pick([6, 8, 10, 12]);
      const m = T1 - T0, b = T0;
      const h1 = rng.pick([1.5, 2.5, 3, 3.5]), Tq = -rng.pick([4, 6, 10, 12, 14]);
      const Th1 = m * h1 + b, hq = (Tq - b) / m, x0 = -b / m;
      return {
        topic: 'Función lineal', title: 'Modelo lineal: temperatura y altitud',
        hint: 'Dos puntos conocidos → pendiente m = ΔT/Δh. La intersección con el eje de abscisas se obtiene igualando T = 0.',
        statement: `<p>A medida que el aire seco se eleva, se expande y se enfría. La relación lineal nos muestra que, si la temperatura a nivel del suelo es de ${T0}°C y a una altitud de 1 kilómetro es de ${T1}°C. Exprese la temperatura (en °C) en función de la altitud (en km) y determine:</p>
<ul><li>¿Cuál es la temperatura a una altitud de ${fmt(h1, 1)} km? ¿A qué altitud la temperatura será de ${Tq}°C?</li><li>¿Cuál es la intersección con el eje de abscisas? ¿Qué representa en términos del problema? Trace la gráfica de la función encontrada.</li></ul>`,
        items: [
          { key: 'm', type: 'number', label: 'Pendiente m (°C/km)', answer: m },
          { key: 'b', type: 'number', label: 'Ordenada al origen b (°C)', answer: b },
          { key: 't', type: 'number', label: `Temperatura a ${fmt(h1, 1)} km (°C)`, answer: Th1 },
          { key: 'h', type: 'number', label: `Altitud para ${Tq}°C (km)`, answer: hq },
          { key: 'x0', type: 'number', label: 'Intersección con el eje de abscisas (km)', answer: x0 },
        ],
        solution: `<p>Variable independiente: altitud $h$ (km); dependiente: temperatura $T$ (°C). Conocemos los puntos $(0;${T0})$ y $(1;${T1})$.</p>
$$m=\\frac{${T1}-${T0}}{1-0}=${m}\\qquad b=T(0)=${b}\\qquad\\Rightarrow\\ T(h)=${m}h+${b}$$
<p>$T(${tex(h1, 1)})=${m}\\cdot ${tex(h1, 1)}+${b}=${tex(Th1)}$°C.</p>
<p>$${Tq}=${m}h+${b}\\Rightarrow h=\\dfrac{${Tq}-${b}}{${m}}=${tex(hq, 2)}$ km.</p>
<p>Intersección con el eje de abscisas: $T=0\\Rightarrow h=${tex(x0, 2)}$ km. Representa la altitud a la que la temperatura del aire es 0°C.</p>`,
        chart: C().linesChart([{ label: 'T(h)', f: (x) => m * x + b, color: '#00455C' }], { xMin: 0, xMax: Math.max(hq, x0) + 1, xLabel: 'h (km)', yLabel: 'T (°C)', points: [{ x: x0, y: 0 }, { x: h1, y: Th1 }] }),
      };
    }
    if (variant === 1) {
      const d1 = rng.pick([400, 480, 500, 600]), d2 = d1 + rng.pick([200, 300, 320, 400]);
      const m = rng.pick([20, 25, 30, 40, 50]), b = rng.pick([20000, 24000, 26000, 30000]);
      const c1 = m * d1 + b, c2 = m * d2 + b, dq = rng.pick([1200, 1500, 2000]);
      return {
        topic: 'Función lineal', title: 'Modelo lineal: costo mensual',
        hint: 'Con dos puntos (d; C): m = (C₂ − C₁)/(d₂ − d₁). Luego reemplazá un punto para obtener b (el costo fijo).',
        statement: `<p>El costo mensual de conducir un automóvil de aplicación depende del número de kilómetros recorridos en el mes. Oscar durante el mes de mayo gastó $${fmt(c1, 0)} por ${d1} kilómetros y en junio gastó $${fmt(c2, 0)} por ${d2} kilómetros. Suponiendo que el costo mensual es una relación lineal en función de la distancia recorrida, determine:</p>
<ul><li>La ecuación del costo mensual "C" en función de la distancia recorrida "d".</li><li>Estime el costo de conducir ${dq} kilómetros por mes.</li><li>¿Cuál es la intersección con el eje de ordenadas? ¿Qué representa en términos del problema? Trace la gráfica.</li></ul>`,
        items: [
          { key: 'm', type: 'number', label: 'Pendiente m ($/km)', answer: m },
          { key: 'b', type: 'number', label: 'Ordenada al origen b ($)', answer: b, tol: 1 },
          { key: 'c', type: 'number', label: `Costo para ${dq} km ($)`, answer: m * dq + b, tol: 1 },
        ],
        solution: `<p>Puntos: $P_1=(${d1};${c1})$ y $P_2=(${d2};${c2})$.</p>
$$m=\\frac{C_2-C_1}{d_2-d_1}=\\frac{${c2}-${c1}}{${d2}-${d1}}=${m}$$
<p>Ordenada al origen usando $P_2$: $${c2}=${m}\\cdot ${d2}+b\\Rightarrow b=${b}$.</p>$$C(d)=${m}\\,d+${b}$$
<p>$C(${dq})=${m}\\cdot ${dq}+${b}=${m * dq + b}$ pesos.</p>
<p>La intersección con el eje de ordenadas es $(0;${b})$: representa el costo fijo mensual, aun sin recorrer kilómetros.</p>`,
        chart: C().linesChart([{ label: 'C(d)', f: (x) => m * x + b, color: '#00455C' }], { xMin: 0, xMax: dq + 100, xLabel: 'd (km)', yLabel: 'C ($)', points: [{ x: d1, y: c1 }, { x: d2, y: c2 }, { x: dq, y: m * dq + b }] }),
      };
    }
    const T0 = rng.pick([8.5, 9, 9.5, 10]), rate = rng.pick([0.02, 0.025, 0.03]), y0 = rng.pick([1900, 1920, 1950]), yq = rng.pick([2050, 2100]);
    return {
      topic: 'Función lineal', title: 'Modelo lineal: temperatura global',
      hint: 'Elegí t = años transcurridos desde el inicio. La ordenada al origen es el valor en t = 0; la pendiente es el aumento por año.',
      statement: `<p>Algunos científicos opinan que la temperatura superficial promedio del mundo está aumentando en forma constante. En el año ${y0} el promedio era de ${fmt(T0, 1)}°C y a partir de allí calcularon un aumento lineal de ${fmt(rate, 3)}°C por año.</p>
<ul><li>Encuentre la expresión de la función que represente la situación, definiendo previamente las variables independiente y dependiente. ¿Qué significa la ordenada al origen en términos de la situación?</li><li>¿Cuál será la temperatura superficial promedio del mundo en el año ${yq}? Trace la gráfica de la función encontrada.</li></ul>`,
      items: [
        { key: 'm', type: 'number', label: 'Pendiente (°C por año)', answer: rate, tol: 0.001 },
        { key: 'b', type: 'number', label: `Ordenada al origen (°C, con t = años desde ${y0})`, answer: T0 },
        { key: 't', type: 'number', label: `Temperatura en ${yq} (°C)`, answer: T0 + rate * (yq - y0) },
      ],
      solution: `<p>Variable independiente: $t$ = años transcurridos desde ${y0}. Variable dependiente: $T$ = temperatura promedio (°C).</p>$$T(t)=${tex(rate, 3)}\\,t+${tex(T0, 1)}$$
<p>La ordenada al origen (${fmt(T0, 1)}°C) es la temperatura promedio en el año ${y0} ($t=0$).</p>
<p>Para ${yq}: $t=${yq - y0}$, entonces $T=${tex(rate, 3)}\\cdot ${yq - y0}+${tex(T0, 1)}=${tex(T0 + rate * (yq - y0), 2)}$°C.</p>`,
      chart: C().linesChart([{ label: 'T(t)', f: (x) => rate * x + T0, color: '#00455C' }], { xMin: 0, xMax: yq - y0, xLabel: `t (años desde ${y0})`, yLabel: 'T (°C)', points: [{ x: yq - y0, y: T0 + rate * (yq - y0) }] }),
    };
  };

  /* ======================= 10. SISTEMAS DE ECUACIONES ======================= */
  G.math.sistemas = function (rng) {
    const variant = rng.int(0, 3);
    const chart2 = (eq1, eq2, sol, labels) => C().linesChart([
      { label: eq1.label, f: (x) => (eq1.c - eq1.a * x) / eq1.b, color: '#00455C' },
      { label: eq2.label, f: (x) => (eq2.c - eq2.a * x) / eq2.b, color: '#d97706' },
    ], { xMin: 0, xMax: sol[0] * 2 + 1, xLabel: labels[0], yLabel: labels[1], points: [{ x: sol[0], y: sol[1], label: 'Solución' }] });
    if (variant === 0) {
      // mezcla
      let p1, p2, x, y, T, p, tries = 0;
      do {
        T = rng.pick([1000, 1000, 500, 2000]); p1 = rng.pick([5, 10, 15, 20]); p2 = p1 + rng.pick([10, 15, 30, 45, 60]);
        x = T * rng.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 0.8]); y = T - x; p = (p1 * x + p2 * y) / T; tries++;
      } while (!Number.isInteger(p) && tries < 200);
      const ctx = rng.pick([{ who: 'Una bióloga', what: 'soluciones de salmuera', sub: 'sal', unit: 'mililitros' }, { who: 'Un vinatero', what: 'vinos', sub: 'alcohol', unit: 'litros' }, { who: 'Un químico', what: 'soluciones de ácido', sub: 'ácido', unit: 'mililitros' }]);
      return {
        topic: 'Sistemas de ecuaciones', title: 'Problema de mezclas',
        hint: 'Definí x e y (cantidades de cada solución). Ecuación 1: x + y = total. Ecuación 2: sustancia pura: p₁·x + p₂·y = p·total. Resolvé por sustitución.',
        statement: `<p>${ctx.who} tiene dos ${ctx.what}, una contiene ${p1}% de ${ctx.sub} y otra contiene ${p2}% de ${ctx.sub}. ¿Cuántos ${ctx.unit} de cada solución debe mezclar para obtener ${fmt(T, 0)} ${ctx.unit} de una solución que contenga ${p}% de ${ctx.sub}? Resuelva analítica y gráficamente.</p>`,
        items: [
          { key: 'x', type: 'number', label: `${ctx.unit} de la solución al ${p1}%`, answer: x, tol: 0.5 },
          { key: 'y', type: 'number', label: `${ctx.unit} de la solución al ${p2}%`, answer: y, tol: 0.5 },
        ],
        solution: `<p>Sea $x$ la cantidad de solución al ${p1}% e $y$ la cantidad al ${p2}%.</p>
$$\\begin{cases}x+y=${T}&(1)\\\\ ${tex(p1 / 100)}\\,x+${tex(p2 / 100)}\\,y=${tex(p / 100)}\\cdot ${T}=${p * T / 100}&(2)\\end{cases}$$
<p>De (1): $y=${T}-x$. Reemplazando en (2): $${tex(p1 / 100)}x+${tex(p2 / 100)}(${T}-x)=${p * T / 100}\\Rightarrow ${tex((p1 - p2) / 100)}x=${p * T / 100 - p2 * T / 100}\\Rightarrow x=${x}$.</p>
<p>Luego $y=${T}-${x}=${y}$. Gráficamente, las dos rectas se cortan en $(${x};${y})$.</p>`,
        chart: chart2({ a: 1, b: 1, c: T, label: 'x + y = total' }, { a: p1 / 100, b: p2 / 100, c: p * T / 100, label: 'sustancia pura' }, [x, y], ['x', 'y']),
      };
    }
    if (variant === 1) {
      const autos = rng.int(20, 60), motos = rng.int(10, 40);
      const N = autos + motos, R = 4 * autos + 2 * motos;
      return {
        topic: 'Sistemas de ecuaciones', title: 'Problema de conteo',
        hint: 'x = autos, y = motos. Ecuación de cantidad: x + y = total. Ecuación de ruedas: 4x + 2y = ruedas.',
        statement: `<p>En un estacionamiento hay ${N} vehículos entre autos y motos. Si el total de ruedas es ${R}, ¿cuántos autos y motos hay? Resuelva gráfica y analíticamente.</p>`,
        items: [{ key: 'a', type: 'number', label: 'Autos', answer: autos, tol: 0 }, { key: 'm', type: 'number', label: 'Motos', answer: motos, tol: 0 }],
        solution: `<p>Sea $a$ = autos y $m$ = motos.</p>$$\\begin{cases}a+m=${N}\\\\ 4a+2m=${R}\\end{cases}$$
<p>De la primera: $m=${N}-a$. En la segunda: $4a+2(${N}-a)=${R}\\Rightarrow 2a=${R - 2 * N}\\Rightarrow a=${autos}$, $m=${motos}$.</p>`,
        chart: chart2({ a: 1, b: 1, c: N, label: 'a + m = ' + N }, { a: 4, b: 2, c: R, label: '4a + 2m = ' + R }, [autos, motos], ['autos', 'motos']),
      };
    }
    if (variant === 2) {
      const pa = rng.pick([6000, 8000, 10000, 12000]), pk = rng.pick([3000, 4000, 5000]);
      const A = rng.int(80, 200), K = rng.int(40, 150);
      const N = A + K, tot = pa * A + pk * K;
      return {
        topic: 'Sistemas de ecuaciones', title: 'Problema de recaudación',
        hint: 'x = adultos, y = niños. x + y = personas; precio·x + precio·y = recaudación. Sustitución o reducción.',
        statement: `<p>El costo de las entradas a un teatro es de $${fmt(pa, 0)} para los adultos y $${fmt(pk, 0)} para los niños. Si el sábado asistieron ${N} personas y se recaudaron $${tot.toLocaleString('es-AR')}, ¿cuántos adultos y cuántos niños asistieron a la función? Resuelva gráfica y analíticamente.</p>`,
        items: [{ key: 'a', type: 'number', label: 'Adultos', answer: A, tol: 0 }, { key: 'k', type: 'number', label: 'Niños', answer: K, tol: 0 }],
        solution: `$$\\begin{cases}a+n=${N}\\\\ ${pa}a+${pk}n=${tot}\\end{cases}$$<p>De la primera $n=${N}-a$; reemplazando: $${pa}a+${pk}(${N}-a)=${tot}\\Rightarrow ${pa - pk}a=${tot - pk * N}\\Rightarrow a=${A}$ y $n=${K}$.</p>`,
        chart: chart2({ a: 1, b: 1, c: N, label: 'personas' }, { a: pa, b: pk, c: tot, label: 'recaudación' }, [A, K], ['adultos', 'niños']),
      };
    }
    // encuentro de móviles (planteo como sistema/función lineal)
    const d = rng.pick([300, 500, 600, 3000, 6000]), v1 = rng.pick([55, 60, 80, 100]), v2 = rng.pick([80, 90, 120, 140]);
    const t = d / (v1 + v2), x = v1 * t;
    return {
      topic: 'Sistemas de ecuaciones', title: 'Encuentro de dos móviles',
      hint: 'Sistema de referencia en A. Posición del 1.º: x = v₁·t. Del 2.º (viene en sentido contrario): x = d − v₂·t. Igualá ambas.',
      statement: `<p>Dos camiones salen en el mismo instante de dos ciudades distintas <b>A</b> y <b>B</b>, separadas por ${fmt(d, 0)} km, con velocidad constante de ${v1} km/h y ${v2} km/h respectivamente, uno al encuentro del otro. Determine analítica y gráficamente el tiempo que transcurre hasta que se encuentran y a qué distancia de la ciudad <b>A</b> se cruzan. Establezca un sistema de referencia.</p>`,
      items: [
        { key: 't', type: 'number', label: 'Tiempo hasta el encuentro (h)', answer: t },
        { key: 'x', type: 'number', label: 'Distancia desde A (km)', answer: x, tol: 0.5 },
      ],
      solution: `<p>Origen en A, sentido positivo hacia B. Posiciones: $x_A(t)=${v1}t$ y $x_B(t)=${d}-${v2}t$.</p>
<p>Se encuentran cuando $x_A=x_B$: $${v1}t=${d}-${v2}t\\Rightarrow ${v1 + v2}t=${d}\\Rightarrow t=${tex(t, 2)}$ h.</p>
<p>Distancia desde A: $x=${v1}\\cdot ${tex(t, 2)}\\approx ${tex(x, 1)}$ km.</p>`,
      chart: C().linesChart([{ label: 'camión A', f: (u) => v1 * u, color: '#00455C' }, { label: 'camión B', f: (u) => d - v2 * u, color: '#d97706' }], { xMin: 0, xMax: t * 1.6, xLabel: 't (h)', yLabel: 'x (km)', points: [{ x: t, y: x, label: 'Encuentro' }] }),
    };
  };

  /* ======================= 11. CUADRÁTICAS EN CONTEXTO ======================= */
  G.math.cuadraticaContexto = function (rng) {
    const variant = rng.int(0, 6);
    const parab = (a, b, c, xMin, xMax, pts, labels) => C().linesChart([{ label: labels ? labels[2] : 'f(x)', f: (x) => a * x * x + b * x + c, color: '#00455C' }], { xMin, xMax, points: pts, xLabel: labels ? labels[0] : 'x', yLabel: labels ? labels[1] : 'y' });
    if (variant === 0) {
      const a = -rng.pick([5, 16, 4.9]), b = rng.pick([40, 64, 8.3, 30, 96]), c = rng.pick([23, 112, 190, 45, 80]);
      const tv = -b / (2 * a), Hmax = a * tv * tv + b * tv + c, tSame = -b / a, t1 = rng.pick([1, 2, 2.4]);
      const H1 = a * t1 * t1 + b * t1 + c, tg = quadRoots(a, b, c)[1];
      return {
        topic: 'Función cuadrática', title: 'Altura de un objeto lanzado',
        hint: 'Altura inicial: H(0). Vértice: t_v = −b/(2a). Llega al suelo cuando H(t) = 0 (resolvente, descartar el tiempo negativo).',
        statement: `<p>Un objeto es lanzado hacia arriba desde una cierta altura, llega a un punto donde alcanza una altura máxima y cae al suelo. La función modela la altura del objeto (en metros) en un tiempo "t" (en segundos):</p>$$H(t)=${texPoly([a, b, c], 't')}$$
<ul><li>¿Desde qué altura fue lanzado el objeto? ¿En qué otro instante se encuentra a dicha altura? ¿Cuál es la altura que alcanza a los ${fmt(t1, 1)} segundos?</li><li>Halle la altura máxima que alcanza el objeto y el tiempo que demora en alcanzarla. Determine cuánto tiempo le toma al objeto llegar al suelo. Grafique la función en el contexto del problema.</li></ul>`,
        items: [
          { key: 'h0', type: 'number', label: 'Altura inicial (m)', answer: c },
          { key: 'ts', type: 'number', label: 'Otro instante a la misma altura (s)', answer: tSame },
          { key: 'h1', type: 'number', label: `Altura a los ${fmt(t1, 1)} s (m)`, answer: H1 },
          { key: 'tv', type: 'number', label: 'Tiempo de altura máxima (s)', answer: tv },
          { key: 'hm', type: 'number', label: 'Altura máxima (m)', answer: Hmax },
          { key: 'tg', type: 'number', label: 'Tiempo en llegar al suelo (s)', answer: tg },
        ],
        solution: `<p><b>Altura inicial:</b> $H(0)=${tex(c)}$ m.</p>
<p><b>Otro instante a esa altura:</b> $${texPoly([a, b, c], 't')}=${tex(c)}\\Rightarrow t(${tex(a)}t+${tex(b)})=0\\Rightarrow t=0$ o $t=${tex(tSame)}$ s.</p>
<p><b>Altura a los ${fmt(t1, 1)} s:</b> $H(${tex(t1, 1)})=${tex(H1)}$ m.</p>
<p><b>Vértice:</b> $t_v=-\\dfrac{b}{2a}=-\\dfrac{${tex(b)}}{2\\cdot(${tex(a)})}=${tex(tv)}$ s y $H_{max}=H(${tex(tv)})=${tex(Hmax)}$ m.</p>
<p><b>Llegada al suelo:</b> $H(t)=0$: $t=\\dfrac{-${tex(b)}\\pm\\sqrt{${tex(b)}^2-4(${tex(a)})(${tex(c)})}}{2(${tex(a)})}$ → $t_1=${tex(quadRoots(a, b, c)[0])}$ (se descarta) y $t_2=${tex(tg)}$ s.</p>`,
        chart: parab(a, b, c, 0, tg, [{ x: tv, y: Hmax, label: 'Máx' }, { x: tg, y: 0 }], ['t (s)', 'H (m)', 'H(t)']),
      };
    }
    if (variant === 1) {
      const v0 = rng.pick([22, 25, 30, 37, 40, 50]), y0 = rng.pick([0, 0, 2, 5, 10]), t2 = rng.pick([2, 3, 4]);
      const g = 9.8, a = -g / 2;
      const tv = v0 / g, Hmax = a * tv * tv + v0 * tv + y0;
      const yA = y0, yB = a * t2 * t2 + v0 * t2 + y0, ms = (yB - yA) / t2, bs = yA;
      const tg = quadRoots(a, v0, y0)[1];
      return {
        topic: 'Función cuadrática', title: 'Tiro vertical y recta secante',
        hint: 'y(t) = −½g·t² + v₀·t + y₀. Altura máxima en el vértice. Recta secante: pendiente = [y(t₂) − y(t₁)]/(t₂ − t₁).',
        statement: `<p>Un objeto se lanza hacia arriba desde ${y0 === 0 ? 'el nivel del suelo' : `una altura de ${y0} metros`} a una velocidad de ${v0} metros por segundo. Considerando que la ecuación posición es $Y=-\\tfrac12 g\\,t^2+v_0\\,t+y_0$, donde $g=9{,}8\\,\\tfrac{m}{s^2}$, escriba la función que represente la situación.</p>
<ul><li>Represente gráficamente la función posición. Calcule la altura máxima alcanzada.</li><li>Para los valores de tiempo $t_1=0$, $t_2=${t2}$ encuentre la recta secante que pasa por $t_1$ y $t_2$.</li></ul>`,
        items: [
          { key: 'tv', type: 'number', label: 'Instante de altura máxima (s)', answer: tv },
          { key: 'hm', type: 'number', label: 'Altura máxima (m)', answer: Hmax, tol: 0.3 },
          { key: 'ms', type: 'number', label: 'Pendiente de la recta secante', answer: ms, tol: 0.05 },
          { key: 'bs', type: 'number', label: 'Ordenada al origen de la recta secante', answer: bs },
        ],
        solution: `$$Y(t)=-4{,}9\\,t^2+${v0}\\,t${y0 ? '+' + y0 : ''}$$
<p><b>Altura máxima</b> (vértice): $t_v=-\\dfrac{${v0}}{2\\cdot(-4{,}9)}=${tex(tv)}$ s; $Y(${tex(tv)})=${tex(Hmax, 1)}$ m. Llega al suelo en $t=${tex(tg)}$ s.</p>
<p><b>Recta secante:</b> puntos $(0;${tex(yA)})$ y $(${t2};${tex(yB, 1)})$. Pendiente $m=\\dfrac{${tex(yB, 1)}-${tex(yA)}}{${t2}-0}=${tex(ms)}$ y ordenada $b=${tex(bs)}$.</p>$$y=${tex(ms)}\\,t${bs ? '+' + tex(bs) : ''}$$`,
        chart: C().linesChart([{ label: 'Y(t)', f: (t) => a * t * t + v0 * t + y0, color: '#00455C' }, { label: 'secante', f: (t) => ms * t + bs, color: '#d97706', dashed: true }], { xMin: 0, xMax: tg, xLabel: 't (s)', yLabel: 'Y (m)', points: [{ x: tv, y: Hmax, label: 'Máx' }, { x: 0, y: yA }, { x: t2, y: yB }] }),
      };
    }
    if (variant === 2) {
      const a = rng.pick([1, 2, 3, -1, -2, 0.5]), b = rng.intNZ(-5, 5), c = rng.intNZ(-6, 6);
      const xs = rng.sample([-2, -1, 0, 1, 2, 3], 3).sort((u, v) => u - v);
      const pts = xs.map((x) => [x, a * x * x + b * x + c]);
      const xv = -b / (2 * a), yv = a * xv * xv + b * xv + c;
      return {
        topic: 'Función cuadrática', title: 'Parábola por tres puntos',
        hint: 'Reemplazá cada punto en y = ax² + bx + c → sistema de 3 ecuaciones con 3 incógnitas (si pasa por (0;c), c sale directo).',
        statement: `<p>La ecuación de una parábola tiene la forma general $f(x)=ax^2+bx+c$. Si sabemos que la parábola pasa por los puntos ${pts.map((p) => `$(${tex(p[0])}\\,;\\,${tex(p[1])})$`).join(', ')}, escriba la ecuación que represente la función cuadrática, indique su concavidad, vértice, dominio e imagen y realice su gráfica.</p>`,
        items: [
          { key: 'a', type: 'number', label: 'a', answer: a }, { key: 'b', type: 'number', label: 'b', answer: b }, { key: 'c', type: 'number', label: 'c', answer: c },
          { key: 'v', type: 'vector', label: 'Vértice (x ; y)', answer: [xv, yv], paren: true },
        ],
        solution: `<p>Reemplazamos cada punto en $f(x)=ax^2+bx+c$:</p>$$\\begin{cases}${pts.map((p) => `${tex(p[0] * p[0])}a${texSC(p[0])}b+c=${tex(p[1])}`).join('\\\\ ')}\\end{cases}$$
<p>Resolviendo el sistema (restando ecuaciones para eliminar $c$ y luego $b$): $a=${tex(a)}$, $b=${tex(b)}$, $c=${tex(c)}$.</p>$$f(x)=${texPoly([a, b, c])}$$
<p>Concavidad ${a > 0 ? 'positiva (hacia arriba)' : 'negativa (hacia abajo)'}. Vértice: $x_v=-\\frac{b}{2a}=${tex(xv)}$, $y_v=${tex(yv)}$. Dominio $\\mathbb{R}$, imagen $${a > 0 ? `[${tex(yv)};+\\infty)` : `(-\\infty;${tex(yv)}]`}$.</p>`,
        chart: parab(a, b, c, xv - 4, xv + 4, [...pts.map((p) => ({ x: p[0], y: p[1] })), { x: xv, y: yv, label: 'V' }]),
      };
    }
    if (variant === 3) {
      const k0 = rng.pick([1, 2, 3, 4]), m = rng.pick([2, 5, 10]);
      const V = (m - 1) * k0 * k0;
      return {
        topic: 'Función cuadrática', title: 'Imagen con parámetro',
        hint: 'Imagen [V; +∞) ⇒ el vértice tiene y_v = V. Calculá x_v = −b/(2a) en función de k, reemplazá en f y resolvé la ecuación en k.',
        statement: `<p>Si la imagen de la función cuadrática $f(x)=x^2-2k\\,x+${m}k^2$ es el intervalo $[${V}\\,;\\,+\\infty)$, halle el o los valores posibles para la abscisa del vértice.</p>`,
        items: [{ key: 'k', type: 'set', label: 'Valores posibles de la abscisa del vértice', answer: [-k0, k0], slots: 2, labels: ['x_v₁', 'x_v₂'] }],
        solution: `<p>Abscisa del vértice: $x_v=-\\dfrac{-2k}{2\\cdot1}=k$. Ordenada: $f(k)=k^2-2k^2+${m}k^2=${m - 1}k^2$.</p>
<p>Como la imagen es $[${V};+\\infty)$, el mínimo vale ${V}: $${m - 1}k^2=${V}\\Rightarrow k^2=${k0 * k0}\\Rightarrow k=\\pm ${k0}$.</p><p>Entonces la abscisa del vértice puede ser $x_v=${k0}$ o $x_v=${-k0}$.</p>`,
      };
    }
    if (variant === 4) {
      const T1 = rng.pick([0, 10, 20]), T2 = T1 + rng.pick([60, 80, 100]), M = rng.pick([90, 92, 96, 98]);
      const tv = (T1 + T2) / 2, a = M / ((tv - T1) * (tv - T2));
      const P = polyMul([a, -a * T1], [1, -T2]);
      return {
        topic: 'Función cuadrática', title: 'Cuadrática a partir de raíces y máximo',
        hint: 'Forma factorizada: f(T) = a·(T − T₁)(T − T₂). El máximo está en el punto medio de las raíces; reemplazá para hallar "a".',
        statement: `<p>El rendimiento expresado en porcentaje (%) de un generador de placas solares en función de la temperatura está dado por una función cuadrática. Se sabe que el rendimiento máximo de ${M}% se obtiene para una temperatura de ${tv}°C y que es nulo para ${T1}°C y ${T2}°C. Escriba la ecuación que represente el rendimiento en función de la temperatura y realice su gráfica.</p>`,
        items: [{ key: 'a', type: 'number', label: 'a', answer: P[0], tol: 0.002 }, { key: 'b', type: 'number', label: 'b', answer: P[1], tol: 0.02 }, { key: 'c', type: 'number', label: 'c', answer: P[2], tol: 0.5 }],
        solution: `<p>Raíces ${T1} y ${T2} ⇒ $f(T)=a(T-${T1})(T-${T2})$. El vértice está en $T_v=\\frac{${T1}+${T2}}{2}=${tv}$ y allí $f=${M}$:</p>
$$${M}=a(${tv}-${T1})(${tv}-${T2})=a\\cdot(${tv - T1})(${tv - T2})\\Rightarrow a=${tex(a, 4)}$$
$$f(T)=${texPoly(P, 'T', 3)}$$`,
        chart: parab(P[0], P[1], P[2], T1, T2, [{ x: tv, y: M, label: 'Máx' }], ['T (°C)', 'rendimiento (%)', 'f(T)']),
      };
    }
    if (variant === 5) {
      const c2 = rng.pick([0.2, 0.5, 0.1, 0.25]), xv = rng.pick([10, 15, 20, 30, 40]), c0 = rng.pick([400, 600, 800, 1000]);
      const c1 = 2 * c2 * xv; const Cv = c0 - c1 * xv + c2 * xv * xv;
      return {
        topic: 'Función cuadrática', title: 'Costo mínimo',
        hint: 'El mínimo de una parábola con a > 0 está en el vértice: x_v = −b/(2a). El costo mínimo es C(x_v).',
        statement: `<p>Un fabricante de lámparas tiene un costo diario de producción (en pesos) dado por $C(x)=${c0}-${tex(c1)}x+${tex(c2)}x^2$, siendo "x" la cantidad de unidades producidas en el día. Determine la cantidad de lámparas que debe producir para minimizar los costos y cuál es el importe de este. Realice la gráfica de la función en el contexto del problema.</p>`,
        items: [{ key: 'x', type: 'number', label: 'Cantidad de lámparas', answer: xv }, { key: 'c', type: 'number', label: 'Costo mínimo ($)', answer: Cv }],
        solution: `<p>La parábola tiene $a=${tex(c2)}>0$, así que el vértice es un mínimo:</p>$$x_v=-\\frac{b}{2a}=-\\frac{-${tex(c1)}}{2\\cdot ${tex(c2)}}=${xv}\\qquad C(${xv})=${c0}-${tex(c1)}\\cdot ${xv}+${tex(c2)}\\cdot ${xv}^2=${tex(Cv)}$$<p>Debe producir ${xv} lámparas por día con un costo mínimo de $${fmt(Cv)}.</p>`,
        chart: parab(c2, -c1, c0, 0, xv * 3, [{ x: xv, y: Cv, label: 'Mín' }], ['x (lámparas)', 'C ($)', 'C(x)']),
      };
    }
    const a = rng.pick([1, 2, 4, -1, -3]), b = rng.pick([-20, -12, 8, 6, -4, 10]);
    const k = b * b / (4 * a);
    const cond = a > 0 ? `k>${texFrac(k)}` : `k<${texFrac(k)}`;
    const opts = rng.shuffle([cond, a > 0 ? `k<${texFrac(k)}` : `k>${texFrac(k)}`, 'No existen valores de k', `k\\ne ${texFrac(k)}`]);
    return {
      topic: 'Función cuadrática', title: 'Parábola tangente al eje x',
      hint: 'Tangente al eje x ⇔ raíz doble ⇔ discriminante b² − 4ac = 0. No corta ⇔ discriminante < 0.',
      statement: `<p>Encuentre el o los valores del parámetro "k" para que la parábola $y=${texPoly([a, b])}+k$ sea tangencial al eje de abscisas. ¿Existen valores del parámetro en los que la parábola no corte al eje de abscisas?</p>`,
      items: [
        { key: 'k', type: 'number', label: 'k para que sea tangente', answer: k },
        { key: 'c', type: 'choice', label: 'Condición para que no corte al eje x', options: opts.map((o) => `$${o}$`), answer: opts.indexOf(cond) },
      ],
      solution: `<p>Tangente al eje de abscisas ⇔ raíces reales e iguales ⇔ discriminante nulo:</p>$$b^2-4ac=0\\Rightarrow (${b})^2-4\\cdot(${a})\\cdot k=0\\Rightarrow k=\\frac{${b * b}}{${4 * a}}=${texFrac(k)}$$
<p>No corta al eje ⇔ discriminante negativo: $${b * b}-${4 * a}k<0\\Rightarrow ${cond}$.</p>`,
    };
  };

  G.math.cuadraticaInterseccion = function (rng) {
    // imagen [V;+∞), raíces r1, r2; recta por dos puntos de la parábola
    const r1 = rng.pick([-3, -2, -1, 1]), r2 = r1 + rng.pick([4, 6, 8, 10]);
    const w = r2 - r1; const V = -rng.pick([2, 4, 5, 8, 10, 16]);
    const a = -4 * V / (w * w);
    const P = polyMul([a, -a * r1], [1, -r2]);
    const f = (x) => a * (x - r1) * (x - r2);
    const s1 = r2, s2 = r1 - rng.pick([2, 3, 5]);
    const m = (f(s2) - f(s1)) / (s2 - s1), n = f(s1) - m * s1;
    const xv = (r1 + r2) / 2;
    return {
      topic: 'Función cuadrática', title: 'Intersección de parábola y recta',
      hint: 'Forma factorizada f(x) = a(x − r₁)(x − r₂); el mínimo (imagen) fija "a". Intersección: igualá f(x) = recta y resolvé la cuadrática.',
      statement: `<p>La función cuadrática $f(x)$ tiene como imagen al conjunto $[${V}\\,;\\,+\\infty)$ y su gráfica corta al eje de abscisas en $x=${r1}$ y en $x=${r2}$. Calcule la o las intersecciones de la gráfica de $f(x)$ con la recta $${line(m, n)}$. Grafique las funciones en un mismo sistema de ejes cartesianos.</p>`,
      items: [
        { key: 'a', type: 'number', label: 'a', answer: P[0], tol: 0.005 }, { key: 'b', type: 'number', label: 'b', answer: P[1], tol: 0.02 }, { key: 'c', type: 'number', label: 'c', answer: P[2], tol: 0.05 },
        { key: 'pts', type: 'vectorset', label: 'Puntos de intersección', answer: [[s1, f(s1)], [s2, f(s2)]], labels: ['P₁', 'P₂'], paren: true },
      ],
      solution: `<p>Con las raíces: $f(x)=a(x${texSigned(-r1)})(x${texSigned(-r2)})$. El vértice está en $x_v=${tex(xv)}$ y su ordenada es el mínimo $${V}$:</p>
$$${V}=a(${tex(xv)}${texSigned(-r1)})(${tex(xv)}${texSigned(-r2)})=a\\cdot(${tex(-w * w / 4)})\\Rightarrow a=${texFrac(a)}$$
$$f(x)=${texPoly(P, 'x', 3)}$$
<p><b>Intersección con la recta:</b> $${texPoly(P, 'x', 3)}=${line(m, n)}$ ⇒ $${texPoly([P[0], P[1] - m, P[2] - n], 'x', 3)}=0$ ⇒ $x=${tex(s2)}$ o $x=${tex(s1)}$.</p>
<p>Puntos: $P_1=(${tex(s1)};${tex(f(s1))})$ y $P_2=(${tex(s2)};${tex(f(s2))})$.</p>`,
      chart: C().linesChart([{ label: 'f(x)', f, color: '#00455C' }, { label: 'recta', f: (x) => m * x + n, color: '#d97706' }], { xMin: s2 - 2, xMax: r2 + 2, points: [{ x: s1, y: f(s1) }, { x: s2, y: f(s2) }, { x: xv, y: V, label: 'V' }] }),
    };
  };

  /* ======================= 12. TRIGONOMETRÍA ======================= */
  G.math.trigTriangulos = function (rng) {
    const variant = rng.int(0, 2);
    if (variant === 0) {
      const al = rng.pick([41, 45, 50, 55, 60]), be = al - rng.pick([4, 8, 13, 17]);
      const d = rng.pick([0.5, 1, 1.5, 2]);
      const h = d / (1 / Math.tan(toRad(be)) - 1 / Math.tan(toRad(al)));
      const x = h / Math.tan(toRad(al));
      return {
        topic: 'Trigonometría', title: 'Ángulos de elevación (teodolito)',
        hint: 'SohCahToa: en cada triángulo rectángulo tan(ángulo) = h / distancia. Dos ecuaciones con incógnitas h y x; restá para eliminar x.',
        statement: `<p>Un topógrafo usa un instrumento llamado teodolito para medir el ángulo de elevación entre el nivel del piso y la cumbre de una montaña. En un punto, se mide un ángulo de elevación de ${al}°. ${d === 1 ? 'Un kilómetro' : `${fmt(d, 1)} km`} más lejos de la base de la montaña, el ángulo de elevación mide ${be}°. Calcule la altura de la montaña. Realice un esquema de situación.</p>`,
        figure: C().elevationSVG(al, be, d),
        items: [{ key: 'h', type: 'number', label: 'Altura de la montaña (km)', answer: h, tol: 0.01 }],
        solution: `<p>Sea $h$ la altura y $x$ la distancia del primer punto a la base. En los dos triángulos rectángulos:</p>
$$\\tan ${al}^\\circ=\\frac{h}{x}\\qquad \\tan ${be}^\\circ=\\frac{h}{x+${tex(d, 1)}}$$
<p>De la primera $x=\\dfrac{h}{\\tan ${al}^\\circ}$. Reemplazando en la segunda: $h=\\tan ${be}^\\circ\\left(\\dfrac{h}{\\tan ${al}^\\circ}+${tex(d, 1)}\\right)$</p>
$$h\\left(1-\\frac{\\tan ${be}^\\circ}{\\tan ${al}^\\circ}\\right)=${tex(d, 1)}\\tan ${be}^\\circ\\ \\Rightarrow\\ h=\\frac{${tex(d, 1)}}{\\cot ${be}^\\circ-\\cot ${al}^\\circ}\\approx ${tex(h, 3)}\\ \\text{km}$$<p>(y $x\\approx ${tex(x, 3)}$ km).</p>`,
      };
    }
    if (variant === 1) {
      const h = rng.pick([1200, 2000, 3500, 12000]), al = rng.pick([28, 32, 35]), be = rng.pick([40, 46, 52, 60]);
      const D = h / Math.tan(toRad(al)) + h / Math.tan(toRad(be));
      return {
        topic: 'Trigonometría', title: 'Distancia entre dos observadores',
        hint: 'SohCahToa: cada observador forma un triángulo rectángulo con la montaña. Distancia horizontal = h / tan(ángulo). Sumá ambas.',
        statement: `<p>Se encuentran observadores en dos pueblos A y B, cada uno a cada lado de una montaña de ${fmt(h, 0)} metros de altura. Se miden los ángulos de elevación entre el suelo y la cumbre de la montaña: ${al}° desde A y ${be}° desde B. Calcule la distancia entre los pueblos.</p>`,
        figure: C().twoTownsSVG(al, be),
        items: [{ key: 'd', type: 'number', label: 'Distancia entre A y B (m)', answer: D, tol: D * 0.005 }],
        solution: `<p>La altura divide la distancia en dos tramos $d_A$ y $d_B$:</p>$$\\tan ${al}^\\circ=\\frac{${h}}{d_A}\\Rightarrow d_A=\\frac{${h}}{\\tan ${al}^\\circ}\\approx ${tex(h / Math.tan(toRad(al)), 1)}\\qquad d_B=\\frac{${h}}{\\tan ${be}^\\circ}\\approx ${tex(h / Math.tan(toRad(be)), 1)}$$
$$d_{AB}=d_A+d_B\\approx ${tex(D, 1)}\\ \\text{m}$$`,
      };
    }
    const tri = rng.pick([[120, 130, 50], [60, 100, 80], [90, 150, 120], [40, 50, 30], [70, 250, 240], [160, 200, 120]]);
    return {
      topic: 'Trigonometría', title: 'Triángulo rectángulo (Pitágoras)',
      hint: 'Pitágoras: hipotenusa² = cateto² + cateto². La altura es el cateto vertical.',
      statement: `<p>A ${tri[0]} metros de la base de un cohete puede verse la parte superior de este, con una distancia (en línea recta desde el observador hasta la punta) de ${tri[1]} metros. ¿Cuál es la altura del cohete aeroespacial? Calcule además el ángulo de elevación con el que se observa la punta.</p>`,
      figure: C().rightTriangleSVG(tri[0], tri[2], tri[1]),
      items: [
        { key: 'h', type: 'number', label: 'Altura (m)', answer: tri[2] },
        { key: 'a', type: 'number', label: 'Ángulo de elevación (grados)', answer: toDeg(Math.atan2(tri[2], tri[0])), tol: 0.6 },
      ],
      solution: `$$h=\\sqrt{${tri[1]}^2-${tri[0]}^2}=\\sqrt{${tri[1] ** 2 - tri[0] ** 2}}=${tri[2]}\\ \\text{m}\\qquad \\tan\\alpha=\\frac{${tri[2]}}{${tri[0]}}\\Rightarrow\\alpha\\approx ${tex(toDeg(Math.atan2(tri[2], tri[0])), 1)}^\\circ$$`,
    };
  };

  G.math.trigIdentidades = function (rng) {
    const K = rng.pick([{ t: '', v: '' }, { t: '2', v: '2' }, { t: '\\pi', v: '\\pi' }, { t: '2\\pi', v: '2\\pi' }, { t: '3', v: '3' }]);
    const k = K.t ? K.t + '\\,' : '';
    const T = [
      { e: `\\frac{${k}(\\sin^2x+\\cos^2x)}{(\\csc^2x-\\cot^2x)\\cdot\\sec x\\cdot\\csc x}`, r: `${k}\\sin x\\cos x`, steps: `<p>Numerador: $\\sin^2x+\\cos^2x=1$. Denominador: $\\csc^2x-\\cot^2x=1$ y $\\sec x\\csc x=\\dfrac{1}{\\sin x\\cos x}$.</p><p>Queda $${k}\\cdot\\dfrac{1}{\\frac{1}{\\sin x\\cos x}}=${k}\\sin x\\cos x$.</p>` },
      { e: `\\frac{${k}(\\sec^2x-\\tan^2x)}{\\csc^2x\\cdot\\cot^2x\\cdot\\sec^2x\\cdot\\tan^2x}`, r: `${k}\\sin^2x\\cos^2x`, steps: `<p>$\\sec^2x-\\tan^2x=1$; $\\cot^2x\\cdot\\tan^2x=1$; $\\csc^2x\\sec^2x=\\dfrac{1}{\\sin^2x\\cos^2x}$.</p><p>Resulta $${k}\\sin^2x\\cos^2x$.</p>` },
      { e: `\\frac{${k}(1-\\cos^2x)}{\\sin x\\cdot\\cos x}`, r: `${k}\\tan x`, steps: `<p>$1-\\cos^2x=\\sin^2x$, entonces $\\dfrac{${k}\\sin^2x}{\\sin x\\cos x}=${k}\\dfrac{\\sin x}{\\cos x}=${k}\\tan x$.</p>` },
      { e: `${k}(\\sin x\\cdot\\cot x+\\cos x)`, r: `2${K.t ? '\\cdot' + K.t : ''}\\cos x`, steps: `<p>$\\sin x\\cot x=\\sin x\\dfrac{\\cos x}{\\sin x}=\\cos x$; luego $\\cos x+\\cos x=2\\cos x$.</p>` },
      { e: `\\frac{${k}(\\sec x-\\cos x)}{\\tan x}`, r: `${k}\\sin x`, steps: `<p>$\\sec x-\\cos x=\\dfrac{1-\\cos^2x}{\\cos x}=\\dfrac{\\sin^2x}{\\cos x}$. Dividiendo por $\\tan x=\\dfrac{\\sin x}{\\cos x}$: $\\dfrac{\\sin^2x}{\\cos x}\\cdot\\dfrac{\\cos x}{\\sin x}=\\sin x$.</p>` },
      { e: `${k}(1+\\tan^2x)\\cdot\\cos^2x`, r: `${K.t || '1'}`, steps: `<p>$1+\\tan^2x=\\sec^2x=\\dfrac{1}{\\cos^2x}$, y $\\dfrac{1}{\\cos^2x}\\cos^2x=1$.</p>` },
      { e: `\\frac{${k}(\\csc x-\\sin x)}{\\cot x}`, r: `${k}\\cos x`, steps: `<p>$\\csc x-\\sin x=\\dfrac{1-\\sin^2x}{\\sin x}=\\dfrac{\\cos^2x}{\\sin x}$; dividiendo por $\\cot x=\\dfrac{\\cos x}{\\sin x}$ queda $\\cos x$.</p>` },
      { e: `${k}\\sin^2x\\,(1+\\cot^2x)`, r: `${K.t || '1'}`, steps: `<p>$1+\\cot^2x=\\csc^2x=\\dfrac{1}{\\sin^2x}$, y el producto vale 1.</p>` },
    ];
    const idx = rng.int(0, T.length - 1);
    const chosen = T[idx];
    const distract = rng.sample([...new Set(T.filter((t, i) => i !== idx && t.r !== chosen.r).map((t) => t.r))], 3);
    const opts = rng.shuffle([chosen.r, ...distract]);
    return {
      topic: 'Trigonometría', title: 'Identidades trigonométricas',
      hint: 'Pasá todo a seno y coseno. Identidades clave: sin²+cos²=1, 1+tan²=sec², 1+cot²=csc², tan·cot=1.',
      statement: `<p>Reduzca a la mínima expresión aplicando identidades trigonométricas:</p>$$${chosen.e}$$`,
      items: [{ key: 'r', type: 'choice', label: 'Expresión reducida', options: opts.map((o) => `$${o}$`), answer: opts.indexOf(chosen.r) }],
      solution: `${chosen.steps}<p>Resultado: $${chosen.r}$.</p>`,
    };
  };

  /* ======================= 13. FUNCIONES TRIGONOMÉTRICAS ======================= */
  G.math.funcionTrig = function (rng) {
    const variant = rng.int(0, 2);
    const Bs = [{ t: '\\frac{\\pi}{2}', v: Math.PI / 2 }, { t: '\\frac{\\pi}{4}', v: Math.PI / 4 }, { t: '\\frac{\\pi}{6}', v: Math.PI / 6 }, { t: '2', v: 2 }, { t: '3', v: 3 }, { t: '\\pi', v: Math.PI }, { t: '12\\pi', v: 12 * Math.PI }, { t: '4\\pi', v: 4 * Math.PI }];
    if (variant === 0) {
      const A = rng.pick([2, 3, 5, 8, 10, 11, 120]); const B = rng.pick(Bs); const useCos = rng.bool(0.3);
      const T = 2 * Math.PI / B.v, f = 1 / T;
      const tmax = useCos ? 0 : (Math.PI / 2) / B.v, tmin = useCos ? Math.PI / B.v : (3 * Math.PI / 2) / B.v;
      const fn = useCos ? 'cos' : 'sen';
      const ctx = rng.pick(['El movimiento de ondas sonoras $h(t)$', 'El desplazamiento $h(t)$ en centímetros de una masa suspendida por un resorte', 'El voltaje $V(t)$ producido por un generador de corriente alterna']);
      return {
        topic: 'Funciones trigonométricas', title: 'Amplitud, período y pulsación',
        hint: 'f(t) = A·sen(B·t): amplitud |A|, pulsación B, período T = 2π/B, frecuencia 1/T, imagen [−A; A]. Máximo cuando el seno vale 1.',
        statement: `<p>${ctx}, donde "t" se mide en segundos, se modela mediante la ecuación:</p>$$f(t)=${A}\\cdot ${fn}\\left(${B.t}\\cdot t\\right)$$<p>Calcule la amplitud, pulsación, período, frecuencia, imagen y el primer instante $t\\ge0$ en que la función alcanza su máximo y su mínimo. Dibuje la gráfica de la función al menos en dos períodos.</p>`,
        items: [
          { key: 'A', type: 'number', label: 'Amplitud', answer: A },
          { key: 'B', type: 'number', label: 'Pulsación B', answer: B.v, tol: 0.01 },
          { key: 'T', type: 'number', label: 'Período T (s)', answer: T, tol: 0.01 },
          { key: 'f', type: 'number', label: 'Frecuencia (Hz)', answer: f, tol: 0.01 },
          { key: 'im', type: 'vector', label: 'Imagen [mín ; máx]', answer: [-A, A], paren: true },
          { key: 'tmax', type: 'number', label: 'Primer instante del máximo (s)', answer: tmax, tol: 0.01 },
          { key: 'tmin', type: 'number', label: 'Primer instante del mínimo (s)', answer: tmin, tol: 0.01 },
        ],
        solution: `<p>Comparando con $f(t)=A\\cdot ${fn}(B\\,t)$: amplitud $A=${A}$, pulsación $B=${B.t}\\approx ${tex(B.v, 3)}$.</p>
$$T=\\frac{2\\pi}{B}=\\frac{2\\pi}{${B.t}}=${texFrac(T / Math.PI, 24) === tex(T / Math.PI, 3) ? tex(T, 3) : `${texFrac(T / Math.PI, 24)}\\pi\\approx ${tex(T, 3)}`}\\ \\text{s}\\qquad f=\\frac1T\\approx ${tex(f, 3)}\\ \\text{Hz}$$
<p>Imagen: $[-${A};${A}]$ (el ${fn} varía entre −1 y 1).</p>
<p>Máximo cuando $${fn}(B t)=1$: ${useCos ? '$Bt=0\\Rightarrow t=0$' : `$Bt=\\frac{\\pi}{2}\\Rightarrow t=\\frac{\\pi/2}{${B.t}}\\approx ${tex(tmax, 3)}$`} s. Mínimo cuando $${fn}(Bt)=-1$: ${useCos ? `$Bt=\\pi\\Rightarrow t\\approx ${tex(tmin, 3)}$` : `$Bt=\\frac{3\\pi}{2}\\Rightarrow t\\approx ${tex(tmin, 3)}$`} s.</p>`,
        chart: C().linesChart([{ label: 'f(t)', f: (t) => A * (useCos ? Math.cos(B.v * t) : Math.sin(B.v * t)), color: '#00455C' }], { xMin: 0, xMax: 2 * T, xLabel: 't (s)', yLabel: 'f(t)', n: 200, points: [{ x: tmax, y: A, label: 'Máx' }, { x: tmin, y: -A, label: 'Mín' }] }),
      };
    }
    if (variant === 1) {
      const A = rng.pick([5000, 10000, 8000, 12000]), Cc = rng.pick([40000, 60000, 50000, 80000]);
      const B = Math.PI / 6;
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      return {
        topic: 'Funciones trigonométricas', title: 'Modelo estacional de ventas',
        hint: 'f(t) = A·sen(π t/6) + C: el máximo ocurre cuando sen = 1 (π t/6 = π/2 → t = 3), el mínimo cuando sen = −1 (t = 9). Imagen [C − A; C + A].',
        statement: `<p>La comercialización de un producto estacionario está modelada por la función:</p>$$f(t)=${fmt(A, 0)}\\cdot sen\\left(\\frac{\\pi}{6}t\\right)+${fmt(Cc, 0)}$$<p>Donde "t" indica los meses del año actual (1 a 12) y $f(t)$ expresada en miles de pesos. Calcule:</p>
<ul><li>¿Cuál fue la máxima y mínima venta que se registró en el año? Indique el mes que corresponde.</li><li>Halle dominio, imagen, amplitud, período y realice la gráfica en el contexto del problema.</li></ul>`,
        items: [
          { key: 'max', type: 'number', label: 'Venta máxima (miles de $)', answer: A + Cc, tol: 1 },
          { key: 'tmax', type: 'number', label: 'Mes de la venta máxima (número)', answer: 3, tol: 0 },
          { key: 'min', type: 'number', label: 'Venta mínima (miles de $)', answer: Cc - A, tol: 1 },
          { key: 'tmin', type: 'number', label: 'Mes de la venta mínima (número)', answer: 9, tol: 0 },
          { key: 'A', type: 'number', label: 'Amplitud', answer: A, tol: 1 },
          { key: 'T', type: 'number', label: 'Período (meses)', answer: 12, tol: 0.01 },
        ],
        solution: `<p>El máximo se da cuando $\\sin(\\frac{\\pi}{6}t)=1\\Rightarrow\\frac{\\pi}{6}t=\\frac{\\pi}{2}\\Rightarrow t=3$ (marzo): $f(3)=${fmt(A + Cc, 0)}$ miles de pesos.</p>
<p>El mínimo cuando $\\sin(\\frac{\\pi}{6}t)=-1\\Rightarrow\\frac{\\pi}{6}t=\\frac{3\\pi}{2}\\Rightarrow t=9$ (septiembre): $f(9)=${fmt(Cc - A, 0)}$.</p>
<p>Dominio (contexto): $[1;12]$. Imagen: $[${fmt(Cc - A, 0)};${fmt(A + Cc, 0)}]$. Amplitud $A=${fmt(A, 0)}$. Período $T=\\frac{2\\pi}{\\pi/6}=12$ meses.</p>`,
        chart: C().linesChart([{ label: 'f(t)', f: (t) => A * Math.sin(B * t) + Cc, color: '#00455C' }], { xMin: 1, xMax: 12, xLabel: 't (mes)', yLabel: 'ventas (miles $)', n: 120, points: [{ x: 3, y: A + Cc, label: 'Máx' }, { x: 9, y: Cc - A, label: 'Mín' }] }),
      };
    }
    const k = rng.pick([0.25, 0.5, 2, 3, 1.5]), B = rng.pick([2, 3, 4]);
    const T = 2 * Math.PI / B;
    return {
      topic: 'Funciones trigonométricas', title: 'Parámetro a partir de la imagen',
      hint: 'Imagen [−k; k] ⇒ amplitud k. Período 2π/B. Ceros: sen(B t) = 0 ⇒ B t = nπ. Máximos donde sen = 1.',
      statement: `<p>La función $f(t)=k\\cdot sen(${B}\\cdot t)$ modela el movimiento de una partícula donde "t" está expresada en segundos. Halle "k", positiva, para calcular la amplitud, período, frecuencia, ceros, pulsación y máximos o mínimos, si se conoce que la imagen de la función es $\\left[-${texFrac(k)}\\,;\\,${texFrac(k)}\\right]$.</p>`,
      items: [
        { key: 'k', type: 'number', label: 'k (amplitud)', answer: k },
        { key: 'T', type: 'number', label: 'Período (s)', answer: T, tol: 0.01 },
        { key: 'f', type: 'number', label: 'Frecuencia (Hz)', answer: 1 / T, tol: 0.01 },
        { key: 'z', type: 'number', label: 'Primer cero positivo (s)', answer: Math.PI / B, tol: 0.01 },
        { key: 'tmax', type: 'number', label: 'Primer instante del máximo (s)', answer: Math.PI / (2 * B), tol: 0.01 },
      ],
      solution: `<p>Como $-1\\le\\sin(${B}t)\\le1$, la imagen es $[-k;k]$, entonces $k=${texFrac(k)}$ = amplitud.</p>
<p>Pulsación $B=${B}$, período $T=\\frac{2\\pi}{${B}}\\approx ${tex(T, 3)}$ s, frecuencia $f=\\frac1T\\approx ${tex(1 / T, 3)}$ Hz.</p>
<p>Ceros: $\\sin(${B}t)=0\\Rightarrow ${B}t=n\\pi\\Rightarrow t=\\frac{n\\pi}{${B}}$; el primero positivo es $t=\\frac{\\pi}{${B}}\\approx ${tex(Math.PI / B, 3)}$. Máximos: $${B}t=\\frac{\\pi}{2}+2n\\pi\\Rightarrow t=\\frac{\\pi}{${2 * B}}\\approx ${tex(Math.PI / (2 * B), 3)}$ s; mínimos en $t=\\frac{3\\pi}{${2 * B}}$.</p>`,
      chart: C().linesChart([{ label: 'f(t)', f: (t) => k * Math.sin(B * t), color: '#00455C' }], { xMin: 0, xMax: 2 * T, xLabel: 't (s)', yLabel: 'f(t)', n: 200 }),
    };
  };

  /* ======================= 14. EXPRESIONES ALGEBRAICAS ======================= */
  G.math.expresionesAlgebraicas = function (rng) {
    const variant = rng.int(0, 3);
    if (variant === 0) {
      const T = [
        { e: '\\frac{b\\,x^2-b-x^2+1}{b^2x-x+b^2-1}', r: '\\frac{x-1}{b+1}', s: '<p>Factor común por grupos: numerador $b(x^2-1)-(x^2-1)=(x^2-1)(b-1)=(x-1)(x+1)(b-1)$; denominador $x(b^2-1)+(b^2-1)=(b^2-1)(x+1)=(b-1)(b+1)(x+1)$.</p><p>Simplificando $(x+1)$ y $(b-1)$ queda $\\dfrac{x-1}{b+1}$.</p>' },
        { e: '\\frac{m^2-n^2}{m^2-2mn+n^2}', r: '\\frac{m+n}{m-n}', s: '<p>Diferencia de cuadrados: $m^2-n^2=(m-n)(m+n)$. Trinomio cuadrado perfecto: $m^2-2mn+n^2=(m-n)^2$. Simplificando un factor $(m-n)$ queda $\\dfrac{m+n}{m-n}$.</p>' },
        { e: '\\frac{x^3+3x^2-4x-12}{(x^2-4)(1-2x)}\\cdot\\frac{1-2x}{-2x^2-5x+3}', r: '\\frac{1}{1-2x}', s: '<p>$x^3+3x^2-4x-12=x^2(x+3)-4(x+3)=(x+3)(x^2-4)$. Además $-2x^2-5x+3=-(2x-1)(x+3)=(1-2x)(x+3)$.</p><p>Queda $\\dfrac{(x+3)(x^2-4)}{(x^2-4)(1-2x)}\\cdot\\dfrac{1-2x}{(1-2x)(x+3)}=\\dfrac{1}{1-2x}$.</p>' },
        { e: '\\frac{x^2+2x}{3x^2-18x+24}\\cdot\\frac{x^2-x-6}{x^2-4x+4}', r: '\\frac{x(x+2)^2(x-3)}{3(x-2)^3(x-4)}', s: '<p>$x^2+2x=x(x+2)$; $3x^2-18x+24=3(x-2)(x-4)$; $x^2-x-6=(x-3)(x+2)$; $x^2-4x+4=(x-2)^2$.</p><p>Producto: $\\dfrac{x(x+2)(x-3)(x+2)}{3(x-2)(x-4)(x-2)^2}=\\dfrac{x(x+2)^2(x-3)}{3(x-2)^3(x-4)}$ (no hay factores para simplificar).</p>' },
        { e: '\\frac{x^2-6x+9}{x^2-9}', r: '\\frac{x-3}{x+3}', s: '<p>$x^2-6x+9=(x-3)^2$ y $x^2-9=(x-3)(x+3)$. Simplificando: $\\dfrac{x-3}{x+3}$.</p>' },
        { e: '\\frac{a^3-a\\,b^2}{a^2+2ab+b^2}', r: '\\frac{a(a-b)}{a+b}', s: '<p>$a^3-ab^2=a(a^2-b^2)=a(a-b)(a+b)$ y $a^2+2ab+b^2=(a+b)^2$. Queda $\\dfrac{a(a-b)}{a+b}$.</p>' },
      ];
      const idx = rng.int(0, T.length - 1);
      const c = T[idx];
      const opts = rng.shuffle([c.r, ...rng.sample(T.filter((_, i) => i !== idx).map((t) => t.r), 3)]);
      return {
        topic: 'Expresiones algebraicas', title: 'Factorizar y simplificar',
        hint: 'Factorizar: factor común, factor común por grupos, diferencia de cuadrados, trinomio cuadrado perfecto. Luego simplificar factores iguales.',
        statement: `<p>Opere algebraicamente, factorice y simplifique la expresión:</p>$$${c.e}$$`,
        items: [{ key: 'r', type: 'choice', label: 'Expresión simplificada', options: opts.map((o) => `$${o}$`), answer: opts.indexOf(c.r) }],
        solution: `${c.s}<p>Resultado: $${c.r}$.</p>`,
      };
    }
    if (variant === 1) {
      const b = rng.pick([2, 3, 5, 6]); const c1 = rng.int(1, 12), c2 = rng.int(1, 12), c3 = rng.int(1, 15); const d = rng.pick([1, 2, 3, 4]);
      const K = c1 * b * b + c2 * b + c3;
      const val = K / (b * d ** 3);
      return {
        topic: 'Expresiones algebraicas', title: 'Propiedades de la potencia',
        hint: 'Sacá factor común la potencia menor: b^(3n+2)·(c₁b² + c₂b + c₃). Luego producto de potencias de igual base: se suman exponentes.',
        statement: `<p>Reduzca a la mínima expresión aplicando propiedades de la potencia:</p>$$\\left(${c1}\\cdot ${b}^{3n+4}+${c2}\\cdot ${b}^{3n+3}+${c3}\\cdot ${b}^{3n+2}\\right)\\cdot\\left(\\frac{${b}^{-(n+1)}}{${d}}\\right)^{3}$$`,
        items: [{ key: 'r', type: 'number', label: 'Resultado (número)', answer: val, tol: 0.011 }],
        solution: `<p>Factor común $${b}^{3n+2}$ en el paréntesis: $${b}^{3n+2}(${c1}\\cdot ${b}^2+${c2}\\cdot ${b}+${c3})=${b}^{3n+2}\\cdot ${K}$.</p>
<p>El segundo factor: $\\left(\\dfrac{${b}^{-(n+1)}}{${d}}\\right)^3=\\dfrac{${b}^{-3n-3}}{${d ** 3}}$.</p>
$$${K}\\cdot ${b}^{3n+2}\\cdot\\frac{${b}^{-3n-3}}{${d ** 3}}=\\frac{${K}\\cdot ${b}^{-1}}{${d ** 3}}=\\frac{${K}}{${b * d ** 3}}=${texFrac(val, 500)}${Number.isInteger(val) ? '' : `\\approx ${tex(val, 3)}`}$$`,
      };
    }
    if (variant === 2) {
      const n = rng.pick([5, 7]); const [x, y, z] = rng.pick([['x', 'y', 'z'], ['a', 'b', 'c'], ['p', 'q', 'r']]);
      const r = `${x}${y}${z}\\sqrt[${n}]{${x}${y}${z}}`;
      const opts = rng.shuffle([r, `${x}${y}${z}`, `\\sqrt[${n}]{${x}${y}${z}}`, `${x}^2${y}^2${z}^2`]);
      return {
        topic: 'Expresiones algebraicas', title: 'Radicales',
        hint: 'Sacá factor común ⁿ√(xⁿ⁺¹yⁿ⁺¹zⁿ⁺¹) en el numerador; lo que queda es exactamente el denominador.',
        statement: `<p>Resuelva y reduzca a su mínima expresión:</p>$$\\frac{\\sqrt[${n}]{${x}^{${n + 2}}${y}^{${n + 1}}${z}^{${n + 1}}}+\\sqrt[${n}]{${x}^{${n + 1}}${y}^{${n + 2}}${z}^{${n + 1}}}+\\sqrt[${n}]{${x}^{${n + 1}}${y}^{${n + 1}}${z}^{${n + 2}}}}{\\sqrt[${n}]{${x}}+\\sqrt[${n}]{${y}}+\\sqrt[${n}]{${z}}}$$`,
        items: [{ key: 'r', type: 'choice', label: 'Resultado', options: opts.map((o) => `$${o}$`), answer: opts.indexOf(r) }],
        solution: `<p>Cada radical del numerador contiene el factor $\\sqrt[${n}]{${x}^{${n + 1}}${y}^{${n + 1}}${z}^{${n + 1}}}$; extrayéndolo:</p>
$$\\sqrt[${n}]{${x}^{${n + 1}}${y}^{${n + 1}}${z}^{${n + 1}}}\\left(\\sqrt[${n}]{${x}}+\\sqrt[${n}]{${y}}+\\sqrt[${n}]{${z}}\\right)$$
<p>Se simplifica con el denominador y queda $\\sqrt[${n}]{${x}^{${n + 1}}${y}^{${n + 1}}${z}^{${n + 1}}}=${x}${y}${z}\\sqrt[${n}]{${x}${y}${z}}$.</p>`,
      };
    }
    // simplificar exponentes negativos
    const ex = rng.intNZ(-3, 4), ey = rng.intNZ(-3, 4), ez = rng.intNZ(-4, 3);
    const ex2 = rng.intNZ(-6, 6), ey2 = rng.intNZ(-3, 3), ez2 = rng.intNZ(-7, 7);
    const ex3 = rng.intNZ(-2, 2), ey3 = rng.intNZ(-2, 6), ez3 = rng.intNZ(-2, 2);
    const k1 = rng.pick([500, 200, 300]), k2 = rng.pick([10, 100]), k3 = rng.pick([10, 100, 1000]);
    const X = ex - ex2 - ex3, Y = ey - ey2 + ey3, Z = ez - ez2 - ez3;
    const coef = (k1 * 10) / (k2 * k3);
    const mono = (k, a, b, c) => `${k}\\,x^{${a}}\\,y^{${b}}\\,z^{${c}}`;
    return {
      topic: 'Expresiones algebraicas', title: 'Simplificar exponentes',
      hint: 'Producto de potencias de igual base: sumar exponentes; cociente: restar. Agrupá por variable y al final expresá sin exponentes negativos.',
      statement: `<p>Simplifique y elimine cualquier exponente negativo de la expresión (exprese el resultado como $k\\,x^{a}y^{b}z^{c}$):</p>$$\\frac{${mono(k1, ex, ey, ez)}\\cdot 10}{${mono(k2, ex2, ey2, ez2)}\\cdot ${k3}}\\cdot\\frac{x^{${-ex3}}}{y^{${-ey3}}\\,z^{${ez3}}}$$`,
      items: [
        { key: 'k', type: 'number', label: 'Coeficiente k', answer: coef, tol: 0.001 },
        { key: 'a', type: 'number', label: 'Exponente de x', answer: X, tol: 0 },
        { key: 'b', type: 'number', label: 'Exponente de y', answer: Y, tol: 0 },
        { key: 'c', type: 'number', label: 'Exponente de z', answer: Z, tol: 0 },
      ],
      solution: `<p>Coeficiente: $\\dfrac{${k1}\\cdot10}{${k2}\\cdot ${k3}}=${texFrac(coef, 1000)}$.</p>
<p>$x$: $${ex}-(${ex2})+(${-ex3})=${X}$; $y$: $${ey}-(${ey2})+(${ey3})=${Y}$; $z$: $${ez}-(${ez2})-(${ez3})=${Z}$.</p>
$$${texFrac(coef, 1000)}\\,x^{${X}}y^{${Y}}z^{${Z}}$$`,
    };
  };

  /* ======================= 15. LECTURA DE GRÁFICO ======================= */
  G.math.lecturaGrafico = function (rng) {
    const ctx = rng.pick([{ t: 'La gráfica muestra la temperatura media de un enfermo en cada uno de los diez días que estuvo internado en el hospital.', xl: 'días', yl: 'T (°C)', base: 37, amp: 2, step: 0.5 }, { t: 'La gráfica muestra la variación de temperatura en algunas horas de un día de primavera de un país.', xl: 'horas', yl: 'T (°C)', base: 0, amp: 6, step: 1 }]);
    const n = 10;
    const ys = [];
    for (let i = 0; i <= n; i++) ys.push(ctx.base + rng.int(-ctx.amp / ctx.step, ctx.amp / ctx.step) * ctx.step);
    // asegurar cruces por cero en nodos si base=0
    if (ctx.base === 0) for (let i = 0; i < n; i++) if (ys[i] * ys[i + 1] < 0) ys[i + 1] = 0;
    const pts = ys.map((y, i) => ({ x: i, y }));
    const mn = Math.min(...ys), mx = Math.max(...ys);
    const x0 = rng.int(1, 9);
    const target = rng.pick(ys.filter((y) => y !== mn && y !== mx)) ?? ys[3];
    const xsTarget = []; pts.forEach((p) => { if (p.y === target) xsTarget.push(p.x); });
    // intervalos positividad (para base 0) o f > umbral (base 37 → f > 37)
    const thr = ctx.base;
    const posInt = [], negInt = [];
    let start = null;
    for (let i = 0; i <= n; i++) {
      const s = ys[i] > thr ? 1 : ys[i] < thr ? -1 : 0;
      if (start === null && s !== 0) start = { i, s };
      else if (start && s !== start.s) { (start.s > 0 ? posInt : negInt).push([start.i, s === 0 ? i : i - 1]); start = s !== 0 ? { i, s } : null; }
      if (i === n && start) (start.s > 0 ? posInt : negInt).push([start.i, i]);
    }
    // corregir extremos: cuando el signo cambia sin pasar por 0 (base 37) usamos el nodo intermedio
    const intTex = (arr) => arr.length ? arr.map(([a, b]) => `(${a}\\,;\\,${b})`).join('\\cup') : '\\varnothing';
    const correct = intTex(posInt);
    const opts = rng.shuffle([...new Set([correct, intTex(negInt), `[${posInt.length ? posInt[0][0] : 0}\\,;\\,${n}]`, `(0\\,;\\,${n})`])]);
    while (opts.length < 4) opts.push(`(${rng.int(0, 4)}\\,;\\,${rng.int(5, 10)})`);
    return {
      topic: 'Funciones', title: 'Lectura de gráfico',
      hint: 'Imagen: valores de "y" que toma la gráfica (mínimo y máximo). f(x₀): leé la altura en x₀. Positividad: tramos donde la curva está por encima del umbral.',
      statement: `<p>${ctx.t} Calcule:</p><ul><li>¿Cuál es la imagen de la función?</li><li>$f(${x0})$</li><li>¿Para qué valores de "x" tiene $f(x)=${tex(target, 1)}$?</li><li>Intervalo donde $f(x)${thr ? '>' + thr : '>0'}$ (por encima de ${thr}°C)</li></ul>`,
      qchart: C().pointsChart(pts, { xLabel: ctx.xl, yLabel: ctx.yl, stepped: false }),
      items: [
        { key: 'im', type: 'vector', label: 'Imagen [mín ; máx]', answer: [mn, mx], paren: true },
        { key: 'f', type: 'number', label: `f(${x0})`, answer: ys[x0] },
        { key: 'xs', type: 'set', label: `Valores de x con f(x) = ${fmt(target, 1)} (dejar vacío los que no use)`, answer: xsTarget, slots: Math.max(2, xsTarget.length) },
        { key: 'pos', type: 'choice', label: `Intervalo donde f(x) > ${thr}`, options: opts.slice(0, 4).map((o) => `$${o}$`), answer: opts.slice(0, 4).indexOf(correct) },
      ],
      solution: `<p><b>Imagen:</b> el menor valor de la gráfica es ${fmt(mn, 1)} y el mayor ${fmt(mx, 1)}: $Im=[${tex(mn, 1)};${tex(mx, 1)}]$.</p>
<p><b>$f(${x0})$:</b> en $x=${x0}$ la gráfica está a la altura ${fmt(ys[x0], 1)}.</p>
<p><b>$f(x)=${tex(target, 1)}$:</b> ocurre en los nodos $x=${xsTarget.join(', ')}$ (la línea toca ese valor allí).</p>
<p><b>$f(x)>${thr}$:</b> mirando los tramos por encima de ${thr}: $${correct}$. Por debajo: $${intTex(negInt)}$.</p>`,
    };
  };

  /* ======================= 16. CUADRILÁTERO DE RECTAS ======================= */
  G.math.cuadrilatero = function (rng) {
    const rect = rng.bool(0.4);
    const m1 = rng.pick([1, 2, 0.5, -1, 3]);
    const m2 = rect ? -1 / m1 : rng.pick([0.25, -2, 0.5, -0.5, 3].filter((v) => v !== m1 && v !== -1 / m1));
    const b1 = rng.intNZ(-4, 4), b2 = b1 + rng.pick([-3, 3, -4, 4, 5]);
    const c1 = rng.intNZ(-4, 4), c2 = c1 + rng.pick([-3, 3, -2, 2, 4]);
    const inter = (ma, ba, mb, bb) => { const x = (bb - ba) / (ma - mb); return [x, ma * x + ba]; };
    const V = [inter(m1, b1, m2, c1), inter(m1, b1, m2, c2), inter(m1, b2, m2, c2), inter(m1, b2, m2, c1)];
    const side = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    const s1 = side(V[0], V[1]), s2 = side(V[1], V[2]);
    const equalSides = Math.abs(s1 - s2) < 1e-6;
    const type = rect ? (equalSides ? 'Cuadrado' : 'Rectángulo') : (equalSides ? 'Rombo' : 'Paralelogramo');
    const opts = ['Paralelogramo', 'Rectángulo', 'Rombo', 'Cuadrado', 'Trapecio'];
    const lines = [line(m1, b1), line(m1, b2), line(m2, c1), line(m2, c2)];
    return {
      topic: 'Rectas', title: 'Cuadrilátero formado por rectas',
      hint: 'Rectas con igual pendiente son paralelas; si m₁·m₂ = −1 son perpendiculares. Vértices: igualá las ecuaciones de a pares.',
      statement: `<p>Trace en el mismo sistema de ejes cartesianos la gráfica de las funciones: ${lines.map((l) => `$${l}$`).join(' ; ')}. ¿Qué tipo de cuadrilátero forman estas rectas al cortarse? Encuentre los puntos de intersección.</p>`,
      items: [
        { key: 't', type: 'choice', label: 'Tipo de cuadrilátero', options: opts, answer: opts.indexOf(type) },
        { key: 'v', type: 'vectorset', label: 'Vértices (en cualquier orden)', answer: V, labels: ['A', 'B', 'C', 'D'], paren: true },
      ],
      solution: `<p>Las rectas $${lines[0]}$ y $${lines[1]}$ tienen pendiente $${texFrac(m1)}$ (paralelas); $${lines[2]}$ y $${lines[3]}$ tienen pendiente $${texFrac(m2)}$ (paralelas). ${rect ? `Además $${texFrac(m1)}\\cdot${texFrac(m2)}=-1$: son perpendiculares.` : 'Los pares no son perpendiculares.'}</p>
<p>Vértices (igualando ecuaciones de a pares): ${V.map((p) => `$(${tex(p[0])};${tex(p[1])})$`).join(', ')}.</p>
<p>Lados: $${tex(s1)}$ y $${tex(s2)}$ → ${equalSides ? 'iguales' : 'distintos'}. Por lo tanto es un <b>${type.toLowerCase()}</b>.</p>`,
      chart: C().linesChart([{ label: lines[0], f: (x) => m1 * x + b1, color: '#00455C' }, { label: lines[1], f: (x) => m1 * x + b2, color: '#00455C', dashed: true }, { label: lines[2], f: (x) => m2 * x + c1, color: '#d97706' }, { label: lines[3], f: (x) => m2 * x + c2, color: '#d97706', dashed: true }], { xMin: Math.min(...V.map((p) => p[0])) - 2, xMax: Math.max(...V.map((p) => p[0])) + 2, points: V.map((p) => ({ x: p[0], y: p[1] })) }),
    };
  };
})(window);
