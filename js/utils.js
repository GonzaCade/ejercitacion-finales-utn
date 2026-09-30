/* ==========================================================================
   utils.js — utilidades compartidas: RNG con semilla, formateo, parser de
   expresiones numéricas y comparadores de respuestas.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- RNG determinístico (mulberry32) ---------- */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  class RNG {
    constructor(seed) {
      this.seed = typeof seed === 'string' ? hashString(seed) : (seed >>> 0);
      this.next = mulberry32(this.seed);
    }
    /** entero en [a, b] */
    int(a, b) { return a + Math.floor(this.next() * (b - a + 1)); }
    /** entero en [a,b] distinto de cero */
    intNZ(a, b) { let v; do { v = this.int(a, b); } while (v === 0); return v; }
    /** elemento aleatorio */
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
    /** decimal con n cifras en [a,b] */
    dec(a, b, n = 1) { const p = Math.pow(10, n); return Math.round((a + this.next() * (b - a)) * p) / p; }
    bool(p = 0.5) { return this.next() < p; }
    sign() { return this.bool() ? 1 : -1; }
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(this.next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    /** n elementos distintos */
    sample(arr, n) { return this.shuffle(arr).slice(0, n); }
  }

  /* ---------- Formateo ---------- */
  function round(v, d = 2) { const p = Math.pow(10, d); return Math.round(v * p) / p; }

  /** número a texto con coma decimal (estilo Argentina) */
  function fmt(v, d = 2) {
    if (v === null || v === undefined || Number.isNaN(v)) return '—';
    if (!Number.isFinite(v)) return v > 0 ? '+∞' : '−∞';
    let r = round(v, d);
    if (Object.is(r, -0)) r = 0;
    let s = String(r);
    if (/e/i.test(s)) s = r.toFixed(d);
    return s.replace('.', ',').replace('-', '−');
  }
  /** número para KaTeX (coma decimal protegida) */
  function tex(v, d = 2) {
    if (v === null || v === undefined || Number.isNaN(v)) return '?';
    let r = round(v, d);
    if (Object.is(r, -0)) r = 0;
    let s = String(r);
    if (/e/i.test(s)) s = r.toFixed(d);
    return s.replace('.', '{,}');
  }
  /** número con signo explícito para armar polinomios en KaTeX */
  function texSigned(v, d = 2) {
    const r = round(v, d);
    return (r < 0 ? '-' : '+') + tex(Math.abs(r), d);
  }
  /** coeficiente con signo para término con variable: 1→'+', -1→'-' */
  function texSC(v, d = 2) { const r = round(v, d); if (r === 1) return '+'; if (r === -1) return '-'; return texSigned(r, d); }
  /** coeficiente para término con variable: 1→'', -1→'-' */
  function texCoef(v, d = 2, leading = false) {
    const r = round(v, d);
    if (r === 1) return leading ? '' : '+';
    if (r === -1) return '-';
    return leading ? tex(r, d) : texSigned(r, d);
  }
  /** polinomio en KaTeX a partir de coeficientes [an,...,a0], variable x */
  function texPoly(coefs, variable = 'x', d = 2) {
    const n = coefs.length - 1;
    let out = '';
    let first = true;
    coefs.forEach((c, i) => {
      const r = round(c, d);
      if (r === 0) return;
      const p = n - i;
      let term;
      if (p === 0) term = (first ? tex(r, d) : texSigned(r, d));
      else {
        const co = texCoef(r, d, first);
        const v = p === 1 ? variable : `${variable}^{${p}}`;
        term = co + v;
      }
      out += (first ? '' : ' ') + term;
      first = false;
    });
    return out || '0';
  }
  /** fracción irreducible en KaTeX si es "linda", sino decimal */
  function texFrac(v, maxDen = 60, d = 3) {
    if (Number.isInteger(v)) return String(v);
    const f = toFraction(v, maxDen);
    if (f) {
      const s = f.n < 0 ? '-' : '';
      return `${s}\\tfrac{${Math.abs(f.n)}}{${f.d}}`;
    }
    return tex(v, d);
  }
  function toFraction(v, maxDen = 60) {
    for (let den = 1; den <= maxDen; den++) {
      const num = Math.round(v * den);
      if (Math.abs(num / den - v) < 1e-9) return { n: num, d: den };
    }
    return null;
  }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }

  /** vector en KaTeX (a ; b) */
  function texVec(x, y, d = 2) { return `(${tex(x, d)}\\,;\\,${tex(y, d)})`; }

  /* ---------- Parser de expresiones numéricas (sin eval) ----------
     Acepta: 3,5  3.5  41/4  -2  2*pi  π/6  sqrt(5)  √5  2√3  3^2  (1+2)*3  2e3  10^-3  1,5·10^3  1.5x10^3
  --------------------------------------------------------------- */
  function parseNumber(input) {
    if (input === null || input === undefined) return NaN;
    let s = String(input).trim();
    if (!s) return NaN;
    s = s.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/−|–/g, '-')
      .replace(/×|·|x(?=10\^)|\*\*/g, (m) => (m === '**' ? '^' : '*'))
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/raiz/g, 'sqrt')
      .replace(/°|º|%|m\/s\^?2?|km\/h|km|cm|hz|seg|s$/g, (m) => (m === '%' ? '/100' : ''))
      .replace(/,/g, '.');
    // si hay un solo punto decimal con miles tipo "1.525.000" → quitar puntos de miles
    if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    let pos = 0;
    const peek = () => s[pos];
    const eat = (c) => { if (s[pos] === c) { pos++; return true; } return false; };

    function parseExpr() {
      let v = parseTerm();
      for (;;) {
        if (eat('+')) v += parseTerm();
        else if (eat('-')) v -= parseTerm();
        else return v;
      }
    }
    function parseTerm() {
      let v = parseUnary();
      for (;;) {
        if (eat('*')) v *= parseUnary();
        else if (eat('/')) v /= parseUnary();
        else if (peek() && /[0-9a-z(]/.test(peek()) && !/^e[0-9]/.test(s.slice(pos))) {
          // multiplicación implícita: 2pi, 2sqrt(3), 3(2)
          v *= parseUnary();
        } else return v;
      }
    }
    function parseUnary() {
      if (eat('-')) return -parseUnary();
      if (eat('+')) return parseUnary();
      return parsePow();
    }
    function parsePow() {
      let base = parseAtom();
      if (eat('^')) {
        const exp = parseUnary();
        return Math.pow(base, exp);
      }
      return base;
    }
    function parseAtom() {
      if (eat('(')) {
        const v = parseExpr();
        if (!eat(')')) throw new Error('paréntesis');
        return v;
      }
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(s.slice(pos));
      if (m) { pos += m[0].length; return parseFloat(m[0]); }
      if (s.startsWith('sqrt', pos)) {
        pos += 4;
        let v;
        if (eat('(')) { v = parseExpr(); if (!eat(')')) throw new Error('paréntesis'); }
        else v = parseAtom();
        return Math.sqrt(v);
      }
      if (s.startsWith('pi', pos)) { pos += 2; return Math.PI; }
      if (s.startsWith('inf', pos)) { pos += 3; return Infinity; }
      if (s[pos] === 'e' && !/^e[0-9]/.test(s.slice(pos))) { pos += 1; return Math.E; }
      throw new Error('token inválido');
    }
    try {
      const v = parseExpr();
      if (pos !== s.length) return NaN;
      return v;
    } catch (e) { return NaN; }
  }

  /* ---------- Comparadores ---------- */
  function closeTo(user, target, tol) {
    if (!Number.isFinite(user)) return false;
    if (!Number.isFinite(target)) return user === target;
    const t = tol !== undefined ? tol : Math.max(0.011, Math.abs(target) * 0.012);
    return Math.abs(user - target) <= t;
  }

  /** compara conjunto de números (independiente del orden) */
  function setMatch(userVals, targets, tol) {
    if (userVals.length !== targets.length) return false;
    const rem = targets.slice();
    for (const u of userVals) {
      const idx = rem.findIndex((t) => closeTo(u, t, tol));
      if (idx < 0) return false;
      rem.splice(idx, 1);
    }
    return true;
  }

  /* ---------- Varios ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
  }
  function degNorm(a) { a = a % 360; if (a < 0) a += 360; return a; }
  function toDeg(r) { return r * 180 / Math.PI; }
  function toRad(d) { return d * Math.PI / 180; }
  /** raíces reales de ax²+bx+c */
  function quadRoots(a, b, c) {
    const D = b * b - 4 * a * c;
    if (D < 0) return [];
    if (D === 0) return [-b / (2 * a)];
    const s = Math.sqrt(D);
    return [(-b - s) / (2 * a), (-b + s) / (2 * a)].sort((x, y) => x - y);
  }
  /** multiplica polinomios (coef de mayor a menor grado) */
  function polyMul(p, q) {
    const r = new Array(p.length + q.length - 1).fill(0);
    p.forEach((a, i) => q.forEach((b, j) => { r[i + j] += a * b; }));
    return r;
  }
  /** división polinómica → {q, r} */
  function polyDiv(num, den) {
    let out = num.slice();
    const q = [];
    const dn = den.length;
    while (out.length >= dn) {
      const c = out[0] / den[0];
      q.push(c);
      for (let i = 0; i < dn; i++) out[i] -= c * den[i];
      out.shift();
    }
    while (out.length > 1 && Math.abs(out[0]) < 1e-9) out.shift();
    return { q: q.length ? q : [0], r: out.length ? out : [0] };
  }
  function polyEval(p, x) { return p.reduce((acc, c) => acc * x + c, 0); }

  global.U = {
    RNG, hashString, round, fmt, tex, texSigned, texSC, texCoef, texPoly, texFrac, texVec, toFraction, gcd,
    parseNumber, closeTo, setMatch, escapeHtml, fmtTime, degNorm, toDeg, toRad, quadRoots,
    polyMul, polyDiv, polyEval,
  };
})(window);
