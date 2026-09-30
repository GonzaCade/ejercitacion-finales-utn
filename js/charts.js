/* ==========================================================================
   charts.js — especificaciones de gráficos (Chart.js, cargado bajo demanda)
   y figuras SVG livianas (vectores, esquemas de situación).
   ========================================================================== */
(function (global) {
  'use strict';
  const { fmt, round } = global.U;
  const C = global.C = {};
  const ACCENT = '#00455C';

  C.sample = function (f, a, b, n = 60) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const x = a + (b - a) * i / n; const y = f(x); if (Number.isFinite(y)) pts.push({ x: round(x, 4), y: round(y, 4) }); }
    return pts;
  };

  /** series: [{label, f, color, dashed}] → spec */
  C.linesChart = function (series, opts = {}) {
    const xMin = opts.xMin ?? -5, xMax = opts.xMax ?? 5;
    return {
      kind: 'chart',
      series: series.map((s) => ({ label: s.label, color: s.color || ACCENT, dashed: !!s.dashed, data: C.sample(s.f, xMin, xMax, opts.n || 60) })),
      points: opts.points || [], xLabel: opts.xLabel || 'x', yLabel: opts.yLabel || 'y', xMin, xMax,
    };
  };
  C.pointsChart = function (pts, opts = {}) {
    return { kind: 'chart', series: [{ label: 'f(x)', color: ACCENT, data: pts, showPoints: true }], points: [], xLabel: opts.xLabel || 'x', yLabel: opts.yLabel || 'y', xMin: pts[0].x, xMax: pts[pts.length - 1].x };
  };

  /** Renderiza un spec en un canvas (requiere window.Chart). Devuelve la instancia. */
  C.render = function (spec, canvas) {
    if (!global.Chart || !spec || spec.kind !== 'chart') return null;
    const datasets = spec.series.map((s) => ({
      label: s.label, data: s.data, borderColor: s.color, backgroundColor: s.color, borderWidth: 2, pointRadius: s.showPoints ? 3 : 0, pointHoverRadius: 4,
      borderDash: s.dashed ? [6, 4] : [], showLine: true, tension: 0, fill: false, parsing: false,
    }));
    if (spec.points && spec.points.length) {
      datasets.push({ label: 'Puntos', data: spec.points.map((p) => ({ x: round(p.x, 3), y: round(p.y, 3) })), borderColor: '#dc2626', backgroundColor: '#dc2626', pointRadius: 5, pointStyle: 'circle', showLine: false, parsing: false });
    }
    const allY = spec.series.flatMap((s) => s.data.map((p) => p.y)).concat((spec.points || []).map((p) => p.y));
    const yMin = Math.min(...allY), yMax = Math.max(...allY);
    const pad = (yMax - yMin) * 0.08 || 1;
    return new global.Chart(canvas, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true, maintainAspectRatio: true, aspectRatio: 1.6, animation: { duration: 500 },
        interaction: { mode: 'nearest', intersect: false },
        plugins: {
          legend: { display: spec.series.length > 1 || (spec.points && spec.points.length > 0), labels: { boxWidth: 14, font: { size: 11 } } },
          tooltip: { callbacks: { label: (c) => `${c.dataset.label}: (${fmt(c.parsed.x)} ; ${fmt(c.parsed.y)})` } },
        },
        scales: {
          x: { type: 'linear', min: spec.xMin, max: spec.xMax, title: { display: true, text: spec.xLabel }, grid: { color: (ctx) => (ctx.tick && ctx.tick.value === 0 ? '#334155' : '#e2e8f0'), lineWidth: (ctx) => (ctx.tick && ctx.tick.value === 0 ? 2 : 1) } },
          y: { type: 'linear', min: Math.floor(yMin - pad), max: Math.ceil(yMax + pad), title: { display: true, text: spec.yLabel }, grid: { color: (ctx) => (ctx.tick && ctx.tick.value === 0 ? '#334155' : '#e2e8f0'), lineWidth: (ctx) => (ctx.tick && ctx.tick.value === 0 ? 2 : 1) } },
        },
      },
    });
  };

  /* ---------- SVG helpers ---------- */
  const svgWrap = (w, h, inner, cls = '') => `<svg class="figure ${cls}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
  const arrowDefs = (id, color) => `<defs><marker id="${id}" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z" fill="${color}"/></marker></defs>`;
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  /** vectores desde el origen: [{x,y,label,color}] */
  C.vectorsSVG = function (vectors) {
    const W = 320, H = 260, cx = W / 2, cy = H / 2;
    const maxv = Math.max(1, ...vectors.flatMap((v) => [Math.abs(v.x), Math.abs(v.y)]));
    const scale = (Math.min(W, H) / 2 - 24) / maxv;
    let inner = '';
    const ids = [];
    vectors.forEach((v, i) => { ids.push(`ar${i}`); inner += arrowDefs(`ar${i}`, v.color || ACCENT); });
    inner += `<line x1="8" y1="${cy}" x2="${W - 8}" y2="${cy}" stroke="#94a3b8" stroke-width="1"/><line x1="${cx}" y1="8" x2="${cx}" y2="${H - 8}" stroke="#94a3b8" stroke-width="1"/>`;
    // grid ticks
    const step = maxv > 6 ? Math.ceil(maxv / 6) : 1;
    for (let k = -Math.floor(maxv); k <= Math.floor(maxv); k += step) {
      if (k === 0) continue;
      inner += `<line x1="${cx + k * scale}" y1="${cy - 3}" x2="${cx + k * scale}" y2="${cy + 3}" stroke="#64748b"/><line x1="${cx - 3}" y1="${cy - k * scale}" x2="${cx + 3}" y2="${cy - k * scale}" stroke="#64748b"/>`;
    }
    vectors.forEach((v, i) => {
      const x2 = cx + v.x * scale, y2 = cy - v.y * scale;
      inner += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${v.color || ACCENT}" stroke-width="2.5" marker-end="url(#${ids[i]})"/>`;
      inner += `<text x="${x2 + (v.x >= 0 ? 6 : -6)}" y="${y2 + (v.y >= 0 ? -6 : 14)}" font-size="12" font-weight="600" fill="${v.color || ACCENT}" text-anchor="${v.x >= 0 ? 'start' : 'end'}">${esc(v.label)}</text>`;
    });
    return svgWrap(W, H, inner);
  };

  /** cadena de desplazamientos [{dx,dy,label}] + resultante */
  C.chainSVG = function (legs, R) {
    const W = 340, H = 260;
    let x = 0, y = 0, minX = 0, maxX = 0, minY = 0, maxY = 0;
    const pts = [[0, 0]];
    legs.forEach((l) => { x += l.dx; y += l.dy; pts.push([x, y]); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    const span = Math.max(maxX - minX, maxY - minY, 1);
    const scale = (Math.min(W, H) - 60) / span;
    const ox = 30 + (-minX) * scale + ((W - 60) - (maxX - minX) * scale) / 2, oy = H - 30 - (-minY) * scale - ((H - 60) - (maxY - minY) * scale) / 2;
    let inner = arrowDefs('arl', ACCENT) + arrowDefs('arr', '#dc2626');
    for (let i = 0; i < legs.length; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      inner += `<line x1="${ox + x1 * scale}" y1="${oy - y1 * scale}" x2="${ox + x2 * scale}" y2="${oy - y2 * scale}" stroke="${ACCENT}" stroke-width="2" marker-end="url(#arl)"/>`;
      inner += `<text x="${ox + (x1 + x2) / 2 * scale + 4}" y="${oy - (y1 + y2) / 2 * scale - 4}" font-size="11" fill="#334155">${esc(legs[i].label)}</text>`;
    }
    inner += `<line x1="${ox}" y1="${oy}" x2="${ox + R.rx * scale}" y2="${oy - R.ry * scale}" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="5,3" marker-end="url(#arr)"/>`;
    inner += `<text x="${ox + R.rx * scale / 2 - 6}" y="${oy - R.ry * scale / 2 + 14}" font-size="12" font-weight="700" fill="#dc2626">R</text>`;
    inner += `<circle cx="${ox}" cy="${oy}" r="3" fill="#0f172a"/><text x="${ox - 14}" y="${oy + 14}" font-size="11">O</text>`;
    return svgWrap(W, H, inner);
  };

  C.compassSVG = function () {
    const inner = `<circle cx="50" cy="50" r="34" fill="none" stroke="#64748b"/><line x1="50" y1="12" x2="50" y2="88" stroke="#64748b"/><line x1="12" y1="50" x2="88" y2="50" stroke="#64748b"/>
<line x1="26" y1="26" x2="74" y2="74" stroke="#cbd5e1"/><line x1="74" y1="26" x2="26" y2="74" stroke="#cbd5e1"/>
<text x="50" y="10" font-size="11" text-anchor="middle" font-weight="700">N</text><text x="50" y="98" font-size="11" text-anchor="middle" font-weight="700">S</text><text x="94" y="54" font-size="11" font-weight="700">E</text><text x="0" y="54" font-size="11" font-weight="700">O</text>
<text x="70" y="24" font-size="8">NE</text><text x="18" y="24" font-size="8">NO</text><text x="70" y="82" font-size="8">SE</text><text x="18" y="82" font-size="8">SO</text>`;
    return svgWrap(100, 100, inner, 'figure-sm');
  };

  /** montaña con dos ángulos de elevación desde el mismo lado */
  C.elevationSVG = function (al, be, d) {
    const W = 360, H = 200, base = 170, top = 40;
    const h = base - top;
    const x1 = 280 - h / Math.tan(al * Math.PI / 180), x2 = 280 - h / Math.tan(be * Math.PI / 180);
    const inner = `<line x1="20" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#334155" stroke-width="2"/>
<polygon points="${280 - 45},${base} 280,${top} ${280 + 45},${base}" fill="#cbd5e1" stroke="#64748b"/>
<line x1="280" y1="${top}" x2="280" y2="${base}" stroke="#334155" stroke-dasharray="4,3"/>
<line x1="${x1}" y1="${base}" x2="280" y2="${top}" stroke="${ACCENT}" stroke-width="1.5"/><line x1="${x2}" y1="${base}" x2="280" y2="${top}" stroke="#d97706" stroke-width="1.5"/>
<circle cx="${x1}" cy="${base}" r="3" fill="${ACCENT}"/><circle cx="${x2}" cy="${base}" r="3" fill="#d97706"/>
<text x="${x1 + 10}" y="${base - 6}" font-size="11" fill="${ACCENT}">${al}°</text><text x="${x2 + 10}" y="${base - 6}" font-size="11" fill="#d97706">${be}°</text>
<text x="${(x1 + x2) / 2 - 12}" y="${base + 16}" font-size="11">${fmt(d, 1)} km</text><text x="286" y="${(top + base) / 2}" font-size="11">h</text>
<text x="${x1 - 4}" y="${base + 16}" font-size="10">x</text>`;
    return svgWrap(W, H, inner);
  };

  C.twoTownsSVG = function (al, be) {
    const W = 360, H = 190, base = 160, top = 40, cx = 180, h = base - top;
    const xa = cx - h / Math.tan(al * Math.PI / 180), xb = cx + h / Math.tan(be * Math.PI / 180);
    const inner = `<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#334155" stroke-width="2"/>
<polygon points="${cx - 50},${base} ${cx},${top} ${cx + 50},${base}" fill="#cbd5e1" stroke="#64748b"/>
<line x1="${cx}" y1="${top}" x2="${cx}" y2="${base}" stroke="#334155" stroke-dasharray="4,3"/>
<line x1="${xa}" y1="${base}" x2="${cx}" y2="${top}" stroke="${ACCENT}" stroke-width="1.5"/><line x1="${xb}" y1="${base}" x2="${cx}" y2="${top}" stroke="#d97706" stroke-width="1.5"/>
<text x="${xa - 6}" y="${base + 16}" font-size="12" font-weight="700">A</text><text x="${xb - 4}" y="${base + 16}" font-size="12" font-weight="700">B</text>
<text x="${xa + 14}" y="${base - 6}" font-size="11" fill="${ACCENT}">${al}°</text><text x="${xb - 30}" y="${base - 6}" font-size="11" fill="#d97706">${be}°</text><text x="${cx + 6}" y="${(top + base) / 2}" font-size="11">h</text>`;
    return svgWrap(W, H, inner);
  };

  C.rightTriangleSVG = function (base, h, hyp) {
    const W = 320, H = 200;
    const inner = `<polygon points="30,170 270,170 270,30" fill="#e2e8f0" stroke="${ACCENT}" stroke-width="2"/>
<rect x="256" y="156" width="14" height="14" fill="none" stroke="${ACCENT}"/>
<text x="150" y="190" font-size="12" text-anchor="middle">${base} m</text><text x="280" y="105" font-size="12">${h ? '?' : ''}</text><text x="130" y="90" font-size="12" fill="${ACCENT}">${hyp} m</text>
<text x="52" y="164" font-size="11">α</text>`;
    return svgWrap(W, H, inner);
  };

  /** esquema de situación: 'tiro' (lanzamiento hacia arriba) o 'caida' (edificio) */
  C.refSVG = function (kind, h, v0) {
    const W = 220, H = 220;
    let inner = arrowDefs('ay', '#0f172a') + arrowDefs('ag', '#dc2626') + arrowDefs('av', ACCENT);
    inner += `<line x1="20" y1="200" x2="200" y2="200" stroke="#334155" stroke-width="2"/>`;
    inner += `<line x1="40" y1="200" x2="40" y2="30" stroke="#0f172a" stroke-width="1.5" marker-end="url(#ay)"/><text x="46" y="36" font-size="12">y</text><text x="24" y="214" font-size="11">0</text>`;
    if (kind === 'caida') {
      inner += `<rect x="110" y="60" width="50" height="140" fill="#cbd5e1" stroke="#64748b"/><text x="118" y="54" font-size="11">y = ${h} m</text>`;
      inner += `<circle cx="180" cy="66" r="7" fill="#fff" stroke="#0f172a"/><line x1="196" y1="60" x2="196" y2="95" stroke="#dc2626" stroke-width="2" marker-end="url(#ag)"/><text x="202" y="82" font-size="11" fill="#dc2626">g</text>`;
    } else {
      const y0 = h ? 140 : 190;
      if (h) inner += `<rect x="110" y="${y0 + 10}" width="60" height="${200 - y0 - 10}" fill="#cbd5e1" stroke="#64748b"/><text x="176" y="${y0 + 30}" font-size="11">${h} m</text>`;
      inner += `<circle cx="140" cy="${y0}" r="8" fill="#fff" stroke="#0f172a"/>`;
      inner += `<line x1="140" y1="${y0 - 12}" x2="140" y2="${y0 - 70}" stroke="${ACCENT}" stroke-width="2.5" marker-end="url(#av)"/><text x="146" y="${y0 - 40}" font-size="11" fill="${ACCENT}">v₀ = ${fmt(v0, 1)} m/s</text>`;
      inner += `<line x1="90" y1="${y0 - 70}" x2="90" y2="${y0 - 20}" stroke="#dc2626" stroke-width="2" marker-end="url(#ag)"/><text x="66" y="${y0 - 40}" font-size="11" fill="#dc2626">g</text>`;
    }
    return svgWrap(W, H, inner, 'figure-sm');
  };
})(window);
