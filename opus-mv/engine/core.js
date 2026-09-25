// core.js: math, determinism, timing (beats, sections, sung words), colour.
// Every frame must be a pure function of song time t. Never use Math.random().
'use strict';

const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const invlerp = (a, b, x) => clamp((x - a) / (b - a));
const remap = (x, a, b, c, d) => lerp(c, d, invlerp(a, b, x));
const frac = x => x - Math.floor(x);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const smooth = k => k * k * (3 - 2 * k);

// ---- easing
const E = {
  lin: k => k,
  in2: k => k * k, out2: k => 1 - (1 - k) * (1 - k), io2: k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2,
  in3: k => k * k * k, out3: k => 1 - Math.pow(1 - k, 3), io3: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  in4: k => k ** 4, out4: k => 1 - Math.pow(1 - k, 4), io4: k => k < .5 ? 8 * k ** 4 : 1 - Math.pow(-2 * k + 2, 4) / 2,
  out5: k => 1 - Math.pow(1 - k, 5), inExpo: k => k === 0 ? 0 : Math.pow(2, 10 * k - 10),
  outExpo: k => k === 1 ? 1 : 1 - Math.pow(2, -10 * k), ioExpo: k => k === 0 ? 0 : k === 1 ? 1 : k < .5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2,
  back: (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
  inBack: (k, s = 1.70158) => (s + 1) * k * k * k - s * k * k,
  elastic: k => k === 0 ? 0 : k === 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * (TAU / 3)) + 1,
  bounce: k => { const n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + .75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + .9375; return n * (k -= 2.625 / d) * k + .984375; },
  smooth, smoother: k => k * k * k * (k * (k * 6 - 15) + 10),
};
// spring-ish settle: overshoot that decays (for pops), k in 0..1+
const spring = (k, freq = 3.2, damp = 5) => k <= 0 ? 0 : 1 - Math.exp(-damp * k) * Math.cos(freq * TAU * k * .5);

// keyframes: kf(t, [[t0, v0], [t1, v1, ease?], ...]) values may be numbers or arrays
function kf(t, keys, ease = E.io2) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb, e] = keys[i];
      const k = (e || ease)((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}

// ---- determinism: hashes and noise
function hash(n) { // float in [0,1)
  n = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
const hash2 = (a, b) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663));
const hash3 = (a, b, c) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791));
const hs = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
function rng(seed) { // mulberry32 stream, deterministic per seed
  let a = (typeof seed === 'string' ? hs(seed) : seed) >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// 1D value noise, smooth, in [-1,1]
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash2(i, seed) * 2 - 1, hash2(i + 1, seed) * 2 - 1, u); }
// 2D value noise in [-1,1]
function noise2(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash3(xi, yi, seed), b = hash3(xi + 1, yi, seed), c = hash3(xi, yi + 1, seed), d = hash3(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}
const fbm = (x, y, seed = 0, oct = 4) => { let s = 0, a = .5, f = 1; for (let i = 0; i < oct; i++) { s += a * noise2(x * f, y * f, seed + i * 17); a *= .5; f *= 2; } return s; };
const wob = (t, freq = 1, seed = 0) => noise1(t * freq, seed);
// "boil": hand-drawn jitter quantised to N fps (linework re-draws on twos like cel animation)
let BOIL_FPS = 12;
const boilT = t => Math.floor(t * BOIL_FPS);
const jit = (t, i, amp = 1) => (hash2(boilT(t), i) * 2 - 1) * amp;

// ---- colour
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
const rgb2hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const mix = (a, b, k) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => lerp(v, B[i], k))); };
const rgba = (h, a) => { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };

// ---- song timing. SONG is filled from audio/timeline.json by the loader.
const SONG = { bpm: 120, offset: 0, duration: 140, beats: null, downbeats: null, sections: [], words: [], lines: [] };

function beatPos(t) { // continuous beat index (uses tracked beats when available)
  const B = SONG.beats;
  if (!B || B.length < 2) return (t - SONG.offset) * SONG.bpm / 60;
  if (t <= B[0]) return (t - B[0]) / (B[1] - B[0]);
  if (t >= B[B.length - 1]) return B.length - 1 + (t - B[B.length - 1]) / (B[B.length - 1] - B[B.length - 2]);
  let lo = 0, hi = B.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (B[m] <= t) lo = m; else hi = m; }
  return lo + (t - B[lo]) / (B[hi] - B[lo]);
}
const beatN = t => Math.floor(beatPos(t));
const beatTime = n => { const B = SONG.beats; if (!B) return SONG.offset + n * 60 / SONG.bpm; if (n <= 0) return B[0] + n * (B[1] - B[0]); if (n >= B.length - 1) return B[B.length - 1] + (n - B.length + 1) * (B[B.length - 1] - B[B.length - 2]); const i = Math.floor(n); return lerp(B[i], B[i + 1], n - i); };
const barPos = t => (beatPos(t) - (SONG.barPhase || 0)) / 4;
// pulse: 1 at each beat, decays (k = decay rate in beats^-1)
const pulse = (t, k = 6, every = 1) => { const p = beatPos(t) / every; return Math.exp(-k * frac(p) * every); };
const pulseBar = (t, k = 3) => Math.exp(-k * frac(barPos(t)) * 4 / 4);
const onBeatSince = (t, every = 1) => { const p = beatPos(t) / every; return (frac(p) * every) * (60 / (SONG.bpm || 120)); }; // seconds since last hit

function sectionAt(t) { for (const s of SONG.sections) if (t >= s.start && t < s.end) return s; return SONG.sections[SONG.sections.length - 1] || null; }

// sung words: [{w, s, e, line}] ; lines: [{text, s, e, words:[idx]}]
function wordsIn(t0, t1) { return SONG.words.filter(w => w.e >= t0 && w.s <= t1); }
function lineAt(t, pad = 0.15) { for (const L of SONG.lines) if (t >= L.s - pad && t <= L.e + pad) return L; return null; }
function lineById(id) { return SONG.lines.find(L => L.id === id); }

// ---- scene registry
const SCENES = [];
function scene(name, t0, t1, fn, opts = {}) { SCENES.push({ name, t0, t1, fn, ...opts }); SCENES.sort((a, b) => a.t0 - b.t0); }
function scenesAt(t) { return SCENES.filter(s => t >= s.t0 && t < s.t1); }

Object.assign(window, { TAU, clamp, lerp, invlerp, remap, frac, seg, smooth, E, spring, kf, hash, hash2, hash3, hs, rng, noise1, noise2, fbm, wob, boilT, jit, hex2rgb, rgb2hex, mix, rgba, SONG, beatPos, beatN, beatTime, barPos, pulse, pulseBar, onBeatSince, sectionAt, wordsIn, lineAt, lineById, SCENES, scene, scenesAt });
Object.defineProperty(window, 'BOIL_FPS', { get: () => BOIL_FPS, set: v => { BOIL_FPS = v; } });

// ---- lyric lookup by text (robust to timeline updates). Returns onset time of the first word
// matching `text` (case-insensitive, punctuation ignored) whose onset lies in [t0, t1]; else fallback.
const _norm = s => (s || '').toLowerCase().replace(/[^a-z0-9가-힣]+/g, '');
function findWord(text, t0, t1, fallback) {
  const n = _norm(text);
  for (const w of SONG.words) if (w.s >= t0 - .01 && w.s <= t1 && (_norm(w.w) === n || _norm(w.d) === n)) return w;
  return fallback !== undefined ? { w: text, s: fallback, e: fallback + .4, fallback: true } : null;
}
const wordOnset = (text, t0, t1, fallback) => { const w = findWord(text, t0, t1, fallback); return w ? w.s : fallback; };
function findLine(prefix, t0, t1) {
  const n = _norm(prefix);
  for (const L of SONG.lines) if (L.s >= t0 - .01 && L.s <= t1 && _norm(L.text).startsWith(n)) return L;
  return null;
}
Object.assign(window, { findWord, wordOnset, findLine });
