/* Verifica que las respuestas de los generadores del nivel Final cumplan el enunciado: node test/final-check.js [seeds] */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
global.window = global;
for (const f of ['utils.js', 'charts.js', 'gen-math-1.js', 'gen-math-2.js', 'gen-guia.js', 'gen-final.js']) new Function(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'))();
const { RNG } = window.U, M = window.GEN.math;
const N = parseInt(process.argv[2] || '300', 10);
const near = (a, b, t = 1e-6) => Math.abs(a - b) < t;
const ans = (ex, k) => ex.items.find((i) => i.key === k).answer;

for (let s = 0; s < N; s++) {
  const r = (g) => M[g](new RNG(`${g}-${s}`));
  // complejos: z = [(a+bi)+i^n]/(c+di) leído del enunciado
  let ex = r('complejos');
  const m = ex.statement.match(/\\left\[\((-?\d+)(?:([+-]\d*)i)?\)\+i\^\{(\d+)\}\\right\]\}\{(\d+)([+-]\d*)i\}/);
  assert(m, ex.statement);
  const co = (v) => (v === '+' || v === undefined ? 1 : v === '-' ? -1 : +v);
  const [a, b, n, c, d] = [+m[1], m[2] === undefined ? 0 : co(m[2]), +m[3], +m[4], co(m[5])];
  const pw = [[1, 0], [0, 1], [-1, 0], [0, -1]][n % 4], nr = a + pw[0], ni = b + pw[1], den = c * c + d * d;
  const zr = (nr * c + ni * d) / den, zi = (ni * c - nr * d) / den;
  assert(near(ans(ex, 'zc')[0], zr) && near(ans(ex, 'zc')[1], -zi) && near(ans(ex, 'mod'), Math.hypot(zr, zi)), `complejos#${s}`);

  ex = r('finalVectores');
  const [u, w] = [ans(ex, 'u'), ans(ex, 'w')], k = Math.hypot(...w) / Math.hypot(...u);
  assert([1, 2, 3].some((v) => near(k, v)), `vectores#${s} k=${k}`);

  ex = r('finalPolinomioResto');
  const roots = ans(ex, 'roots'), P = roots.reduce((acc, x) => window.U.polyMul(acc, [1, -x]), [1]);
  assert(P[1] === ans(ex, 'a') && P[3] === ans(ex, 'b'), `polinomio#${s}`);

  ex = r('finalLog');
  const x = ans(ex, 'x'), st = ex.statement;
  let mm = st.match(/\\log(?:_\{\d+\})?\(x([+-]\d+)?\)-\\log(?:_\{\d+\})?\(x([+-]\d+)?\)=\\log(?:_\{\d+\})?(\d+)/);
  if (mm) { const p = +(mm[1] || 0), q = +(mm[2] || 0); assert(x + q > 0 && near((x + p) / (x + q), +mm[3]), `log A#${s}`); }
  else {
    mm = st.match(/\(2x-(\d+)\)-\\log_\{\d+\}\((\d*)x\+(\d+)\)/); assert(mm, st);
    const cc = +mm[1], dd = +(mm[2] || 1), ee = +mm[3];
    assert(x > 0 && 2 * x - cc > 0 && near(x * (2 * x - cc), dd * x + ee), `log B#${s}`);
  }

  ex = r('finalRectas');
  assert(near(ans(ex, 'm1') * ans(ex, 'm2'), -1), `rectas#${s}`);

  ex = r('finalFuncionTrig');
  if (ex.items[0].key === 'max') assert(ans(ex, 'tmax').every((t) => near(Math.sin(Math.PI * t / (ans(ex, 'tmin')[0] / 1.5)), 1)), `trig#${s}`);
}
console.log(`OK: ${N} semillas por generador`);
