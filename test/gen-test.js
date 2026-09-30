/* Prueba de generadores: node test/gen-test.js [seeds] */
const fs = require('fs');
const path = require('path');
const window = global.window = global;
for (const f of ['utils.js', 'charts.js', 'gen-math-1.js', 'gen-math-2.js', 'gen-fisica.js']) {
  new Function(fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8'))();
}
const { RNG } = window.U;
const N = parseInt(process.argv[2] || '150', 10);
let errors = 0, total = 0;
const gens = [];
for (const area of ['math', 'fisica']) for (const [name, fn] of Object.entries(window.GEN[area])) gens.push({ area, name, fn });

const checkItem = (it, ctx) => {
  const bad = (msg) => { errors++; console.log(`  ✗ ${ctx} [${it.key}] ${msg}`); };
  if (!it.label) bad('sin label');
  switch (it.type) {
    case 'number':
      if (!it.check && !Number.isFinite(it.answer)) bad(`answer no finito: ${it.answer}`);
      break;
    case 'vector':
      if (!it.check && (!Array.isArray(it.answer) || it.answer.length !== 2 || !it.answer.every(Number.isFinite))) bad(`vector inválido ${JSON.stringify(it.answer)}`);
      break;
    case 'vectorset':
      if (!Array.isArray(it.answer) || !it.answer.every((v) => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite))) bad(`vectorset inválido ${JSON.stringify(it.answer)}`);
      break;
    case 'set':
      if (!Array.isArray(it.answer) || !it.answer.every(Number.isFinite)) bad(`set inválido ${JSON.stringify(it.answer)}`);
      if (it.answer.length > (it.slots || 2)) bad('más respuestas que slots');
      if (it.answer.length === 0 && !it.allowEmpty) bad('set vacío sin allowEmpty');
      break;
    case 'poly':
      if (!Array.isArray(it.answer) || !it.answer.every(Number.isFinite)) bad(`poly inválido ${JSON.stringify(it.answer)}`);
      if (it.answer.length > it.degree + 1) bad(`poly grado ${it.answer.length - 1} > ${it.degree}`);
      break;
    case 'choice':
      if (!Array.isArray(it.options) || it.options.length < 2) bad('choice sin opciones');
      if (!(it.answer >= 0 && it.answer < it.options.length)) bad(`choice answer fuera de rango ${it.answer}`);
      if (new Set(it.options).size !== it.options.length) bad('opciones repetidas: ' + JSON.stringify(it.options));
      break;
    default: bad(`tipo desconocido ${it.type}`);
  }
};

const stats = {};
for (const g of gens) {
  for (let s = 1; s <= N; s++) {
    total++;
    const ctx = `${g.area}.${g.name}#${s}`;
    try {
      const ex = g.fn(new RNG(`${g.name}-${s}`));
      if (!ex.statement || !ex.items || !ex.items.length || !ex.solution || !ex.topic) { errors++; console.log(`  ✗ ${ctx} estructura incompleta`); continue; }
      if (!ex.hint) { errors++; console.log(`  ✗ ${ctx} sin hint`); }
      if (/undefined|NaN|Infinity/.test(ex.statement + ex.solution + JSON.stringify(ex.items))) { errors++; console.log(`  ✗ ${ctx} contiene undefined/NaN`); }
      ex.items.forEach((it) => checkItem(it, ctx));
      stats[g.name] = stats[g.name] || new Set(); stats[g.name].add(ex.title);
    } catch (e) { errors++; console.log(`  ✗ ${ctx} EXCEPCIÓN: ${e.message}\n${e.stack.split('\n').slice(1, 3).join('\n')}`); }
  }
}
console.log(`\nGeneradores: ${gens.length}, instancias: ${total}, errores: ${errors}`);
for (const [k, v] of Object.entries(stats)) console.log(` - ${k}: ${[...v].join(' | ')}`);
process.exit(errors ? 1 : 0);
