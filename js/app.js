/* ==========================================================================
   app.js — Ejercitación para finales UTN
   Configuración, generación del examen, temporizadores, corrección, soluciones
   paso a paso, historial (localStorage) y exportación a PDF.
   ========================================================================== */
(function () {
  'use strict';
  const U = window.U, C = window.C, GEN = window.GEN;
  const { RNG, fmt, tex, texPoly, parseNumber, closeTo, setMatch, escapeHtml, fmtTime } = U;

  /* ---------------- Constantes ---------------- */
  const EXAM_SECONDS = 2 * 60 * 60;
  const LIMITS = { optimo: 8 * 60, maximo: 10 * 60 };
  const PASS = 7;
  const LS_EXAM = 'utn-finales:exam', LS_HISTORY = 'utn-finales:history', LS_CONFIG = 'utn-finales:config';

  /** Slots del examen: cada punto elige un generador de su familia */
  const MATH_SLOTS = [
    ['calculoNumerico', 'calculoNumerico', 'expresionesAlgebraicas', 'notacionCientifica', 'fracciones', 'racionalizacion', 'intervalos', 'pasajeNotacion', 'conjuntosNumericos'],
    ['vectoresParametro', 'vectoresModulo', 'vectoresOperaciones', 'desplazamientos', 'versorProductoEscalar'],
    ['polinomioParametros', 'polinomioGauss', 'polinomioTresParametros', 'fraccionesAlgebraicas'],
    ['polinomioDivisible', 'polinomioProductoCociente', 'inecuacionModulo', 'inecuacionLineal', 'inecuacionNoLineal', 'inecuacionProblema'],
    ['ecuacionLog', 'ecuacionLog', 'ecuacionExp', 'ecuacionRacional', 'ecuacionRaiz', 'ecuacionLineal', 'ecuacionCuadratica', 'ecuacionBicuadratica', 'ecuacionModulo'],
    ['rectas', 'linealContexto', 'linealContexto', 'rectaPendiente'],
    ['sistemas', 'sistemas', 'sistemaClasificar'],
    ['cuadraticaContexto', 'cuadraticaContexto', 'cuadraticaInterseccion', 'parabolaElementos'],
    ['trigTriangulos', 'trigIdentidades', 'lecturaGrafico', 'expresionesAlgebraicas', 'angulosConversion', 'dominioFuncion', 'transformacionFunciones'],
    ['funcionTrig', 'funcionTrig', 'funcionTrigTransformada'],
  ];
  /** Nivel Final (primera instancia): sin logaritmos, ecuaciones irracionales, polinomios con parámetros ni funciones trigonométricas con parámetros */
  const MATH_SLOTS_1 = [
    ['expresionesAlgebraicas', 'racionalizacion', 'fracciones', 'notacionCientifica', 'pasajeNotacion', 'intervalos', 'calculoNumerico'],
    ['vectoresParametro', 'vectoresOperaciones', 'versorProductoEscalar', 'desplazamientos'],
    ['polinomioProductoCociente', 'fraccionesAlgebraicas'],
    ['inecuacionModulo', 'inecuacionLineal', 'inecuacionProblema', 'inecuacionNoLineal'],
    ['ecuacionModulo', 'ecuacionLineal', 'ecuacionCuadratica', 'ecuacionBicuadratica', 'ecuacionExp', 'ecuacionRacional'],
    ['rectas', 'linealContexto', 'linealContexto', 'rectaPendiente'],
    ['sistemas', 'sistemaClasificar'],
    ['cuadraticaContexto', 'cuadraticaContexto', 'parabolaElementos'],
    ['trigTriangulos', 'trigTriangulos', 'trigIdentidades', 'angulosConversion'],
    ['lecturaGrafico', 'dominioFuncion', 'transformacionFunciones'],
  ];
  const LEVEL_LABEL = { primera: 'Final', recuperatorio: 'Recuperatorio' };
  const levelOf = (cfg) => (cfg && cfg.level) || 'recuperatorio'; // exámenes guardados sin nivel = mezcla completa
  const FIS_SLOTS = [
    ['unidades', 'unidades', 'magnitudes'], ['vectoresParalelos'], ['desplazamientos'], ['vectoresOperaciones'], ['tiroVertical'],
    ['caidaLibre'], ['mruv'], ['mru'], ['graficoXT'], ['tiroVertical', 'mruv', 'mru', 'caidaLibre'],
  ];
  const SUBJECT_LABEL = { both: 'Precálculo + Física', math: 'Precálculo', fisica: 'Física' };
  const MODE_LABEL = { none: 'Sin tiempo', optimo: '2 h · óptimo 8 min/ej.', maximo: '2 h · máximo 10 min/ej.', libre: '2 h · sin máximo por ej.' };

  const TOPICS = [
    { area: 'Precálculo', items: [
      ['Función cuadrática en contexto (altura, vértice, raíces, parábola por puntos)', 'Muy alta'],
      ['Polinomios: parámetros, Ruffini, Gauss, teorema del resto, producto y cociente', 'Muy alta'],
      ['Funciones trigonométricas: amplitud, período, frecuencia, pulsación, imagen', 'Muy alta'],
      ['Ecuaciones logarítmicas con dominio y verificación', 'Alta'],
      ['Vectores: perpendicularidad con parámetro, módulo, suma, ángulo', 'Alta'],
      ['Sistemas: mezclas, autos/motos, entradas, encuentro de móviles', 'Alta'],
      ['Función lineal en contexto y rectas paralelas/perpendiculares', 'Alta'],
      ['Cálculo numérico con potencias, raíces y notación científica', 'Alta'],
      ['Trigonometría: teodolito, ángulos de elevación, identidades', 'Media'],
      ['Inecuaciones con valor absoluto y lineales con radicales', 'Media'],
      ['Ecuaciones exponenciales, racionales y con radicales', 'Media'],
      ['Expresiones algebraicas: factorizar, simplificar, potencias, radicales', 'Media'],
      ['Desplazamientos con rosa de los vientos', 'Media'],
      ['Lectura de gráficos (imagen, valor, signo)', 'Baja'],
      ['Conjuntos, intervalos (unión, intersección, amplitud) y conjuntos numéricos', 'Muy baja'],
      ['Fracciones, racionalización y pasajes de notación científica / unidades', 'Muy baja'],
      ['Vector unitario, producto escalar y ángulo entre vectores', 'Muy baja'],
      ['Ecuaciones lineales, cuadráticas, bicuadráticas y con módulo; planteo de problemas', 'Muy baja'],
      ['Inecuaciones no lineales (tabla de signos) y problemas con inecuaciones', 'Muy baja'],
      ['Fracciones algebraicas: suma, resta, producto y simplificación', 'Muy baja'],
      ['Dominio y transformaciones de funciones; función trigonométrica transformada', 'Muy baja'],
      ['Recta por dos puntos, ángulo de inclinación, parámetro k; elementos de la parábola', 'Muy baja'],
      ['Clasificación de sistemas 2×2 (S.C.D., S.C.I., S.I.) y conversión grados ↔ radianes', 'Muy baja'],
    ] },
    { area: 'Física', items: [
      ['Pasajes de unidades (longitud, tiempo, velocidad)', 'Muy alta'],
      ['Tiro vertical: altura, altura máxima, tiempos, velocidad final', 'Muy alta'],
      ['Vectores: k para paralelos/perpendiculares, suma, ángulo, versor', 'Muy alta'],
      ['Desplazamientos: resultante y ángulo', 'Alta'],
      ['Caída libre: ecuaciones, tiempo de caída, velocidad de impacto', 'Alta'],
      ['MRUV: aceleración, frenado, función velocidad', 'Alta'],
      ['MRU: encuentro y velocidad promedio', 'Alta'],
      ['Gráficos posición-tiempo', 'Media'],
      ['Magnitudes físicas: fundamentales/derivadas y escalares/vectoriales', 'Muy baja'],
    ] },
  ];

  /* ---------------- Estado ---------------- */
  const state = { view: 'home', exam: null, exercises: [], result: null, charts: [], timer: null };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------------- Utilidades UI ---------------- */
  function renderMath(el) {
    if (window.renderMathInElement) {
      window.renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false, strict: false });
    }
  }
  let chartLib = null;
  function ensureChart() {
    if (window.Chart) return Promise.resolve();
    if (chartLib) return chartLib;
    chartLib = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    return chartLib;
  }
  function mountCharts(root) {
    const canvases = $$('canvas[data-spec]', root);
    if (!canvases.length) return;
    ensureChart().then(() => {
      canvases.forEach((cv) => {
        if (cv.dataset.mounted) return;
        const [i, field] = cv.dataset.spec.split(':');
        const spec = state.exercises[+i] && state.exercises[+i].ex[field];
        if (spec) { const ch = C.render(spec, cv); if (ch) state.charts.push(ch); cv.dataset.mounted = '1'; }
      });
    }).catch(() => { canvases.forEach((cv) => { cv.replaceWith(Object.assign(document.createElement('p'), { className: 'hint', textContent: 'No se pudo cargar la librería de gráficos (sin conexión).' })); }); });
  }
  function destroyCharts() { state.charts.forEach((c) => { try { c.destroy(); } catch (e) { /* noop */ } }); state.charts = []; }
  function chartHtml(i, field, ex) {
    return ex[field] ? `<div class="my-3 rounded-xl border border-slate-200 bg-white p-2"><canvas data-spec="${i}:${field}" aria-label="gráfico"></canvas></div>` : '';
  }
  function toast(msg) {
    const t = $('#toast'); t.firstElementChild.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._h); t._h = setTimeout(() => { t.style.opacity = '0'; }, 2600);
  }
  function modal({ title, body, confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false }) {
    return new Promise((resolve) => {
      const root = $('#modal-root');
      root.innerHTML = `<div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900-a50 p-4 sm:items-center animate-[fade-up_.2s_ease-out]" role="dialog" aria-modal="true">
        <div class="card w-full max-w-md p-6 animate-pop"><h3 class="text-lg font-bold text-brand">${title}</h3><div class="mt-2 text-sm text-slate-600">${body}</div>
        <div class="mt-5 flex justify-end gap-2"><button class="btn-ghost" data-act="cancel">${cancelText}</button><button class="${danger ? 'btn-danger' : 'btn-primary'}" data-act="ok">${confirmText}</button></div></div></div>`;
      root.onclick = (e) => { const act = e.target.closest('[data-act]'); if (act) { root.innerHTML = ''; resolve(act.dataset.act === 'ok'); } else if (e.target === root.firstElementChild) { root.innerHTML = ''; resolve(false); } };
    });
  }
  function showView(name) {
    state.view = name;
    $('#app').dataset.view = name;
    document.documentElement.classList.toggle('home-fit', name === 'home');
    $('#result-footer').classList.toggle('hidden', name !== 'result');
    $('#header-icons').style.display = name === 'home' ? '' : 'none';
    if (name !== 'home') closeHistoryMenu();
    ['home', 'exam', 'result'].forEach((v) => { const el = $(`#view-${v}`); el.classList.toggle('hidden', v !== name); if (v === name) { el.classList.remove('view'); void el.offsetWidth; el.classList.add('view'); } });
    window.scrollTo(0, 0);
    if (name === 'exam') { fitExam(); requestAnimationFrame(fitExam); } else { $('#exam-nav-root').innerHTML = ''; $('#app').style.paddingBottom = ''; }
  }
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* noop */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* noop */ } },
  };

  /* ---------------- Semillas ---------------- */
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  function newSeed() { let s = ''; const a = new Uint32Array(6); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.random() * 1e9; }); for (let i = 0; i < 6; i++) s += ALPHA[a[i] % ALPHA.length]; return s.slice(0, 3) + '-' + s.slice(3); }
  function normSeed(s) { return (s || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').replace(/^-+|-+$/g, '').slice(0, 16); }

  /* ---------------- Construcción del examen ---------------- */
  function buildExam(seed, config) {
    const level = levelOf(config), M = level === 'primera' ? MATH_SLOTS_1 : MATH_SLOTS;
    const pick = new RNG(seed + '|pick|' + config.subject + (level === 'primera' ? '|1' : ''));
    let slots;
    if (config.subject === 'math') slots = M.map((s, i) => ({ area: 'math', slot: i, pool: s }));
    else if (config.subject === 'fisica') slots = FIS_SLOTS.map((s, i) => ({ area: 'fisica', slot: i, pool: s }));
    else {
      const mi = pick.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5).sort((a, b) => a - b);
      const fi = pick.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 5).sort((a, b) => a - b);
      slots = [...mi.map((i) => ({ area: 'math', slot: i, pool: M[i] })), ...fi.map((i) => ({ area: 'fisica', slot: i, pool: FIS_SLOTS[i] }))];
    }
    const used = new Set();
    return slots.map((s, n) => {
      let gen = pick.pick(s.pool);
      if (used.has(s.area + gen) && s.pool.length > 1) { const alt = s.pool.filter((g) => !used.has(s.area + g)); if (alt.length) gen = pick.pick(alt); }
      used.add(s.area + gen);
      const grng = new RNG(`${seed}|${n}|${gen}`); grng.level = level;
      const ex = GEN[s.area][gen](grng);
      return { n, area: s.area, gen, ex };
    });
  }

  /* ---------------- Respuestas ---------------- */
  function emptyAnswer(item) {
    switch (item.type) {
      case 'number': return '';
      case 'vector': return ['', ''];
      case 'vectorset': return item.answer.map(() => ['', '']);
      case 'set': return { v: new Array(item.slots || 2).fill(''), none: false };
      case 'poly': return new Array(item.degree + 1).fill('');
      case 'choice': return null;
      default: return '';
    }
  }
  function ensureAnswers() {
    const ex = state.exam;
    state.exercises.forEach((e, i) => {
      ex.answers[i] = ex.answers[i] || {};
      e.ex.items.forEach((it) => { if (ex.answers[i][it.key] === undefined) ex.answers[i][it.key] = emptyAnswer(it); });
    });
  }
  function isAnswered(i) {
    const a = state.exam.answers[i]; if (!a) return false;
    return state.exercises[i].ex.items.some((it) => {
      const v = a[it.key];
      if (it.type === 'choice') return v !== null && v !== undefined;
      if (it.type === 'number') return v !== '';
      if (it.type === 'set') return v.none || v.v.some((s) => s !== '');
      return JSON.stringify(v).replace(/[\[\]",]/g, '') !== '';
    });
  }

  /* ---------------- Corrección ---------------- */
  const vecTxt = (v, paren) => paren ? `(${fmt(v[0])} ; ${fmt(v[1])})` : `(${fmt(v[0])} ; ${fmt(v[1])})`;
  function gradeItem(item, val) {
    const num = (s) => parseNumber(s);
    let ok = false, user = '—', correct = '';
    switch (item.type) {
      case 'number': {
        const u = num(val); user = val === '' ? '—' : (Number.isFinite(u) ? fmt(u, 3) : `"${escapeHtml(val)}"`);
        ok = item.check ? Number.isFinite(u) && item.check(u) : closeTo(u, item.answer, item.tol);
        correct = item.answerText || (fmt(item.answer, 3) + (item.unit ? ' ' + item.unit : ''));
        break;
      }
      case 'vector': {
        const u = [num(val[0]), num(val[1])]; user = val.every((s) => s === '') ? '—' : `(${val.map((s) => { const n = num(s); return Number.isFinite(n) ? fmt(n, 3) : '?'; }).join(' ; ')})`;
        ok = item.check ? u.every(Number.isFinite) && item.check(u[0], u[1]) : closeTo(u[0], item.answer[0], item.tol) && closeTo(u[1], item.answer[1], item.tol);
        correct = item.answerText || vecTxt(item.answer, item.paren);
        break;
      }
      case 'vectorset': {
        const us = val.map((v) => [num(v[0]), num(v[1])]).filter((v) => v.every(Number.isFinite));
        user = us.length ? us.map((v) => vecTxt(v)).join(' , ') : '—';
        const rem = item.answer.slice();
        ok = us.length === item.answer.length && us.every((u) => { const k = rem.findIndex((a) => closeTo(u[0], a[0], item.tol) && closeTo(u[1], a[1], item.tol)); if (k < 0) return false; rem.splice(k, 1); return true; });
        correct = item.answer.map((v) => vecTxt(v)).join(' , ');
        break;
      }
      case 'set': {
        const vals = val.v.filter((s) => s !== '').map(num);
        user = val.none ? 'Sin solución' : (vals.length ? vals.map((n) => (Number.isFinite(n) ? fmt(n, 3) : '?')).join(' ; ') : '—');
        ok = item.answer.length === 0 ? (val.none && vals.length === 0) : (!val.none && vals.every(Number.isFinite) && setMatch(vals, item.answer, item.tol));
        correct = item.answer.length ? item.answer.map((n) => fmt(n, 3)).join(' ; ') : 'Sin solución';
        break;
      }
      case 'poly': {
        const coefs = val.map((s) => (s === '' ? 0 : num(s)));
        user = val.every((s) => s === '') ? '—' : `$${texPoly(coefs.map((c) => (Number.isFinite(c) ? c : 0)))}$`;
        const target = new Array(item.degree + 1).fill(0); item.answer.forEach((c, k) => { target[item.degree + 1 - item.answer.length + k] = c; });
        ok = coefs.every(Number.isFinite) && coefs.every((c, k) => closeTo(c, target[k], item.tol !== undefined ? item.tol : 0.011));
        correct = `$${texPoly(item.answer)}$`;
        break;
      }
      case 'choice': {
        user = val === null || val === undefined ? '—' : item.options[val];
        ok = val === item.answer; correct = item.options[item.answer];
        break;
      }
      default: break;
    }
    return { ok, user, correct };
  }
  function gradeExam() {
    const per = state.exercises.map((e, i) => {
      const items = e.ex.items.map((it) => ({ item: it, ...gradeItem(it, state.exam.answers[i][it.key]) }));
      const score = items.reduce((s, r) => s + (r.ok ? 1 : 0), 0) / items.length;
      return { i, items, score };
    });
    const total = per.reduce((s, p) => s + p.score, 0);
    return { per, total, nota: Math.round(total * 10) / 10, aprobado: total >= PASS };
  }

  /* ---------------- Sonido de aviso ---------------- */
  let audioCtx = null;
  /** Los navegadores solo permiten audio tras un gesto del usuario: se "desbloquea" con el primer toque o tecla. */
  function unlockAudio() {
    try {
      if (!audioCtx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) audioCtx = new AC(); }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) { /* sin audio disponible */ }
  }
  /** Pitido corto para avisar que se agotó el tiempo del punto. */
  function beep() {
    try {
      unlockAudio(); if (!audioCtx) return;
      const t0 = audioCtx.currentTime + 0.02;
      [[880, 0], [880, 0.24]].forEach(([freq, off]) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t0 + off);
        g.gain.exponentialRampToValueAtTime(0.3, t0 + off + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + off + 0.18);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(t0 + off); o.stop(t0 + off + 0.2);
      });
    } catch (e) { /* sin audio disponible */ }
  }

  /* ---------------- Temporizador ---------------- */
  function now() { return Date.now(); }
  function timedMode() { return state.exam && state.exam.config.timed ? state.exam.config.mode : 'none'; }
  function globalRemaining() { return EXAM_SECONDS - (now() - state.exam.startedAt) / 1000; }
  function exerciseElapsed(i) { const ex = state.exam; return (ex.used[i] || 0) + (i === ex.idx ? (now() - ex.exStart) / 1000 : 0); }
  function startTimer() { stopTimer(); state.timer = setInterval(tick, 1000); tick(); }
  function stopTimer() { if (state.timer) clearInterval(state.timer); state.timer = null; }
  function tick() {
    const ex = state.exam; if (!ex || state.view !== 'exam') return;
    if (timedMode() === 'none') { renderHeaderStatus(); return; }
    if (globalRemaining() <= 0) { submitExam(true); return; }
    if (ex.phase === 'seq') {
      const rem = LIMITS[timedMode()] - exerciseElapsed(ex.idx);
      if (rem <= 0) { finishExercise(true); return; }
    }
    renderHeaderStatus();
  }
  function renderHeaderStatus() {
    const box = $('#header-status');
    if (state.view !== 'exam' || !state.exam) { box.innerHTML = ''; return; }
    const ex = state.exam, mode = timedMode();
    let html = `<span class="chip bg-brand-light text-brand hidden sm:inline-flex">${SUBJECT_LABEL[ex.config.subject]}</span>`;
    if (mode === 'none') {
      html += `<span class="font-mono text-slate-600" title="Tiempo transcurrido">⏱ ${fmtTime((now() - ex.startedAt) / 1000)}</span>`;
    } else {
      const g = globalRemaining();
      html += `<span class="font-mono font-semibold ${g < 300 ? 'timer-danger px-1' : 'text-slate-700'}" title="Tiempo total restante">⏱ ${fmtTime(g)}</span>`;
      if (ex.phase === 'seq') {
        const r = LIMITS[mode] - exerciseElapsed(ex.idx);
        html += `<span class="font-mono font-bold ${r < 60 ? 'timer-danger px-1' : 'text-brand'}" title="Tiempo del ejercicio">${mode === 'optimo' ? '⏳' : '⛔'} ${fmtTime(r)}</span>`;
      } else if (mode !== 'libre') html += `<span class="chip bg-amber-100 text-amber-800">Revisión</span>`;
    }
    box.innerHTML = html;
    const bar = $('#ex-timebar');
    if (bar && mode !== 'none' && ex.phase === 'seq') { const p = Math.max(0, 1 - exerciseElapsed(ex.idx) / LIMITS[mode]); bar.style.transform = `scaleX(${p})`; bar.classList.toggle('bg-red-500', p < 0.15); bar.classList.toggle('bg-brand', p >= 0.15); }
  }

  /* ---------------- Flujo del examen ---------------- */
  function persistExam() { if (state.exam) ls.set(LS_EXAM, state.exam); }
  function startExam(config, seed) {
    unlockAudio();
    seed = seed || newSeed();
    state.exercises = buildExam(seed, config);
    state.exam = { seed, config, answers: [], idx: 0, phase: config.timed && config.mode !== 'libre' ? 'seq' : 'free', startedAt: now(), exStart: now(), used: new Array(10).fill(0), locked: new Array(10).fill(false), submittedAt: null };
    ensureAnswers();
    persistExam();
    ls.set(LS_CONFIG, config);
    renderExam();
    showView('exam');
    startTimer();
  }
  function resumeExam(saved) {
    state.exam = saved;
    state.exercises = buildExam(saved.seed, saved.config);
    ensureAnswers();
    if (saved.config.timed) {
      // el tiempo siguió corriendo mientras la pestaña estuvo cerrada
      if (saved.phase === 'seq') { const rem = LIMITS[saved.config.mode] - exerciseElapsed(saved.idx); if (rem <= 0) { saved.exStart = now(); saved.used[saved.idx] = LIMITS[saved.config.mode]; } }
      if (globalRemaining() <= 0) { renderExam(); showView('exam'); submitExam(true); return; }
    }
    renderExam(); showView('exam'); startTimer();
  }
  function canVisit(i) {
    const ex = state.exam;
    if (ex.phase === 'free' || ex.phase === 'review') return !ex.locked[i];
    return i === ex.idx;
  }
  function goTo(i, animate = true) {
    const ex = state.exam; if (!canVisit(i) || i < 0 || i >= state.exercises.length) return;
    ex.used[ex.idx] = exerciseElapsed(ex.idx); ex.exStart = now(); ex.idx = i;
    persistExam(); renderExam(animate);
  }
  function finishExercise(auto = false) {
    const ex = state.exam, mode = timedMode();
    ex.used[ex.idx] = exerciseElapsed(ex.idx);
    if (mode === 'maximo') ex.locked[ex.idx] = true;
    if (auto) beep();
    if (auto) toast(mode === 'maximo' ? `Se agotó el tiempo del punto ${ex.idx + 1}.` : `Tiempo óptimo del punto ${ex.idx + 1} agotado. Seguimos con el siguiente.`);
    if (ex.idx < state.exercises.length - 1) { ex.exStart = now(); ex.idx += 1; persistExam(); renderExam(); return; }
    // terminó el recorrido: con tiempo sobrante puede volver a cualquier punto y cambiar resultados antes de entregar
    ex.phase = 'review';
    ex.locked.fill(false);
    const first = state.exercises.findIndex((_, k) => !isAnswered(k));
    ex.idx = first >= 0 ? first : 0; ex.exStart = now(); persistExam(); renderExam();
    toast(`Recorriste los 10 puntos. Tenés ${fmtTime(globalRemaining())} para revisar y cambiar resultados antes de entregar.`);
  }
  async function submitExam(auto = false, msg = 'Tiempo agotado: el examen se entregó automáticamente.') {
    if (!auto) {
      const pending = state.exercises.filter((_, i) => !isAnswered(i)).length;
      const ok = await modal({ title: 'Entregar examen', body: pending ? `Tenés <b>${pending}</b> punto${pending > 1 ? 's' : ''} sin responder. ¿Querés entregar igual?` : 'Se corregirá el examen y verás la nota con las soluciones. ¿Confirmás la entrega?', confirmText: 'Entregar' });
      if (!ok) return;
    }
    stopTimer();
    const ex = state.exam; ex.used[ex.idx] = exerciseElapsed(ex.idx); ex.submittedAt = now();
    state.result = gradeExam();
    const hist = ls.get(LS_HISTORY, []);
    hist.unshift({ date: ex.submittedAt, seed: ex.seed, subject: ex.config.subject, mode: ex.config.timed ? ex.config.mode : 'none', level: levelOf(ex.config), hints: !!ex.config.hints, nota: state.result.nota, aprobado: state.result.aprobado, secs: Math.round((ex.submittedAt - ex.startedAt) / 1000) });
    ls.set(LS_HISTORY, hist.slice(0, 20));
    ls.del(LS_EXAM);
    renderResult();
    showView('result');
    renderHeaderStatus();
    if (auto) toast(msg);
  }

  /* ---------------- Placeholders de ejemplo (formato, no resultado) ---------------- */
  /** Ejemplo de cómo escribir una respuesta numérica; depende del tipo de dato esperado y es estable para cada campo. */
  function exampleFor(item, i, slot = 0, ref) {
    const h = U.hashString(`${i}|${item.key}|${slot}`);
    const label = (item.label || '').toLowerCase();
    const ans = ref !== undefined ? ref : (Array.isArray(item.answer) ? item.answer[slot % item.answer.length] : item.answer);
    const I = [2, 3, 4, 5, 6, 7, 8, 9, 12, 15];
    const int = (o = 0) => I[(h + o) % I.length];
    const positive = /tiempo|instante|per[ií]odo|frecuencia|amplitud|distancia|altura|velocidad|m[oó]dulo|[aá]rea|longitud|per[ií]metro|costo|cantidad|edad|lado|largo|ancho|pulsaci[oó]n|\((s|m|km|h|hz|m\/s)\)/.test(label);
    const negOk = !positive || (Number.isFinite(ans) && ans < 0);
    const minus = negOk && h % 3 === 0 ? '-' : '';
    const sgn = (v) => `${minus}${v}`;
    if (/exponente/.test(label)) return `${negOk ? '-' : ''}${2 + (h % 6)}`;
    if (/mantisa/.test(label)) return `${1 + (h % 8)},${1 + ((h >>> 3) % 9)}`;
    if (/radianes|\brad\b/.test(label)) return ['pi/6', 'pi/4', '2pi/3', '1,57'][h % 4];
    if (/ángulo|grados|θ/.test(label) || item.unit === '°') return ['45', '37,5', '120', '60'][h % 4];
    if (/\b(amplitud|período|frecuencia|pulsación)\b/.test(label) && !Number.isInteger(ans)) return ['0,5', '3,14', '2pi', '1,25'][h % 4];
    if (!Number.isFinite(ans)) return sgn(int());
    if (Math.abs(ans - Math.round(ans)) < 1e-9) return sgn(int(1));
    const f = U.toFraction(ans, 12);
    if (f) { const d = [2, 3, 4, 5, 7][h % 5]; let n = 1 + (int(2) % (2 * d)); while (U.gcd(n, d) !== 1) n += 1; return `${minus}${n}/${d}`; }
    return `${minus}${1 + (h % 9)},${[25, 5, 75, 4][(h >>> 2) % 4]}`;
  }

  /* ---------------- Render: inputs ---------------- */
  const inputBase = (i, key, sub, val, placeholder, extra = '') => `<input type="text" inputmode="text" autocomplete="off" spellcheck="false" class="field font-mono text-center ${extra}" data-i="${i}" data-key="${key}" data-sub="${sub}" value="${escapeHtml(val)}" placeholder="${placeholder}">`;
  function itemHtml(i, item, val, disabled) {
    let body = '';
    switch (item.type) {
      case 'number': body = `<div class="flex items-center gap-2 max-w-xs">${inputBase(i, item.key, '0', val, exampleFor(item, i))}${item.unit ? `<span class="text-sm text-slate-500">${item.unit}</span>` : ''}</div>`; break;
      case 'vector': body = `<div class="flex items-center gap-1 max-w-xs"><span class="text-lg text-slate-500">(</span>${inputBase(i, item.key, '0', val[0], exampleFor(item, i, 0))}<span class="text-lg text-slate-500">;</span>${inputBase(i, item.key, '1', val[1], exampleFor(item, i, 1))}<span class="text-lg text-slate-500">)</span></div>`; break;
      case 'vectorset': body = `<div class="grid gap-2 sm:grid-cols-2">${val.map((v, k) => `<div class="flex items-center gap-1"><span class="w-6 text-xs font-bold text-slate-500">${(item.labels || [])[k] || ''}</span><span class="text-lg text-slate-500">(</span>${inputBase(i, item.key, `${k}.0`, v[0], exampleFor(item, i, 2 * k, item.answer[k % item.answer.length][0]))}<span class="text-lg text-slate-500">;</span>${inputBase(i, item.key, `${k}.1`, v[1], exampleFor(item, i, 2 * k + 1, item.answer[k % item.answer.length][1]))}<span class="text-lg text-slate-500">)</span></div>`).join('')}</div>`; break;
      case 'set': body = `<div class="flex flex-wrap items-center gap-3">${val.v.map((v, k) => `<label class="flex items-center gap-1 text-xs font-bold text-slate-500">${(item.labels || [])[k] || `x${k + 1}`}${inputBase(i, item.key, `v.${k}`, v, exampleFor(item, i, k, item.answer.length ? item.answer[k % item.answer.length] : 3), 'w-32')}</label>`).join('')}
        ${item.allowEmpty ? `<label class="flex items-center gap-1.5 text-xs text-slate-600"><input type="checkbox" class="accent-brand" data-i="${i}" data-key="${item.key}" data-sub="none" ${val.none ? 'checked' : ''}> Sin solución</label>` : ''}</div>
        <p class="hint">Dejá vacíos los campos que no uses. El orden no importa.</p>`; break;
      case 'poly': body = `<div class="flex flex-wrap items-center gap-1">${val.map((v, k) => { const p = item.degree - k; return `<span class="flex items-center gap-1">${inputBase(i, item.key, String(k), v, exampleFor(item, i, k, 2), 'w-20')}<span class="text-sm text-slate-600">${p === 0 ? '' : p === 1 ? (item.variable || 'x') : `${item.variable || 'x'}<sup>${p}</sup>`}${k < val.length - 1 ? ' +' : ''}</span></span>`; }).join('')}</div><p class="hint">Completá con 0 los términos que falten.</p>`; break;
      case 'choice': body = `<div class="grid gap-2 sm:grid-cols-2">${item.options.map((o, k) => `<label class="option !p-3 text-sm"><input type="radio" name="c-${i}-${item.key}" class="mt-0.5 accent-brand" data-i="${i}" data-key="${item.key}" data-sub="choice" value="${k}" ${val === k ? 'checked' : ''} ${disabled ? 'disabled' : ''}><span>${o}</span></label>`).join('')}</div>`; break;
      default: break;
    }
    return `<div class="rounded-xl bg-slate-50 p-3 sm:p-4"><p class="mb-2 text-sm font-semibold text-slate-700">${item.label}</p>${body}</div>`;
  }

  /* ---------------- Render: examen ---------------- */
  function renderExam(animate = true) {
    const ex = state.exam, i = ex.idx, e = state.exercises[i], mode = timedMode();
    const locked = ex.locked[i];
    const disabled = locked;
    destroyCharts();
    const dots = state.exercises.map((s, k) => {
      let cls = 'dot-idle';
      if (ex.locked[k]) cls = 'dot-locked'; else if (k === i) cls = 'dot-active'; else if (isAnswered(k)) cls = 'dot-done';
      return `<button type="button" class="dot shrink-0 ${cls}" data-goto="${k}" ${canVisit(k) ? '' : 'disabled aria-disabled="true"'} title="Punto ${k + 1}${s.area === 'math' ? ' · Precálculo' : ' · Física'}">${k + 1}</button>`;
    }).join('');
    const seqTimed = mode !== 'none' && ex.phase === 'seq';
    const next = i < state.exercises.length - 1;
    const primaryLabel = seqTimed ? (mode === 'maximo' ? (next ? 'Entregar punto y seguir' : 'Terminar recorrido') : (next ? 'Siguiente punto' : 'Terminar recorrido')) : (next ? 'Siguiente' : null);
    const helpTxt = mode === 'none' ? 'Navegación libre. Podés volver a cualquier punto antes de entregar.' : mode === 'libre' ? 'Tiempo total de 2 h, sin límite por ejercicio. Navegá libremente y entregá antes de que se agote el reloj.' : ex.phase === 'seq' ? (mode === 'optimo' ? 'Tiempo óptimo: 8 min por punto. Al vencer pasa al siguiente; al final podés completar lo que falte con el tiempo restante.' : 'Tiempo máximo: 10 min por punto. Al vencer o entregar pasa al siguiente; al final, si te sobra tiempo, podés volver a cualquier punto.') : 'Fase de revisión: navegá libremente y entregá antes de que se agote el tiempo total.';
    $('#view-exam').innerHTML = `<div id="exam-shell" class="flex flex-col">
      <div class="mb-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="-mx-2 flex shrink-0 items-center gap-2 overflow-x-auto px-2 py-1.5 [scrollbar-width:none]" id="dots">${dots}</div>
        <div class="flex min-w-0 items-center gap-2 text-xs text-slate-500"><span class="chip bg-slate-200 text-slate-700 font-mono whitespace-nowrap shrink-0">Tema ${ex.seed}</span><span class="hidden max-w-sm truncate text-[11px] leading-tight lg:inline" title="${escapeHtml(helpTxt)}">${helpTxt}</span></div>
      </div>
      <article class="card flex min-h-0 flex-1 flex-col overflow-hidden ${animate ? 'animate-fade-up' : ''}" id="exercise-card">
        <div class="shrink-0 border-b border-slate-100 bg-white px-5 pb-3 pt-4 sm:px-8">
          <div class="flex flex-wrap items-center gap-2">
            <span class="chip ${e.area === 'math' ? 'bg-brand-light text-brand' : 'bg-cyan-100 text-cyan-900'}">${e.area === 'math' ? 'Precálculo' : 'Física'}</span>
            <span class="chip bg-slate-100 text-slate-600">${escapeHtml(e.ex.topic)}</span>
            <span class="ml-auto text-xs font-semibold text-slate-400">1 punto</span>
          </div>
          <h2 class="mt-2 text-xl font-bold text-brand sm:text-2xl">Ejercicio ${i + 1}<span class="font-normal text-slate-500"> · ${escapeHtml(e.ex.title)}</span></h2>
        </div>
        <div id="ex-scroll" class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-10 sm:p-8 sm:pb-12">
          ${ex.config.hints && e.ex.hint ? `<details class="prose-hint" ${ex.config.hints ? 'open' : ''}><summary class="cursor-pointer font-semibold">💡 Ayuda para empezar</summary><p class="mt-1">${escapeHtml(e.ex.hint)}</p></details>` : ''}
          <div class="statement mt-3 text-[15px] sm:text-base">${e.ex.statement}</div>
          ${e.ex.figure ? `<div class="mt-2">${e.ex.figure}</div>` : ''}
          ${chartHtml(i, 'qchart', e.ex)}
          <div class="mt-6 border-t border-slate-200 pt-5">
            <h3 class="text-sm font-bold uppercase tracking-wide text-slate-500">Resultados ${locked ? '<span class="chip bg-slate-200 text-slate-600 ml-2">Punto cerrado</span>' : ''}</h3>
            <fieldset class="mt-3 grid gap-3 ${disabled ? 'opacity-60' : ''}" ${disabled ? 'disabled' : ''}>${e.ex.items.map((it) => itemHtml(i, it, ex.answers[i][it.key], disabled)).join('')}</fieldset>
          </div>
        </div>
      </article></div>`;
    $('#exam-nav-root').innerHTML = `<nav id="exam-nav" class="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white-a95 backdrop-blur">${mode !== 'none' && ex.phase === 'seq' ? '<div class="h-1.5 w-full shrink-0 bg-slate-200"><div id="ex-timebar" class="h-full w-full origin-left bg-brand transition-transform duration-1000 ease-linear"></div></div>' : ''}<div class="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
        ${!seqTimed ? `<button type="button" class="btn-secondary" data-nav="prev" ${i === 0 ? 'disabled' : ''}>← Anterior</button>` : ''}
        <span class="mx-auto text-xs text-slate-500">${i + 1} / ${state.exercises.length}</span>
        ${primaryLabel ? `<button type="button" class="btn-primary" data-nav="next">${primaryLabel} →</button>` : ''}
        <button type="button" class="${primaryLabel ? 'btn-secondary' : 'btn-primary'}" data-nav="submit">Entregar examen</button>
      </div></nav>`;
    renderMath($('#exercise-card'));
    mountCharts($('#exercise-card'));
    renderHeaderStatus();
    window.scrollTo(0, 0);
    fitExam();
    if (!disabled) { const first = $('#exercise-card input.field'); if (first && window.matchMedia('(min-width: 640px)').matches) first.focus({ preventScroll: true }); }
  }

  /** El ejercicio ocupa exactamente el alto visible (también en móvil): los números de punto y el título "Ejercicio N" quedan fijos,
   *  solo scrollea el enunciado/resultados por dentro y la botonera queda fija abajo. */
  function fitExam() {
    const shell = $('#exam-shell'), nav = $('#exam-nav'), app = $('#app');
    if (!shell || !nav || state.view !== 'exam' || $('#view-exam').classList.contains('hidden')) return;
    app.style.paddingBottom = '';
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Posición del shell respecto del documento (independiente del scroll en curso y de las animaciones con transform)
    let top = 0; for (let el = shell; el; el = el.offsetParent) top += el.offsetTop;
    const h = nav.getBoundingClientRect().top - top - 10;
    shell.style.height = `${Math.max(h, 320)}px`;
  }

  /* ---------------- Render: resultados ---------------- */
  function renderResult() {
    const ex = state.exam, r = state.result;
    destroyCharts();
    const secs = Math.round((ex.submittedAt - ex.startedAt) / 1000);
    const mathScore = r.per.filter((p) => state.exercises[p.i].area === 'math').reduce((s, p) => s + p.score, 0);
    const fisScore = r.per.filter((p) => state.exercises[p.i].area === 'fisica').reduce((s, p) => s + p.score, 0);
    const nMath = state.exercises.filter((e) => e.area === 'math').length, nFis = state.exercises.length - nMath;
    const cards = r.per.map((p) => {
      const e = state.exercises[p.i];
      const cls = p.score === 1 ? 'dot-ok' : p.score > 0 ? 'dot-partial' : 'dot-bad';
      return `<article class="card overflow-hidden" id="res-${p.i}">
        <div class="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50-a60 px-5 py-3 sm:px-6">
          <span class="dot ${cls} cursor-default">${p.i + 1}</span>
          <div><p class="font-bold text-brand">${escapeHtml(e.ex.title)}</p><p class="text-xs text-slate-500">${e.area === 'math' ? 'Precálculo' : 'Física'} · ${escapeHtml(e.ex.topic)} · tiempo ${fmtTime(ex.used[p.i] || 0)}</p></div>
          <span class="ml-auto font-mono text-sm font-bold ${p.score === 1 ? 'text-emerald-600' : p.score > 0 ? 'text-amber-600' : 'text-red-600'}">${fmt(p.score, 2)} / 1</span>
        </div>
        <div class="p-5 sm:p-6">
          <details class="group statement-details"><summary class="cursor-pointer text-sm font-semibold text-slate-600 hover:text-brand">Ver enunciado</summary><div class="statement mt-2 text-sm">${e.ex.statement}${e.ex.figure ? e.ex.figure : ''}</div></details>
          <div class="mt-4 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-xs uppercase tracking-wide text-slate-500"><th class="py-1 pr-2">Ítem</th><th class="py-1 pr-2">Tu respuesta</th><th class="py-1 pr-2">Correcto</th><th class="py-1"></th></tr></thead><tbody>
            ${p.items.map((it) => `<tr class="border-t border-slate-100"><td class="py-1.5 pr-2 text-slate-700">${it.item.label}</td><td class="py-1.5 pr-2 font-mono ${it.ok ? 'text-emerald-700' : 'text-red-700'}">${it.user}</td><td class="py-1.5 pr-2 font-mono">${it.correct}</td><td class="py-1.5 text-center">${it.ok ? '✅' : '❌'}</td></tr>`).join('')}
          </tbody></table></div>
          <details class="mt-4 rounded-xl border border-brand-a20 bg-brand-light-a50 p-4" open><summary class="cursor-pointer font-semibold text-brand">Solución paso a paso</summary>
            <div class="solution mt-2 text-sm">${e.ex.solution}${e.ex.figure2 ? e.ex.figure2 : ''}${chartHtml(p.i, 'qchart', e.ex)}${chartHtml(p.i, 'chart', e.ex)}${chartHtml(p.i, 'chart2', e.ex)}</div></details>
        </div></article>`;
    }).join('');
    $('#view-result').innerHTML = `
      <div id="result-print" class="space-y-5">
        <section class="card p-6 sm:p-8 ${r.aprobado ? 'border-emerald-300' : 'border-red-300'}">
          <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div class="flex items-center gap-4">
              <img src="assets/logo.png?v=2" alt="UTN Haedo" class="h-16 w-auto" decoding="async">
              <div><p class="text-xs font-bold uppercase tracking-wide text-slate-500">Ejercitación para finales UTN</p><h2 class="text-2xl font-extrabold text-brand">Resultado del examen</h2>
              <p class="text-sm text-slate-600">${SUBJECT_LABEL[ex.config.subject]} · ${LEVEL_LABEL[levelOf(ex.config)]} · ${MODE_LABEL[ex.config.timed ? ex.config.mode : 'none']} · Tema <span class="font-mono">${ex.seed}</span> · ${new Date(ex.submittedAt).toLocaleString('es-AR')}</p></div>
            </div>
            <div class="sm:ml-auto flex items-center gap-3 sm:gap-5 max-sm:w-full">
              <div class="text-center"><p class="text-5xl font-black ${r.aprobado ? 'text-emerald-600' : 'text-red-600'} animate-pop">${fmt(r.nota, 1)}</p><p class="text-xs text-slate-500">nota / 10</p></div>
              <div class="min-w-0"><span class="chip ${r.aprobado ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} text-sm px-3 py-1 max-sm:px-2 max-sm:text-xs">${r.aprobado ? 'APROBADO' : 'DESAPROBADO'}</span><p class="mt-1 text-xs text-slate-500">Se aprueba con 70% (7)</p></div>
              <button type="button" class="btn-secondary no-print ml-auto max-w-[4.75rem] shrink-0 !px-2 !py-1.5 text-center text-[11px] leading-tight sm:hidden" data-act="retry">↻ Repetir este tema</button>
            </div>
          </div>
          <div class="mt-6 grid gap-3 sm:grid-cols-4 text-sm">
            <div class="rounded-xl bg-slate-50 p-3"><p class="text-xs text-slate-500">Tiempo empleado</p><p class="font-mono font-bold">${fmtTime(secs)}</p></div>
            <div class="rounded-xl bg-slate-50 p-3"><p class="text-xs text-slate-500">Puntos correctos</p><p class="font-bold">${r.per.filter((p) => p.score === 1).length} completos · ${r.per.filter((p) => p.score > 0 && p.score < 1).length} parciales</p></div>
            ${nMath ? `<div class="rounded-xl bg-slate-50 p-3"><p class="text-xs text-slate-500">Precálculo</p><p class="font-bold">${fmt(mathScore, 1)} / ${nMath}</p></div>` : ''}
            ${nFis ? `<div class="rounded-xl bg-slate-50 p-3"><p class="text-xs text-slate-500">Física</p><p class="font-bold">${fmt(fisScore, 1)} / ${nFis}</p></div>` : ''}
          </div>
          <div class="mt-4 flex flex-wrap gap-1.5">${r.per.map((p) => `<a href="#res-${p.i}" class="dot ${p.score === 1 ? 'dot-ok' : p.score > 0 ? 'dot-partial' : 'dot-bad'}" title="${escapeHtml(state.exercises[p.i].ex.title)}">${p.i + 1}</a>`).join('')}</div>
          <div class="mt-6 flex flex-wrap gap-2 no-print">
            <button type="button" class="btn-primary" data-act="pdf">⬇ Descargar PDF</button>
            <button type="button" class="btn-secondary max-sm:hidden" data-act="retry">↻ Repetir este tema</button>
          </div>
        </section>
        ${cards}
      </div>`;
    renderMath($('#view-result'));
    mountCharts($('#view-result'));
  }

  /* ---------------- PDF ---------------- */
  let pdfLib = null;
  function ensurePdf() {
    if (window.html2pdf) return Promise.resolve();
    if (pdfLib) return pdfLib;
    pdfLib = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    return pdfLib;
  }
  /** html2canvas no entiende oklch/oklab/color-mix (Tailwind v4): convertimos a rgb con un canvas */
  const COLOR_PROPS = ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'textDecorationColor', 'fill', 'stroke'];
  function normalizeColors(origRoot, cloneRoot) {
    const ctx = document.createElement('canvas').getContext('2d');
    const conv = (c) => { ctx.fillStyle = '#000'; ctx.fillStyle = c; return ctx.fillStyle; };
    const isModern = (c) => /oklch|oklab|color-mix|color\(|lab\(|lch\(/.test(c);
    const o = origRoot === document.body ? [document.documentElement, document.body] : [origRoot, ...origRoot.querySelectorAll('*')];
    const k = cloneRoot === cloneRoot.ownerDocument.body ? [cloneRoot.ownerDocument.documentElement, cloneRoot] : [cloneRoot, ...cloneRoot.querySelectorAll('*')];
    for (let i = 0; i < o.length && i < k.length; i++) {
      const cs = getComputedStyle(o[i]);
      COLOR_PROPS.forEach((p) => { const v = cs[p]; if (v && isModern(v)) { try { k[i].style[p] = conv(v); } catch (e) { /* noop */ } } });
      if (cs.boxShadow && isModern(cs.boxShadow)) k[i].style.boxShadow = 'none';
      if (cs.backgroundImage && isModern(cs.backgroundImage)) k[i].style.backgroundImage = 'none';
    }
  }
  async function downloadPdf(btn) {
    const el = $('#result-print');
    btn.disabled = true; const old = btn.textContent; btn.textContent = 'Generando PDF…';
    $$('details', el).forEach((d) => { d.open = true; });
    document.documentElement.classList.add('pdf-mode');
    window.scrollTo(0, 0);
    try {
      await ensurePdf();
      const name = `Final_UTN_${SUBJECT_LABEL[state.exam.config.subject].replace(/[^A-Za-z]/g, '')}_${state.exam.seed}.pdf`;
      await window.html2pdf().set({ margin: [8, 8, 10, 8], filename: name, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 1.5, useCORS: true, logging: false, scrollX: 0, scrollY: 0, onclone: (doc) => { normalizeColors(el, doc.querySelector('#result-print')); normalizeColors(document.body, doc.body); } }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.katex-display', 'canvas', 'svg'] } }).from(el).save();
      toast('PDF generado.');
    } catch (e) {
      toast('No se pudo generar el PDF automáticamente; se abre el diálogo de impresión.');
      window.print();
    } finally { document.documentElement.classList.remove('pdf-mode'); btn.disabled = false; btn.textContent = old; }
  }

  /* ---------------- Render: inicio ---------------- */
  function renderHome() {
    const hist = ls.get(LS_HISTORY, []);
    const saved = ls.get(LS_EXAM, null);
    let html = '<h2 class="font-bold text-brand">Tus intentos</h2>';
    if (saved) html += `<div class="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm"><p class="font-semibold text-amber-900">Tenés un examen en curso (tema ${saved.seed}).</p><div class="mt-2 flex gap-2"><button type="button" class="btn-primary !py-1.5" data-act="resume">Continuar</button><button type="button" class="btn-ghost !py-1.5" data-act="discard">Descartar</button></div></div>`;
    if (!hist.length) html += '<p class="mt-2 text-sm text-slate-500">Todavía no rendiste ningún simulacro. Tus notas quedarán guardadas en este dispositivo.</p>';
    else {
      const avg = hist.reduce((s, h) => s + h.nota, 0) / hist.length;
      html += `<p class="mt-1 text-xs text-slate-500">${hist.length} intento${hist.length > 1 ? 's' : ''} · promedio ${fmt(avg, 1)} · aprobados ${hist.filter((h) => h.aprobado).length}</p><ul class="mt-3 divide-y divide-slate-100">`;
      hist.slice(0, 8).forEach((h) => {
        html += `<li class="flex items-center gap-3 py-2 text-sm"><span class="font-mono text-lg font-black ${h.aprobado ? 'text-emerald-600' : 'text-red-600'}">${fmt(h.nota, 1)}</span><div class="min-w-0 flex-1"><p class="truncate font-semibold text-slate-700">${SUBJECT_LABEL[h.subject]}</p><p class="truncate text-xs text-slate-500">${new Date(h.date).toLocaleDateString('es-AR')} · ${LEVEL_LABEL[h.level || 'recuperatorio']} · ${MODE_LABEL[h.mode]} · ${fmtTime(h.secs)}</p></div><button type="button" class="btn-ghost !px-2 !py-1 text-xs" data-retry="${h.seed}" data-subject="${h.subject}" title="Repetir este tema con el nivel, el tiempo y las ayudas elegidas">↻ Repetir ${h.seed}</button></li>`;
      });
      html += '</ul>';
    }
    $('#history-card').innerHTML = html;
    $('#history-menu').innerHTML = html;
    const badge = $('#history-badge'), n = hist.length + (saved ? 1 : 0);
    badge.textContent = saved ? '!' : String(hist.length); badge.classList.toggle('hidden', n === 0);
    const fq = { 'Muy alta': 'bg-brand text-white', Alta: 'bg-brand-light text-brand', Media: 'bg-slate-200 text-slate-700', Baja: 'bg-slate-100 text-slate-500', 'Muy baja': 'bg-slate-100 text-slate-500' };
    $('#topics-box').innerHTML = TOPICS.map((t) => `<details class="mt-2 rounded-xl border border-slate-200 p-3" open><summary class="cursor-pointer text-sm font-semibold text-slate-700">${t.area}</summary><ul class="mt-2 space-y-1.5">${t.items.map(([n, f]) => `<li class="flex items-start gap-2 text-xs"><span class="chip ${fq[f]} shrink-0 whitespace-nowrap min-w-16 justify-center" title="${f === 'Muy baja' ? 'Tema de la guía de la cátedra, poco frecuente en los finales anteriores. Frecuencia: Muy baja' : 'Frecuencia en los finales: ' + f}">${f}</span><span class="text-slate-600">${n}</span></li>`).join('')}</ul></details>`).join('');
    const cfg = ls.get(LS_CONFIG, null);
    if (cfg) {
      const f = $('#config-form');
      (f.elements.subject.value = cfg.subject);
      f.elements.level.value = cfg.level || 'primera';
      f.elements.timed.value = cfg.timed ? 'yes' : 'no';
      if (cfg.mode) f.elements.mode.value = cfg.mode;
      f.elements.hints.checked = false; // las ayudas siempre arrancan desactivadas
      syncModeBox();
    }
  }
  function syncModeBox() {
    const f = $('#config-form'), on = f.elements.timed.value === 'yes'; const b = $('#mode-box'); b.classList.toggle('opacity-40', !on); b.classList.toggle('pointer-events-none', !on);
    // selects de la versión mobile (reflejan los radios)
    $('#timed-select').value = on ? 'yes' : 'no';
    $('#mode-select').value = f.elements.mode.value;
    $('#mode-select-wrap').classList.toggle('hidden', !on);
    $('#mode-select-desc').textContent = { optimo: 'Al vencer pasa al siguiente. Al terminar los 10 puntos, completás lo que falte con el tiempo restante.', maximo: 'Cada punto pasa al siguiente al vencer o entregarlo. Al final, con el tiempo sobrante, podés volver a cualquier punto.', libre: 'Solo corre el reloj de las 2 horas. Navegás libremente entre los puntos.' }[f.elements.mode.value];
  }
  function setRadio(name, value) { const r = $(`#config-form input[name="${name}"][value="${value}"]`); if (r) r.checked = true; syncModeBox(); }
  function closeHistoryMenu() { $('#history-menu').classList.add('hidden'); $('#btn-history').setAttribute('aria-expanded', 'false'); }
  function openTopics() {
    const tmp = document.createElement('div'); tmp.innerHTML = $('#topics-card').innerHTML;
    const h = tmp.querySelector('h2'); if (h) h.remove();
    $('#topics-modal-body').innerHTML = tmp.innerHTML;
    const m = $('#topics-modal'); m.classList.remove('hidden'); m.classList.add('flex'); document.body.classList.add('overflow-hidden');
    $('#topics-modal-body').scrollTop = 0; $('#topics-close').focus();
  }
  function closeTopics() { const m = $('#topics-modal'); m.classList.add('hidden'); m.classList.remove('flex'); document.body.classList.remove('overflow-hidden'); $('#btn-topics').focus(); }
  function readConfig() {
    const f = $('#config-form');
    return { subject: f.elements.subject.value, level: f.elements.level.value, timed: f.elements.timed.value === 'yes', mode: f.elements.mode.value, hints: f.elements.hints.checked };
  }

  /* ---------------- Eventos ---------------- */
  function bind() {
    const form = $('#config-form');
    form.addEventListener('change', (e) => { if (e.target.name === 'timed') syncModeBox(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      launch(readConfig(), null);
    });
    /** inicia un examen (nuevo o repetido) confirmando si hay uno en curso */
    function launch(cfg, seed) {
      if (ls.get(LS_EXAM, null)) { modal({ title: 'Examen en curso', body: 'Hay un examen sin entregar guardado. Si empezás uno nuevo se descarta. ¿Continuar?', confirmText: 'Empezar nuevo', danger: true }).then((ok) => { if (ok) { ls.del(LS_EXAM); startExam(cfg, seed); } }); return; }
      startExam(cfg, seed);
    }
    $('#timed-select').addEventListener('change', (e) => { setRadio('timed', e.target.value); });
    $('#mode-select').addEventListener('change', (e) => { setRadio('mode', e.target.value); });
    $('#btn-history').addEventListener('click', (e) => { e.stopPropagation(); const m = $('#history-menu'); const open = m.classList.toggle('hidden') === false; $('#btn-history').setAttribute('aria-expanded', String(open)); });
    document.addEventListener('click', (e) => { if (!e.target.closest('#history-menu') && !e.target.closest('#btn-history')) closeHistoryMenu(); });
    $('#btn-topics').addEventListener('click', openTopics);
    $('#topics-close').addEventListener('click', closeTopics);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeTopics(); closeHistoryMenu(); } });
    const onHistoryClick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.act || b.dataset.retry) closeHistoryMenu();
      if (b.dataset.act === 'resume') { const saved = ls.get(LS_EXAM, null); if (saved) resumeExam(saved); }
      else if (b.dataset.act === 'discard') { modal({ title: 'Descartar examen', body: 'Se perderán las respuestas cargadas.', confirmText: 'Descartar', danger: true }).then((ok) => { if (ok) { ls.del(LS_EXAM); renderHome(); } }); }
      else if (b.dataset.retry) { launch({ ...readConfig(), subject: b.dataset.subject }, normSeed(b.dataset.retry)); toast(`Repetís el tema ${b.dataset.retry} con el nivel, el tiempo y las ayudas actuales.`); }
    };
    $('#history-card').addEventListener('click', onHistoryClick);
    $('#history-menu').addEventListener('click', onHistoryClick);
    $('#brand').addEventListener('click', async (e) => {
      e.preventDefault();
      if (state.view === 'exam') { const ok = await modal({ title: 'Salir del examen', body: 'El examen queda guardado y podés continuarlo desde el inicio (el tiempo sigue corriendo si es cronometrado).', confirmText: 'Ir al inicio' }); if (!ok) return; stopTimer(); }
      renderHome(); showView('home'); renderHeaderStatus();
    });

    const examView = $('#view-exam');
    examView.addEventListener('input', (e) => {
      const t = e.target; if (!t.dataset.key) return;
      const a = state.exam.answers[+t.dataset.i], key = t.dataset.key, sub = t.dataset.sub;
      if (sub === '0' && typeof a[key] === 'string') a[key] = t.value;
      else if (sub === 'choice') a[key] = +t.value;
      else if (sub === 'none') a[key].none = t.checked;
      else if (sub.startsWith('v.')) a[key].v[+sub.slice(2)] = t.value;
      else if (sub.includes('.')) { const [p, q] = sub.split('.'); a[key][+p][+q] = t.value; }
      else a[key][+sub] = t.value;
      clearTimeout(state._save); state._save = setTimeout(persistExam, 300);
      const dot = $(`#dots [data-goto="${state.exam.idx}"]`); if (dot && !dot.classList.contains('dot-active')) { /* noop */ }
    });
    examView.addEventListener('change', (e) => { if (e.target.type === 'radio' || e.target.type === 'checkbox') examView.dispatchEvent(new Event('input', { bubbles: false })); });
    const onExamClick = (e) => {
      const g = e.target.closest('[data-goto]'); if (g && !g.disabled) { goTo(+g.dataset.goto); return; }
      const n = e.target.closest('[data-nav]'); if (!n) return;
      const ex = state.exam;
      if (n.dataset.nav === 'prev') goTo(ex.idx - 1);
      else if (n.dataset.nav === 'next') { if (timedMode() !== 'none' && ex.phase === 'seq') finishExercise(false); else goTo(ex.idx + 1); }
      else if (n.dataset.nav === 'submit') submitExam(false);
    };
    examView.addEventListener('click', onExamClick);
    $('#exam-nav-root').addEventListener('click', onExamClick);
    examView.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input.field')) { e.preventDefault(); const inputs = $$('input.field', examView); const k = inputs.indexOf(e.target); if (k >= 0 && k < inputs.length - 1) inputs[k + 1].focus(); } });

    const onResultClick = (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (b.dataset.act === 'pdf') downloadPdf(b);
      else if (b.dataset.act === 'retry') startExam(state.exam.config, state.exam.seed);
      else if (b.dataset.act === 'new') startExam(state.exam.config, null);
      else if (b.dataset.act === 'home') { renderHome(); showView('home'); }
    };
    $('#view-result').addEventListener('click', onResultClick);
    $('#result-footer').addEventListener('click', onResultClick);
    ['pointerdown', 'keydown'].forEach((t) => document.addEventListener(t, unlockAudio, { passive: true }));
    window.addEventListener('resize', () => { clearTimeout(state._fit); state._fit = setTimeout(fitExam, 80); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden && state.view === 'exam') tick(); });
    window.addEventListener('beforeunload', () => { if (state.exam && state.view === 'exam') { state.exam.used[state.exam.idx] = exerciseElapsed(state.exam.idx); state.exam.exStart = now(); persistExam(); } });
  }

  /* ---------------- Init ---------------- */
  function init() {
    bind();
    renderHome();
    document.documentElement.classList.add('home-fit');
    const saved = ls.get(LS_EXAM, null);
    if (saved && saved.config) {
      // ofrecer continuar desde la tarjeta de historial; si el examen es cronometrado lo retomamos directo
      if (saved.config.timed) resumeExam(saved);
    }
  }
  window.UTNApp = { state, gradeExam, buildExam };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
