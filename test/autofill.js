/* Helper de prueba: completa el examen en curso con las respuestas correctas,
   salvo el ejercicio 2 (mal) y el 4 (vacío). Uso: inyectar en la página. */
(function () {
  const S = window.UTNApp.state;
  const str = (v) => String(v);
  S.exercises.forEach((e, i) => {
    if (i === 3) return;
    e.ex.items.forEach((it) => {
      let v;
      switch (it.type) {
        case 'number': v = str(it.answer); if (i === 1) v = '999'; break;
        case 'vector': v = it.check ? ['1', '0'] : it.answer.map(str); break;
        case 'vectorset': v = it.answer.map((a) => a.map(str)); break;
        case 'set': v = { v: it.answer.map(str).concat(new Array((it.slots || 2) - it.answer.length).fill('')), none: it.answer.length === 0 }; break;
        case 'poly': { const t = new Array(it.degree + 1).fill('0'); it.answer.forEach((c, k) => { t[it.degree + 1 - it.answer.length + k] = str(c); }); v = t; break; }
        case 'choice': v = it.answer; if (i === 1) v = (it.answer + 1) % it.options.length; break;
        default: break;
      }
      S.exam.answers[i][it.key] = v;
    });
  });
  const r = window.UTNApp.gradeExam();
  window.__fill = 'nota=' + r.nota + ' | ' + r.per.map((p) => (p.i + 1) + ':' + p.score.toFixed(2) + (p.items.filter((x) => !x.ok).length ? ' [' + p.items.filter((x) => !x.ok).map((x) => x.item.label).join('; ') + ']' : '')).join(' ');
  document.title = window.__fill;
})();
