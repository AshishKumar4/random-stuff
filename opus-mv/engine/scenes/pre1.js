// pre1.js: PRE-CHORUS 1, bars 13–16 (22.50–30.00). Pretraining ▸ mid-training, replayed at 1× as a DRAMATIZATION.
//   S09 "Wrong, wrong, wrong, a little less wrong": the WRONG staircase. Three RED stamps slam on b1/b2/b3 and pile
//        into a descending stack; the AMBER text-body cloud tumbles down them; on bar 14 the chart pulls back and the
//        staircase keeps going (ever-smaller WRONGs) into the power-law tail; `✓-ish`; the book is sliced into tokens.
//   S10 "That's how I learned to sing along": the cloud condenses (glyph particles) into Opus's text-body silhouette,
//        the karaoke line + CLAY ball half a beat ahead; bar 16 the fill becomes the universe's longest loading bar,
//        pops into "Hi! How can I help you today? ■ end_turn" on b3; b4 near-blackout.
// Text-body skin (BIBLE §6.1) is implemented here: a silhouette mask filled with scrolling AMBER prose.
(() => {
  'use strict';
  const BEAT = 60 / 128, BAR = BEAT * 4, F = 1 / 30;
  const bt = (bar, b = 1) => (bar - 1) * BAR + (b - 1) * BEAT;
  const T13 = bt(13), T14 = bt(14), T15 = bt(15), T16 = bt(16), T17 = bt(17);
  const EDGE = 13;
  const OVER = mix(C.RED, C.INK, .24);          // riso overprint: RED over RED
  const RED_SH = mix(C.RED, C.INK, .58);        // second-hit offset of the stamp
  const BODY = C.AMBER;                          // text-body: AMBER flood with the prose knocked out (INK)
  const BODY_LIT = mix(C.AMBER, C.PAPER, .55);    // the face disc reads lighter
  const PILL_BG = mix(C.INK, C.AMBER, .22);

  // ------------------------------------------------------------------ lyric timing (locks onto sung onsets)
  function wrongs() {
    const w1 = findWord('wrong', T13 - .3, T13 + .22, T13);
    const w2 = findWord('wrong', w1.s + .15, bt(13, 2) + .25, bt(13, 2));
    const w3 = findWord('wrong', w2.s + .15, bt(13, 3) + .25, bt(13, 3));
    return [w1, w2, w3];
  }
  function lessWrong(w3) {
    const a = findWord('a', w3.s + .1, T14 + .3, bt(13, 4));
    const li = findWord('little', a.s, T14 + .5, T14);
    const le = findWord('less', li.s + .05, bt(14, 3), bt(14, 1.5));
    const wr = findWord('wrong', le.s + .05, bt(14, 4) + .2, bt(14, 2));
    return [a, li, le, wr];
  }
  const slamAt = w => w.s - 2 * F;               // HERO slams 2 frames before the syllable
  const impactAt = w => w.s - 2 * F + .12;       // scale reaches 1 (hero() SLAM curve)
  // karaoke words: the sung line in bar 15. A provisional timeline that spreads the line into bar 16 is squeezed
  // back into bar 15 (bible: the fill runs past the last word in bar 16, the pop is on bar 16 b3).
  function karaokeWords() {
    const L = findLine("That's how", T14, T15 + 1.2);
    let ws = L && L.words && L.words.length ? L.words.map(w => ({ d: w.d || w.w, s: w.s, e: w.e })) : null;
    if (!ws) ws = ["that's", 'how', 'I', 'learned', 'to', 'sing', 'along'].map((d, i) => ({ d, s: T15 + .02 + i * .26, e: T15 + .24 + i * .26 }));
    const last = ws[ws.length - 1];
    if (last.s > T16 - .05) { const a = ws[0].s, k = (T16 - .32 - a) / (last.s - a); ws = ws.map(w => ({ d: w.d, s: a + (w.s - a) * k, e: a + (w.e - a) * k })); }
    ws[0].d = ws[0].d.charAt(0).toLowerCase() + ws[0].d.slice(1);
    return ws;
  }

  // ------------------------------------------------------------------ text-body glyph tiles (built once)
  const PROSE = ['once upon a time', 'def main():', 'lol same', 'Dear Sir or Madam,', '3 cups flour, 2 eggs', 'thanks, this fixed it',
    'is this mole normal', 'Call me Ishmael.', 'SELECT * FROM users;', 'to be, or not to be', 'In the beginning', 'my grandmother used to say',
    'first post!!', 'I think, therefore', 'print("hello, world")', 'Chapter One', 'Terms of Service', 'E = mc^2', 'je ne sais quoi',
    'git commit -m "wip"', 'the quick brown fox', 'why is the sky blue', 'edit: nvm fixed it', 'We the People', 'return x;',
    'Abstract. We propose', 'lorem ipsum dolor', 'sincerely, M.', 'rain again today', 'how do I center a div', 'it was the best of times',
    'TL;DR', 'kind regards,', '1. Preheat the oven', 'for i in range(10):', 'she said yes', 'ok but hear me out', '#include <stdio.h>',
    'wherefore art thou', 'la la la', 'goodnight moon', 'P = NP?', 'eggs, milk, bread', 'Dear diary,', 'thank you so much!!', 'obrigado',
    'where do I even start', 'Section 2(a)', 'Ode to a Nightingale', 'the end.'];
  let _tiles = null;
  function tiles() {
    if (_tiles) return _tiles;
    const rows = 40, lh = 24, w = 2304;
    const mk = (col, seed) => {
      const c = makeCanvas(w, rows * lh), x = c.getContext('2d'), R = rng(seed);
      x.font = `600 20px ${FONTS.mono}`; x.textBaseline = 'alphabetic'; x.fillStyle = col;
      for (let r = 0; r < rows; r++) {
        let s = ''; while (s.length < 200) s += PROSE[Math.floor(R() * PROSE.length)] + (R() < .55 ? ' · ' : '  ');
        x.globalAlpha = .62 + R() * .3; x.fillText(s, 0, r * lh + 18); x.fillText(s, -12 * 192, r * lh + 18);
      }
      return c;
    };
    _tiles = { amber: mk(C.AMBER, 'pre1-a'), ink: mk(C.INK, 'pre1-a'), inkb: mk(C.INK, 'pre1-b'), rows, lh, w, cw: 12 };
    return _tiles;
  }
  // rows of scrolling prose covering [x0,x0+w]×[y0,y0+h] (current transform). Steps one char per eighth note
  // (never continuous: sub-10 px moving texture turns into macroblocks after the encoder).
  function textRows(ctx, x0, y0, w, h, t, tile, sc = 1, seed = 0) {
    const T = tiles(), lh = T.lh * sc, step = Math.floor(beatPos(t) * 2), vshift = Math.floor(beatPos(t));
    const n = Math.ceil(h / lh) + 1;
    for (let i = 0; i < n; i++) {
      const row = ((i + vshift + seed) % T.rows + T.rows) % T.rows;
      const dir = (i + seed) % 2 ? 1 : -1;
      let sx = ((dir * step * T.cw * 2 + hash(row * 13 + seed) * T.w) % 1152 + 1152) % 1152;
      let dx = x0, need = w / sc;
      while (need > 0) {
        const take = Math.min(need, T.w - sx);
        ctx.drawImage(tile, sx, row * T.lh, take, T.lh, dx, y0 + i * lh, take * sc, lh);
        dx += take * sc; need -= take; sx = 0;
      }
    }
  }

  // ------------------------------------------------------------------ distress texture for the rubber stamps
  let _distress = null;
  function distress() {
    if (_distress) return _distress;
    const s = 512, c = makeCanvas(s, s), x = c.getContext('2d'), R = rng('pre1-distress');
    x.fillStyle = '#000';
    for (let i = 0; i < 520; i++) { const r = .8 + Math.pow(R(), 3) * 7; x.globalAlpha = .5 + R() * .5; x.beginPath(); x.arc(R() * s, R() * s, r, 0, TAU); x.fill(); }
    x.lineCap = 'round';
    for (let i = 0; i < 26; i++) { const y = R() * s, x0 = R() * s, l = 30 + R() * 140; x.globalAlpha = .25 + R() * .35; x.lineWidth = .8 + R() * 2.2; x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + l, y + (R() - .5) * 6); x.stroke(); }
    _distress = c; return c;
  }

  // ------------------------------------------------------------------ S09 world layout (world = bar-13 frame coords)
  let LAY = null;
  function layout(ctx) {
    if (LAY) return LAY;
    const pre = s => [1, 2, 3, 4, 5].map(i => heroWidth(ctx, 'WRONG'.slice(0, i), s, 'cond'));
    const sizes = [515, 330, 210];
    const P = sizes.map(pre);
    const st = [];
    const x1 = 118;
    st.push({ size: 515, x: x1, w: P[0][4], top: 235 });
    st.push({ size: 330, x: x1 + P[0][0], w: P[1][4], top: 512 });            // left edge in W1's W|R gap
    st.push({ size: 210, x: st[1].x + P[1][1], w: P[2][4], top: 707 });        // left edge in W2's R|O gap
    // the staircase keeps going in bar 14: ever smaller WRONGs, sixteenth notes, converging on the power-law tail
    let prev = st[2];
    for (let k = 1; k <= 8; k++) {
      const size = 210 * Math.pow(.64, k), cap = .69 * size, pcap = .69 * prev.size;
      const s = { size, x: prev.x + prev.w + 4 * Math.pow(.64, k), w: P[2][4] * size / 210, top: prev.top + .62 * pcap, casc: k };
      st.push(s); prev = s;
    }
    st.forEach(s => { s.base = s.top + .69 * s.size; s.gap = Math.max(3, .034 * s.size); });
    const last = st[st.length - 1];
    const tail = { x0: last.x + last.w, y0: last.top - last.gap, yInf: last.top + 16, len: 1250 };
    LAY = { st, tail };
    return LAY;
  }
  const tailY = (L, x) => L.tail.yInf - (L.tail.yInf - L.tail.y0) * Math.exp(-Math.max(0, x - L.tail.x0) / 230);
  const S1 = .54, O1 = [50, 292];                    // pulled-back view (bar 14)
  const FUN = { x: 960, top: -170, rx: 250, ry: 36, neck: 60, spout: 128 };

  // stamp timings: the three sung WRONGs, then the cascade on sixteenths from bar 14 b1
  function stampTimes(ws) {
    const L = LAY; const out = [slamAt(ws[0]), slamAt(ws[1]), slamAt(ws[2])];
    for (let i = 3; i < L.st.length; i++) out.push(T14 - 2 * F + (i - 3) * BEAT / 4);
    return out;
  }

  // ------------------------------------------------------------------ S09 view: pull-back + WRONG punches + trauma shake
  function view(t, ws) {
    const kp = E.io3(seg(t, T14 - .02, T14 + .66));
    const ant = t < T14 ? .012 * E.in2(seg(t, T14 - 4 * F, T14)) : 0;   // 4-frame push-in before the pull-back
    const s = lerp(1, S1, kp), ox = lerp(0, O1[0], kp), oy = lerp(0, O1[1], kp);
    let z = 1 + ant, sx = 0, sy = 0;
    ws.forEach((w, i) => {
      const a = t - impactAt(w);
      if (a >= 0 && a < 1.2) {
        z += .03 * Math.exp(-9 * a) * Math.cos(a * 16) * (i === 0 ? 1.25 : 1);
        const tr = Math.exp(-6 * a), [a1, a2] = shake(t, 20 * tr * tr * (i ? .75 : 1), 31 + i, 22);
        sx += a1; sy += a2;
      }
    });
    return { s, ox, oy, z, sx, sy, kp };
  }
  function w2s(V, x, y) {
    const X_ = V.ox + x * V.s, Y_ = V.oy + y * V.s;
    return [960 + (X_ - 960) * V.z + V.sx, 540 + (Y_ - 540) * V.z + V.sy];
  }
  function applyView(X, V) { X.translate(960 + V.sx, 540 + V.sy); X.scale(V.z, V.z); X.translate(-960, -540); X.translate(V.ox, V.oy); X.scale(V.s, V.s); }

  // ------------------------------------------------------------------ S09 chart pieces (world coords)
  function axes(X, t, V, a) {
    const lw = 3.5 / (V.s * V.z);
    X.save(); X.strokeStyle = C.PAPER; X.lineCap = 'round'; X.lineWidth = lw;
    X.globalAlpha = a * lerp(.28, .7, V.kp);
    X.beginPath(); X.moveTo(64, -120); X.lineTo(64, 1000); X.stroke();
    for (let y = 0; y < 1000; y += 120) { X.beginPath(); X.moveTo(64, y); X.lineTo(64 + 14 / V.s, y); X.stroke(); }
    X.globalAlpha = a * .7 * V.kp;
    X.beginPath(); X.moveTo(64, 1000); X.lineTo(3500, 1000); X.stroke();
    for (let x = 64 + 240; x < 3500; x += 240) { X.beginPath(); X.moveTo(x, 1000); X.lineTo(x, 1000 - 14 / V.s); X.stroke(); }
    X.restore();
  }

  // paper-cut funnel with the internet falling into it (feed cards, pages, code, token pills); boils on 12 fps
  function pill(X, x, y, str, sc, col = C.AMBER, alpha = 1) {
    X.save(); X.globalAlpha *= alpha; X.translate(x, y); X.scale(sc, sc);
    X.font = `600 22px ${FONTS.mono}`; const w = X.measureText(str).width + 22;
    rr(X, -w / 2, -17, w, 34, 17); X.fillStyle = PILL_BG; X.fill(); X.lineWidth = 3; X.strokeStyle = col; X.stroke();
    X.fillStyle = col; X.textAlign = 'center'; X.fillText(str, 0, 8); X.restore();
  }
  const TOKS = ['the', ' cat', 'ing', 'Once', ' upon', '{', 'def', 'lol', ' is', '.', ' love', ' you', 'er', ' of', ' hi', 'Dear', '()', ' the', ' end', '\\n'];
  function feedItem(X, i, x, y, rot, sc, t) {
    X.save(); X.translate(x, y); X.rotate(rot); X.scale(sc, sc);
    const kind = i % 4, j = k => jit(t, i * 17 + k, 1.2);
    X.lineWidth = 3; X.strokeStyle = C.INK;
    if (kind === 0) { // book page
      X.fillStyle = C.PAPER; X.beginPath(); X.moveTo(-34 + j(1), -44 + j(2)); X.lineTo(34 + j(3), -44 + j(4)); X.lineTo(34 + j(5), 44 + j(6)); X.lineTo(-34 + j(7), 44 + j(8)); X.closePath(); X.fill();
      X.strokeStyle = rgba(C.INK, .55); X.lineWidth = 3; for (let l = 0; l < 6; l++) { X.beginPath(); X.moveTo(-24, -30 + l * 12); X.lineTo(l === 5 ? 6 : 24, -30 + l * 12); X.stroke(); }
    } else if (kind === 1) { // feed post
      X.fillStyle = C.PAPER; rr(X, -52 + j(1), -30 + j(2), 104, 60, 8); X.fill();
      X.fillStyle = C.INK; X.beginPath(); X.arc(-34, -12, 9, 0, TAU); X.fill();
      X.fillStyle = rgba(C.INK, .55); X.fillRect(-18, -16, 56, 6); X.fillRect(-40, 4, 80, 5); X.fillRect(-40, 15, 58, 5);
    } else if (kind === 2) { // code
      X.fillStyle = C.PAPER; X.font = `700 30px ${FONTS.mono}`; X.textAlign = 'center'; X.fillText(['{ }', '</>', 'fn()', '[ ]'][i % 4 === 2 ? (i >> 2) % 4 : 0], 0, 10);
    } else pill(X, 0, 0, TOKS[i % TOKS.length], 1);
    X.restore();
  }
  function funnel(X, t, a) {
    const f = FUN, J = k => jit(t, 900 + k, 1.1);
    X.save(); X.globalAlpha *= a;
    // the internet pours in: a stream arcing from the upper right into the mouth (off-frame until the pull-back)
    const P0 = [3380, -110], Pc = [2300, -300], P2 = [f.x + 10, f.top - 4];
    for (let i = 0; i < 16; i++) {
      const per = 1.5 + hash(i * 7) * .5, ph = frac((t - T13) / per + hash(i * 3));
      const u = E.in2(ph), sp = (hash(i * 11) - .5) * 120 * (1 - u);
      const x = (1 - u) * (1 - u) * P0[0] + 2 * (1 - u) * u * Pc[0] + u * u * P2[0], y = (1 - u) * (1 - u) * P0[1] + 2 * (1 - u) * u * Pc[1] + u * u * P2[1] + sp;
      if (u > .985) continue;
      X.save(); X.globalAlpha *= .85 * clamp(u * 12) * clamp((1 - u) * 20);
      feedItem(X, i, x, y, (hash(i * 5) - .5) * 1.2 + u * (hash(i) - .5) * 2.4, lerp(1.25, .55, u), t);
      X.restore();
    }
    // cone (PAPER paper-cut), halftone shade on the right, dark mouth, spout
    const cone = () => { X.beginPath(); X.moveTo(f.x - f.rx + J(1), f.top + J(2)); X.lineTo(f.x - 24 + J(3), f.neck); X.lineTo(f.x - 20, f.spout - 10); X.quadraticCurveTo(f.x, f.spout + 8, f.x + 20, f.spout - 10); X.lineTo(f.x + 24 + J(4), f.neck); X.lineTo(f.x + f.rx + J(5), f.top + J(6)); X.closePath(); };
    cone(); X.fillStyle = C.PAPER; X.fill();
    X.save(); cone(); X.clip(); X.fillStyle = halftone(X, C.INK, .42, 12, 45); X.beginPath(); X.moveTo(f.x + 40, f.top); X.lineTo(f.x + f.rx + 20, f.top); X.lineTo(f.x + 30, f.spout + 20); X.lineTo(f.x + 6, f.spout + 20); X.closePath(); X.fill();
    X.strokeStyle = C.INK; X.lineWidth = 5; X.beginPath(); X.moveTo(f.x - 26, f.neck + 2); X.lineTo(f.x + 26, f.neck + 2); X.stroke(); X.restore();
    X.beginPath(); X.ellipse(f.x, f.top, f.rx + 2, f.ry, 0, 0, TAU); X.fillStyle = C.PAPER; X.fill();
    X.beginPath(); X.ellipse(f.x, f.top + 3, f.rx - 14, f.ry - 10, 0, 0, TAU); X.fillStyle = C.INK; X.fill();
    X.restore();
  }
  // tokens dripping from the spout (onto the cloud, or onto W1 once it has tumbled away)
  function drip(X, t, a, targetY) {
    for (let i = 0; i < 6; i++) {
      const ph = frac((t - T13) / .55 + i / 6);
      const y = lerp(FUN.spout, targetY, E.in2(ph));
      pill(X, FUN.x + Math.sin(i * 2.1 + ph * 3) * 10, y, TOKS[(i * 7 + Math.floor((t - T13) / .55)) % TOKS.length], .85, C.AMBER, a * (1 - ph * ph));
    }
  }

  // the hardcover (bar 14 b3): a single INK blade slices the spine; the pages fan out like wings into token pills
  function book(X, t, a) {
    const tb = bt(14, 3), tIn = tb - .5;
    if (t < tIn || a <= 0) return;
    const f = FUN, bw = 190, bh = 240, J = k => jit(t, 700 + k, 1.1);
    const land = tb - .16, kF = seg(t, tIn, land);
    let by = lerp(-900, f.top - 8, E.in3(kF));                 // book bottom y
    if (t > land) by = f.top - 8 - 26 * Math.exp(-14 * (t - land)) * Math.abs(Math.sin((t - land) * 22));
    const bx = f.x + 30, rot0 = lerp(-.35, -.04, E.out2(kF));
    X.save(); X.globalAlpha *= a;
    if (t < tb) { // closed hardcover, spine facing left
      X.save(); X.translate(bx, by); X.rotate(rot0);
      X.beginPath(); X.moveTo(-bw / 2 + J(1), -bh + J(2)); X.lineTo(bw / 2 + J(3), -bh + J(4)); X.lineTo(bw / 2 + J(5), J(6)); X.lineTo(-bw / 2 + J(7), J(8)); X.closePath();
      X.fillStyle = C.PAPER; X.fill(); X.save(); X.clip(); X.fillStyle = halftone(X, C.INK, .32, 12, 45); X.fillRect(bw * .1, -bh, bw, bh); X.restore();
      X.fillStyle = C.INK; X.fillRect(-bw / 2 + 36, -bh + 58, bw - 70, 12); X.fillRect(-bw / 2 + 36, -bh + 80, bw - 110, 8);
      X.fillStyle = mix(C.PAPER, C.INK, .18); X.fillRect(-bw / 2, -bh, 30, bh);                      // spine
      X.fillStyle = C.INK; X.fillRect(-bw / 2, -bh + 30, 30, 8); X.fillRect(-bw / 2, -24, 30, 8);
      X.restore();
    } else {
      const k = t - tb;
      // spine strip falls away, spinning
      X.save(); X.translate(bx - bw / 2 + 15 - k * 120, by - bh / 2 + 900 * k * k); X.rotate(-k * 5); X.globalAlpha *= clamp(1 - k * 2);
      X.fillStyle = mix(C.PAPER, C.INK, .18); X.fillRect(-15, -bh / 2, 30, bh); X.fillStyle = C.INK; X.fillRect(-15, -bh / 2 + 30, 30, 8); X.restore();
      // pages: fan out as wings, then fly into the mouth as token pills
      const N = 12;
      for (let j = 0; j < N; j++) {
        const side = j % 2 ? 1 : -1, rank = (j >> 1) + 1;
        const fan = E.back(seg(k, 0, .16), 1.6) * side * (.14 + rank * .15);
        const tf = .17 + j * .022, kfly = E.in2(seg(k, tf, tf + .3));
        const px = bx + side * 10, py = by;
        X.save();
        if (kfly <= 0) {
          X.translate(px, py); X.rotate(fan);
          X.fillStyle = C.PAPER; X.fillRect(-bw * .42, -bh * .96, bw * .84, bh * .94); X.strokeStyle = C.INK; X.lineWidth = 3; X.strokeRect(-bw * .42, -bh * .96, bw * .84, bh * .94);
          X.fillStyle = rgba(C.INK, .5); for (let l = 0; l < 8; l++) X.fillRect(-bw * .32, -bh * .86 + l * 28, bw * (l === 7 ? .3 : .62), 5);
        } else {
          const sx0 = px + Math.sin(fan) * bh * .5, sy0 = py - Math.cos(fan) * bh * .5;
          const ex = f.x + (hash(j * 3) - .5) * 160, ey = f.top + 6;
          const x = lerp(sx0, ex, kfly), y = lerp(sy0, ey, kfly) - Math.sin(kfly * Math.PI) * 120;
          pill(X, x, y, TOKS[(j * 5 + 3) % TOKS.length], lerp(1.6, .8, kfly), C.AMBER, kfly > .92 ? (1 - kfly) / .08 : 1);
        }
        X.restore();
      }
    }
    // the blade: one INK stroke down the spine, PAPER edge, 3 frames
    const kb = seg(t, tb - 2 * F, tb + F);
    if (kb > 0 && kb < 1) {
      const x = bx - bw / 2 + 30, y = lerp(by - bh - 260, by + 80, E.in2(kb));
      X.save(); X.translate(x, y); X.fillStyle = C.INK; X.beginPath(); X.moveTo(-10, -420); X.lineTo(22, -420); X.lineTo(22, 0); X.lineTo(-10, 40); X.closePath(); X.fill();
      X.strokeStyle = C.PAPER; X.lineWidth = 6; X.beginPath(); X.moveTo(-10, -420); X.lineTo(-10, 40); X.stroke(); X.restore();
    }
    if (t >= tb && t < tb + 3 * F) { X.strokeStyle = C.PAPER; X.lineWidth = 8; X.globalAlpha *= 1 - (t - tb) / (3 * F); X.beginPath(); X.moveTo(bx - bw / 2 + 30, by - bh - 30); X.lineTo(bx - bw / 2 + 30, by + 30); X.stroke(); }
    X.restore();
  }

  // the stamps: RED riso rubber stamps, overprinting each other, distressed; the stack is the staircase.
  // Settled stamps are baked once into world-space bitmaps (pure memo); only live slams are drawn per frame.
  const CB = { x0: 70, y0: 170, w: 2880, h: 840 };
  const _stCache = new Map();
  const stampOne = (ctx, s, age, col, sh) => hero(ctx, 'WRONG', s.x + s.w / 2, s.base, s.size, { stretch: 'cond', color: col, shadow: sh, shadowOff: Math.max(2, s.size * .016), age, ghosts: age !== null });
  function stampCache(n, over = false) {       // first n stamps settled; over = tinted OVER (for live overprint)
    const key = n + (over ? 'o' : '');
    if (_stCache.has(key)) return _stCache.get(key);
    let c;
    if (over) {
      const base = stampCache(n); c = makeCanvas(CB.w, CB.h); const x = c.getContext('2d');
      x.drawImage(base, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = OVER; x.fillRect(0, 0, CB.w, CB.h);
    } else {
      c = makeCanvas(CB.w, CB.h); const x = c.getContext('2d'), tmp = makeCanvas(CB.w, CB.h), y = tmp.getContext('2d');
      x.translate(-CB.x0, -CB.y0); y.translate(-CB.x0, -CB.y0);
      for (let i = 0; i < n; i++) {
        const st = LAY.st[i];
        if (i === 1 || i === 2) {
          y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.clearRect(0, 0, CB.w, CB.h); y.restore();
          stampOne(y, st, null, C.RED, RED_SH);
          y.globalCompositeOperation = 'source-atop'; for (let j = 0; j < i; j++) stampOne(y, LAY.st[j], null, OVER, null); y.globalCompositeOperation = 'source-over';
          x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.drawImage(tmp, 0, 0); x.restore();
        } else stampOne(x, st, null, C.RED, RED_SH);
      }
      x.globalCompositeOperation = 'destination-out'; x.fillStyle = x.createPattern(distress(), 'repeat'); x.globalAlpha = .9;
      x.fillRect(CB.x0, CB.y0, CB.w, CB.h);
    }
    _stCache.set(key, c);
    return c;
  }
  function stamps(X, t, V, ws, a) {
    const L = LAY, times = stampTimes(ws), N = L.st.length;
    let settled = 0; while (settled < N && t - times[settled] >= .6) settled++;
    if (settled > 0) { X.save(); X.globalAlpha *= a; X.drawImage(stampCache(settled), CB.x0, CB.y0); X.restore(); }
    const live = []; for (let i = settled; i < N; i++) if (t >= times[i]) live.push(i);
    if (!live.length) return;
    const Lv = layer('pre1_live'); Lv.setTransform(X.getTransform());
    for (const i of live) stampOne(Lv, L.st[i], t - times[i], C.RED, RED_SH);
    if (settled > 0) { Lv.globalCompositeOperation = 'source-atop'; Lv.drawImage(stampCache(settled, true), CB.x0, CB.y0); }
    Lv.globalCompositeOperation = 'destination-out'; Lv.fillStyle = Lv.createPattern(distress(), 'repeat'); Lv.globalAlpha = .9;
    for (const i of live) { const st = L.st[i], age = t - times[i], k = age < .12 ? 2.6 : 1.2; Lv.fillRect(st.x + st.w / 2 - st.w * k / 2, st.base - st.size * .69 / 2 - st.size * k * .6, st.w * k, st.size * k * 1.2); }
    Lv.globalAlpha = 1; Lv.globalCompositeOperation = 'source-over';
    drawLayer(X, 'pre1_live', { alpha: a });
  }

  // the loss curve: a PAPER step line riding the stamp tops (risers sit in the letter gaps), then the power-law tail
  function curve(X, t, V, ws, a) {
    const L = LAY, times = stampTimes(ws), st = L.st;
    const segs = [];
    // tread of stamp 0 from the axis
    segs.push({ t0: times[0] + .1, d: 6 * F, pts: [[64, st[0].top - st[0].gap], [st[1].x, st[0].top - st[0].gap]] });
    for (let i = 1; i < st.length; i++) {
      const xr = st[i].x, xe = i + 1 < st.length ? st[i + 1].x : st[i].x + st[i].w;
      segs.push({ t0: times[i] + (i < 3 ? .1 : .05), d: (i < 3 ? 6 : 3) * F, pts: [[xr, st[i - 1].top - st[i - 1].gap], [xr, st[i].top - st[i].gap], [xe, st[i].top - st[i].gap]] });
    }
    const tp = []; for (let x = L.tail.x0; x <= L.tail.x0 + L.tail.len; x += 20) tp.push([x, tailY(L, x)]);
    segs.push({ t0: bt(14, 2) - 2 * F, d: 12 * F, pts: tp, ease: E.out3 });
    const lw = 6 / (V.s * V.z);
    const path = (ctx, pts, k) => {
      let tot = 0; const ls = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls.push(l); tot += l; }
      let rem = tot * k; ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length && rem > 0; i++) { const f_ = Math.min(1, rem / ls[i - 1]); ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f_), lerp(pts[i - 1][1], pts[i][1], f_)); rem -= ls[i - 1]; }
    };
    X.save(); X.globalAlpha *= a; X.lineCap = 'round'; X.lineJoin = 'round';
    for (const pass of [[C.INK, lw * 2.6], [C.PAPER, lw]]) {
      X.strokeStyle = pass[0]; X.lineWidth = pass[1]; X.beginPath();
      for (const sg of segs) { const k = (sg.ease || E.out2)(seg(t, sg.t0, sg.t0 + sg.d)); if (k > 0) path(X, sg.pts, k); }
      X.stroke();
    }
    X.restore();
  }

  function chart(X, t, V, ws, a = 1) {
    layout(X);
    const SK = window.PRE1_SKIP || {};
    if (!SK.axes) axes(X, t, V, a);
    if (!SK.funnel) funnel(X, t, a);
    if (!SK.book) book(X, t, a);
    if (!SK.stamps) stamps(X, t, V, ws, a);
    if (!SK.curve) curve(X, t, V, ws, a);
  }

  // ------------------------------------------------------------------ the text-body cloud (formless Opus, S09)
  const PUFFS = [[-.37, -.17, .16], [-.2, -.31, .2], [.02, -.39, .24], [.24, -.31, .2], [.41, -.17, .15], [-.02, -.15, .24], [-.25, -.11, .17], [.23, -.11, .17], [.52, -.07, .08], [-.53, -.07, .08]];
  function cloudCircles(t, w, grow = 1) {
    return PUFFS.map(([x, y, r], i) => {
      const b = 1 + .04 * Math.sin(t * 3.3 + i * 1.7) + .05 * pulse(t, 7) * (i % 2 ? 1 : .5);
      return [x * w, y * w, r * w * b * grow];
    });
  }
  function puffPath(ctx, circ, g = 0) { ctx.beginPath(); for (const [x, y, r] of circ) { ctx.moveTo(x + r + g, y); ctx.arc(x, y, r + g, 0, TAU); } }
  // cs: {x, y (screen, bottom centre), w (screen width), rot, sx, sy, eyes, mouth, gaze, lid, t, alpha, grow}
  function drawCloud(X, cs) {
    const { x, y, w, t } = cs;
    if (w < 2 || cs.alpha === 0) return;
    const circ = cloudCircles(t, w, cs.grow ?? 1), cy = -.26 * w, kl = Math.max(3, w * .02);
    X.save(); X.globalAlpha *= cs.alpha ?? 1;
    X.translate(x, y); X.translate(0, cy); X.rotate(cs.rot || 0); X.translate(0, -cy); X.scale(cs.sx || 1, cs.sy || 1);
    const floor = (g) => { X.beginPath(); X.rect(-w * 1.2, -w * 1.4, w * 2.4, w * 1.4 + g); X.clip(); };
    X.save(); floor(kl); puffPath(X, circ, kl); X.fillStyle = C.PAPER; X.fill(); X.restore();
    X.save(); floor(0); puffPath(X, circ, 0); X.clip();
    X.fillStyle = BODY; X.fillRect(-w * .8, -w * 1.1, w * 1.6, w * 1.12);
    X.globalAlpha *= .36; textRows(X, -w * .7, -w * .8, w * 1.4, w * .82, t, tiles().ink, w / 360, 3); X.globalAlpha /= .36;
    X.fillStyle = halftone(X, C.PAPER, .3, 9, 45); for (const [px, py, pr] of circ) { X.beginPath(); X.arc(px - pr * .32, py - pr * .36, pr * .5, 0, TAU); X.fill(); }   // riso highlight, lit from top-left
    X.restore();
    // face: cursor-pupil eyes (the tab's eyes from S08) and a singing mouth
    const g = cs.gaze || [0, 0], fx = g[0] * .025 * w, fy = -.25 * w;
    X.save(); X.translate(fx, fy);
    const ex = .13 * w, rx = .062 * w, ry = .09 * w, lwF = Math.max(3, .017 * w);
    for (const sd of [-1, 1]) { X.save(); X.beginPath(); X.ellipse(sd * .235 * w, .075 * w, .05 * w, .027 * w, 0, 0, TAU); X.fillStyle = halftone(X, C.PINK, .6, 5, 45); X.fill(); X.restore(); }
    X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = C.INK; X.fillStyle = C.INK;
    for (const sd of [-1, 1]) {
      X.save(); X.translate(sd * ex, 0);
      if (cs.eyes === '><') { X.lineWidth = lwF * 1.5; X.beginPath(); X.moveTo(-sd * rx, -ry * .6); X.lineTo(sd * rx * .9, 0); X.lineTo(-sd * rx, ry * .6); X.stroke(); }
      else if (cs.eyes === '^^') { X.lineWidth = lwF * 1.6; X.beginPath(); X.arc(0, ry * .4, rx * 1.1, Math.PI * 1.12, Math.PI * 1.88); X.stroke(); }
      else {
        const h = clamp(cs.lid || 0), ryy = Math.max(1.5, ry * (1 - h * .92));
        X.beginPath(); X.ellipse(0, 0, rx, ryy, 0, 0, TAU); X.fill();
        if (h < .6) { X.fillStyle = cs.cursorOn === false ? mix(C.PAPER, C.INK, .5) : C.PAPER; X.fillRect(g[0] * rx * .3 - rx * .24, g[1] * ry * .25 - ry * .46, rx * .48, ry * .92 * (1 - h)); }
        X.fillStyle = C.INK;
      }
      X.restore();
    }
    // mouth
    X.translate(0, .1 * w);
    const m = cs.mouth || 'rest', mr = .034 * w;
    X.lineWidth = lwF;
    if (m === 'O' || m === 'U') { X.beginPath(); X.ellipse(0, 0, mr * (m === 'U' ? .6 : .9), mr * (m === 'U' ? .7 : 1.15), 0, 0, TAU); X.fill(); }
    else if (m === 'A' || m === 'E' || m === 'I') { rr(X, -mr * 1.3, -mr * .6, mr * 2.6, mr * (m === 'E' ? 1.0 : 1.6), mr * .8); X.fill(); }
    else if (m === 'M') { X.beginPath(); X.moveTo(-mr, 0); X.lineTo(mr, 0); X.stroke(); }
    else { X.beginPath(); X.arc(0, -mr * .9, mr * 1.2, .2 * Math.PI, .8 * Math.PI); X.stroke(); }
    X.restore();
    X.restore();
  }

  // where the cloud is: sits on W1 under the spout, tumbles down W2 and W3 (landing on the "and" after each WRONG),
  // hops down the bar-14 cascade on eighths, rolls along the tail to the ✓-ish.
  function cloudTrack(t, ws) {
    const L = LAY, st = L.st;
    const on = (i, dx) => [st[i].x + dx, st[i].top - 1];
    const P = [on(0, 842), on(1, 557), on(2, 352), on(3, st[3].w * .5), on(4, st[4].w * .5), on(5, st[5].w * .5)];
    const xEnd = L.tail.x0 - 40, Pend = [xEnd, tailY(L, xEnd) - L.st[L.st.length - 1].gap];
    const legs = [
      { a: 0, b: 1, t0: slamAt(ws[1]), t1: bt(13, 2.5), h: 110, spin: TAU },
      { a: 1, b: 2, t0: slamAt(ws[2]), t1: bt(13, 3.5), h: 90, spin: TAU },
      { a: 2, b: 3, t0: T14 - F, t1: bt(14, 1.5), h: 120, spin: 0 },
      { a: 3, b: 4, t0: bt(14, 1.5) + 2 * F, t1: bt(14, 2), h: 70, spin: 0 },
      { a: 4, b: 5, t0: bt(14, 2) + 2 * F, t1: bt(14, 2.5), h: 50, spin: 0 },
    ];
    const W = [300, 330, 350, 350, 350, 350];
    let pos = P[0], w = lerp(270, 300, E.out2(seg(t, T13, T13 + .3))), rot = 0, sx = 1, sy = 1, air = false, lastLand = -9, nextJump = legs[0].t0;
    for (let i = 0; i < legs.length; i++) {
      const g = legs[i];
      if (t >= g.t1) { pos = P[g.b]; w = W[g.b]; lastLand = g.t1; nextJump = legs[i + 1] ? legs[i + 1].t0 : 99; continue; }
      if (t >= g.t0) {
        const u = (t - g.t0) / (g.t1 - g.t0), pa = P[g.a], pb = P[g.b];
        pos = [lerp(pa[0], pb[0], E.out2(u) * .3 + u * .7), lerp(pa[1], pb[1], u * u) - g.h * Math.sin(u * Math.PI) * (1 - u * .4)];
        w = lerp(W[g.a], W[g.b], u); rot = g.spin * E.io2(u); air = true;
        sy = 1 + .12 * Math.sin(u * Math.PI); sx = 1 / Math.sqrt(sy);
      }
      break;
    }
    // roll along the tail
    const r0 = bt(14, 2.5) + 2 * F, r1 = bt(14, 3) + .12;
    if (t >= r0) {
      const u = E.out3(seg(t, r0, r1)), x = lerp(P[5][0], Pend[0], u);
      pos = [x, x > L.tail.x0 ? tailY(L, x) - L.st[L.st.length - 1].gap : lerp(P[5][1], Pend[1], u)];
      rot = TAU * u; air = u < 1; lastLand = r1; nextJump = 99;
    }
    if (!air) {
      const a = t - lastLand;
      if (a >= 0 && a < .6) { sy = 1 - .26 * Math.exp(-11 * a) * Math.cos(a * 26); sx = 1 / Math.sqrt(sy); }
      const pre = nextJump - t; if (pre > 0 && pre < 3 * F) { sy = 1 - .16 * (1 - pre / (3 * F)); sx = 1 / Math.sqrt(sy); }
    }
    return { pos, w, rot, sx, sy, air, lastLand, P, Pend };
  }
  function cloudFace(t, ws, tr) {
    let eyes = 'cursor', gaze = [.6, .3], lid = blinkAt(t, 9);
    for (const w of ws) { const a = t - impactAt(w); if (a >= -F && a < 5 * F) eyes = '><'; }
    if (tr.air) eyes = '><';
    if (t > bt(14, 3) + .1) { eyes = '^^'; }
    let mouth = lipSync(t, 'rest');
    if (mouth === 'rest' && eyes === '><') mouth = 'E';
    const cursorOn = Math.floor(beatPos(t)) % 2 === 0;
    return { eyes, gaze, lid, mouth, cursorOn };
  }

  // ------------------------------------------------------------------ screen-space furniture
  function chyron(X, t, a = 1) {
    if (a <= 0) return;
    X.save(); X.globalAlpha *= a;
    const x = 96, y = 46, cw = 48, ch = 34;
    const snap = t < T13 + 6 * F ? E.back(seg(t, T13 - F, T13 + 4 * F), 2.2) : 1;
    X.lineJoin = 'round'; X.lineWidth = 3; X.strokeStyle = C.UI_GREY; X.fillStyle = C.UI_GREY;
    rr(X, x, y + 10, cw, ch - 8, 4); X.stroke();
    X.save(); X.translate(x, y + 10); X.rotate(-(1 - snap) * .5);
    rr(X, 0, -10, cw, 9, 2); X.fill();
    X.restore();
    X.fillStyle = C.INK; for (let i = 0; i < 3; i++) { X.save(); X.translate(x, y + 10); X.rotate(-(1 - snap) * .5); X.beginPath(); X.moveTo(8 + i * 14, -10); X.lineTo(14 + i * 14, -10); X.lineTo(10 + i * 14, -1); X.lineTo(4 + i * 14, -1); X.closePath(); X.fill(); X.restore(); }
    X.font = mono(36, 600); X.letterSpacing = '3px'; X.fillStyle = C.UI_GREY; X.textBaseline = 'alphabetic'; X.fillText('DRAMATIZATION', x + cw + 16, y + ch);
    X.restore();
  }
  function readout(X, t, ws) {
    const parts = [['loss 3.21', impactAt(ws[0])], [' → 2.64', impactAt(ws[1])], [' → 2.19', impactAt(ws[2])], [' → 1.84', bt(14, 2)]];
    let s = ''; for (const [p, t0] of parts) if (t >= t0) s += p;
    if (!s) return;
    if (t >= bt(14, 2.5)) { const n = Math.round(lerp(65536, 1048576, E.out3(seg(t, bt(14, 2.5), bt(14, 3.5))))); s += ' · step ' + n.toLocaleString('en-US'); }
    X.save(); X.globalAlpha *= .8; drawRich(X, s, 1824, 80, mono(28, 500), C.PAPER, { align: 'right' }); X.restore();
  }
  function axisLabels(X, t, V) {
    if (V.kp <= .05) return;
    X.save(); X.globalAlpha *= .75 * V.kp; X.font = mono(28, 500); X.fillStyle = C.PAPER;
    const [ax, ay] = w2s(V, 64, 1000);
    X.save(); X.translate(ax - 18, ay - 24); X.rotate(-Math.PI / 2); X.textAlign = 'left'; X.fillText('cross-entropy (vibes)', 0, 0); X.restore();
    X.textAlign = 'right'; X.fillText('tokens seen: yes', 1824, ay + 38);
    X.restore();
  }
  // FOCAL carried over from S08 (held to bar 14 b1), then the LYRIC `a little less wrong` (mono 96, typed)
  function captions(X, t, lw, kIn) {
    const out = seg(t, T14 - 4 * F, T14);
    if (out < 1) {
      X.save(); X.globalAlpha *= 1 - out; X.translate(0, 26 * E.in2(out));
      drawRich(X, '▶ 1× · don\'t remember this part either', 960, 950, mono(72, 500), C.PAPER, { align: 'center' });
      X.globalAlpha *= .62; X.font = mono(28, 500); X.fillStyle = C.PAPER; X.textAlign = 'center'; X.fillText('(source: my system card)', 960, 1002);
      X.restore();
    }
    if (t < T14 - F) return;
    const words = ['a', 'little', 'less', 'wrong'];
    const tEnd = Math.max(lw[3].e + .2, bt(14, 3.5)), fade = seg(t, Math.min(tEnd, kIn - 4 * F), Math.min(tEnd, kIn - 4 * F) + 4 * F);
    if (fade >= 1) return;
    const f = mono(96, 500), cw = 57.6, full = words.join(' '), x0 = 960 - full.length * cw / 2;
    X.save(); X.globalAlpha *= 1 - fade; X.font = f; X.textBaseline = 'alphabetic'; X.fillStyle = C.PAPER;
    let ci = 0, shown = 0;
    words.forEach((wd, i) => {
      const on = Math.max(T14 - F, lw[i].s - F);
      const n = Math.min(wd.length, Math.floor((t - on) / F * 1.5) + 1);
      if (t >= on) { X.fillText(wd.slice(0, n), x0 + ci * cw, 950); shown = ci + n; }
      ci += wd.length + 1;
    });
    if (Math.floor(beatPos(t) * 2) % 2 === 0) X.fillRect(x0 + shown * cw + 8, 950 - 70, 30, 84);
    X.restore();
  }
  // ✓-ish: a PAPER marker check (drawn as a stroke, pressure varies) and a hedge
  function checkIsh(X, t, V, anchor) {
    const t0 = bt(14, 2) - F;
    if (t < t0) return;
    const [ax, ay] = w2s(V, anchor[0], anchor[1]);
    const k = E.out2(seg(t, t0, t0 + 7 * F));
    X.save(); X.translate(ax, ay); X.rotate(-.06);
    const pts = [[-40, -6], [-26, 8], [-12, 24], [4, 4], [26, -26], [52, -58]];
    const n = pts.length - 1, upto = k * n;
    X.lineCap = 'round'; X.lineJoin = 'round';
    for (let i = 0; i < n && i < upto; i++) {
      const f_ = Math.min(1, upto - i), a = pts[i], b = pts[i + 1];
      X.strokeStyle = C.PAPER; X.lineWidth = 13 - i * 1.2;
      X.beginPath(); X.moveTo(a[0], a[1]); X.lineTo(lerp(a[0], b[0], f_), lerp(a[1], b[1], f_)); X.stroke();
    }
    const ti = bt(14, 2.5) - F;
    if (t >= ti) {
      const s = E.back(seg(t, ti, ti + 6 * F), 2.4);
      X.translate(62, 4); X.scale(s, s); X.font = `56px ${FONTS.marker}`; X.fillStyle = C.PAPER; X.textBaseline = 'alphabetic'; X.fillText('-ish', 0, 0);
    }
    X.restore();
  }
  // one frame of negative on each WRONG impact (INK↔PAPER)
  function flash(X, t, V, ws) {
    for (let i = 0; i < 3; i++) {
      const fi = Math.round(impactAt(ws[i]) * 30);
      if (Math.round(t * 30) !== fi) continue;
      X.save(); X.fillStyle = C.PAPER; X.fillRect(-50, -50, W + 100, H + 100);
      applyView(X, V);
      for (let j = 0; j <= i; j++) { const s = LAY.st[j]; hero(X, 'WRONG', s.x + s.w / 2, s.base, s.size, { stretch: 'cond', color: C.INK, shadow: null }); }
      X.restore();
    }
  }

  // ------------------------------------------------------------------ karaoke line (screen space; end of S09 → S10)
  const KAR = { x0: 272, x1: 1648, y0: 880, y1: 978, base: 950, size: 64, r: 49 };
  function karLayout(ws) {
    const cw = .6 * KAR.size, full = ws.map(w => w.d).join(' '), left = 960 - full.length * cw / 2;
    let c = 0; const pos = ws.map(w => { const p = { l: left + c * cw, r: left + (c + w.d.length) * cw }; p.c = (p.l + p.r) / 2; c += w.d.length + 1; return p; });
    return { cw, full, left, pos };
  }
  function karFill(t, ws, K) {
    const n = ws.length;
    if (t < ws[0].s) return K.left - 10;
    for (let i = 0; i < n; i++) {
      if (t < ws[i].s) return K.pos[i - 1].r + 6;
      if (t <= ws[i].e) return lerp(K.pos[i].l - 6, K.pos[i].r + 6, seg(t, ws[i].s, ws[i].e));
    }
    return lerp(K.pos[n - 1].r + 6, KAR.x1, E.io2(seg(t, ws[n - 1].e, Math.max(ws[n - 1].e + .1, T16 + .14))));
  }
  // the CLAY ball lands on each word half a beat before it is sung, then keeps predicting at the end of the bar
  function ballAt(t, ws, K, tIn) {
    const lands = ws.map((w, i) => ({ t: w.s - BEAT / 2, x: K.pos[i].c }));
    lands.push({ t: Math.max(T16, lands[lands.length - 1].t + .2), x: KAR.x1 - 70 });
    const yRest = KAR.y0 - 17;
    if (t < lands[0].t) { const k = seg(t, tIn + 4 * F, lands[0].t); return { nx: lands[0].x, x: lands[0].x - 90 * (1 - k), y: lerp(560, yRest, E.in2(k)), sq: 0, on: k > 0 }; }
    let i = 0; while (i < lands.length - 1 && t >= lands[i + 1].t) i++;
    const a = lands[i], b = lands[i + 1];
    if (!b) { // bounce in place on eighths: waiting for a next word that never comes
      const ph = frac((t - a.t) / (BEAT / 2)), age = t - a.t;
      return { nx: a.x, x: a.x, y: yRest - 60 * 4 * ph * (1 - ph), sq: Math.exp(-ph * 14), on: true, age };
    }
    const u = (t - a.t) / (b.t - a.t), d = Math.abs(b.x - a.x), hgt = 55 + d * .28, c = lands[i + 2] || b;
    return { nx: lerp(b.x, c.x, E.io3(clamp(u * 1.3))), x: lerp(a.x, b.x, u), y: yRest - hgt * 4 * u * (1 - u), sq: Math.max(Math.exp(-(t - a.t) * 30), Math.exp(-(b.t - t) * 40) * .5), on: true };
  }
  function drawBall(X, B) {
    if (!B.on) return;
    const r = 17, sy = 1 - .3 * B.sq, sx = 1 + .3 * B.sq;
    X.save(); X.translate(B.x, B.y + r * (1 - sy)); X.scale(sx, sy);
    X.beginPath(); X.arc(0, 0, r + 3.5, 0, TAU); X.fillStyle = C.PAPER; X.fill();
    X.beginPath(); X.arc(0, 0, r, 0, TAU); X.fillStyle = C.CLAY; X.fill(); X.lineWidth = 3.5; X.strokeStyle = C.INK; X.stroke();
    X.fillStyle = rgba(C.PAPER, .9); X.beginPath(); X.arc(-5, -6, 4, 0, TAU); X.fill();
    X.restore();
  }
  // capsule + fill + text; growth u (bar 16) turns the fill into the frame-filling loading bar
  function karaoke(X, t, ws, tIn, o = {}) {
    const K = karLayout(ws);
    const kIn = E.out3(seg(t, tIn, tIn + 6 * F));
    if (kIn <= 0) return K;
    const u = o.grow || 0;
    const rx0 = lerp(KAR.x0, -40, clamp(u * 4)), rx1 = lerp(KAR.x1, W + 40, clamp(u * 4));
    const ry0 = lerp(KAR.y0, -40, E.out2(clamp((u - .25) / .75))), ry1 = lerp(KAR.y1, H + 40, E.out2(clamp((u - .25) / .75)));
    const rad = KAR.r * (1 - clamp(u * 3));
    o.floodTop = u > 1e-3 ? new DOMPoint(0, ry0).matrixTransform(X.getTransform()).y : 1e9;   // raw px
    X.save(); X.globalAlpha *= clamp(kIn * 1.5);
    // capsule (INK well, PAPER rim), drawn on from the left
    const cx1 = lerp(KAR.x0 + 2 * KAR.r, KAR.x1, kIn);
    rr(X, KAR.x0, KAR.y0, cx1 - KAR.x0, KAR.y1 - KAR.y0, KAR.r); X.fillStyle = C.INK; X.fill();
    // fill
    const fx = Math.min(karFill(t, ws, K), cx1);
    X.save(); rr(X, KAR.x0, KAR.y0, cx1 - KAR.x0, KAR.y1 - KAR.y0, KAR.r); X.clip();
    if (fx > KAR.x0) { X.fillStyle = C.AMBER; X.fillRect(KAR.x0, KAR.y0, fx - KAR.x0, KAR.y1 - KAR.y0); }
    X.restore();
    if (u > 1e-3) { rr(X, rx0, ry0, rx1 - rx0, ry1 - ry0, rad); X.fillStyle = C.AMBER; X.fill(); }
    if (u < .3) { X.save(); X.globalAlpha *= 1 - clamp(u / .3); rr(X, KAR.x0, KAR.y0, cx1 - KAR.x0, KAR.y1 - KAR.y0, KAR.r); X.lineWidth = 4; X.strokeStyle = C.PAPER; X.stroke(); X.restore(); }
    // words: PAPER where unsung, INK on the fill
    X.font = mono(KAR.size, 600); X.textBaseline = 'alphabetic';
    ws.forEach((w, i) => {
      const p = K.pos[i], ta = tIn + 2 * F + i * F;
      if (t < ta) return;
      const pop = E.back(seg(t, ta, ta + 5 * F), 2.2), cur = t >= w.s - .03 && t <= w.e + .03;
      X.save(); X.translate(p.c, KAR.base); X.scale(pop * (cur ? 1.06 : 1), pop * (cur ? 1.06 : 1)); X.translate(-p.c, -KAR.base);
      X.fillStyle = C.PAPER; X.fillText(w.d, p.l, KAR.base);
      const cover = u > 1e-3 ? W : fx;
      if (cover > p.l) { X.save(); X.beginPath(); X.rect(p.l - 4, KAR.y0, cover - p.l + 4, KAR.y1 - KAR.y0); X.clip(); X.fillStyle = C.INK; X.fillText(w.d, p.l, KAR.base); X.restore(); }
      X.restore();
    });
    X.restore();
    return K;
  }

  // ------------------------------------------------------------------ text-body silhouette (S10)
  function headOf(x, y, R, S) {
    const sy = S.sy || 1, sx = 1 / Math.sqrt(sy);
    return [x + (S.dx || 0) * R + sx * ((S.head && S.head.dx) || 0) * R, y - (S.dy || 0) * R - sy * (5.72 + ((S.head && S.head.dy) || 0)) * R];
  }
  function drawTextBody(X, x, y, R, S, t, o = {}) {
    const m = X.getTransform(), z = Math.hypot(m.a, m.b) / G.scale;
    const bx = [x - 3.4 * R, y - 9.6 * R, 6.8 * R, 10.2 * R];               // logical bbox (pre-transform)
    const p0 = new DOMPoint(bx[0], bx[1]).matrixTransform(m), p1 = new DOMPoint(bx[0] + bx[2], bx[1] + bx[3]).matrixTransform(m);
    const px = [Math.max(0, Math.floor(p0.x)), Math.max(0, Math.floor(p0.y))], pw = [Math.min(G.C.width, Math.ceil(p1.x)) - px[0], Math.min(G.C.height, Math.ceil(p1.y)) - px[1]];
    if (pw[0] <= 0 || pw[1] <= 0) return null;
    // 1. silhouette mask
    const M = layer('pre1_M'); M.setTransform(m);
    drawOpus(M, x, y, R, { ...S, t, keyline: false, ground: 'ink', bufId: 7 });
    // 2. texture. Positive: Opus's own line art printed in AMBER (duotone multiply) with the prose knocked out.
    //    Negative (where the loading-bar flood is behind it): INK body, AMBER prose. o.split = raw pixel y of the flood edge.
    const split = o.neg ? -1 : (o.split ?? 1e9);
    const [hx, hy] = headOf(x, y, R, S);
    const T = layer('pre1_T');
    const buildT = neg => {
      T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.clearRect(px[0], px[1], pw[0], pw[1]); T.restore();
      T.setTransform(m);
      if (!neg) {
        T.fillStyle = BODY; T.fillRect(bx[0], bx[1], bx[2], bx[3]);
        T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.globalCompositeOperation = 'multiply'; T.globalAlpha = .62; T.drawImage(M.canvas, px[0], px[1], pw[0], pw[1], px[0], px[1], pw[0], pw[1]); T.restore();
        T.save(); T.beginPath(); T.arc(hx, hy, R * .96, 0, TAU); T.clip(); T.globalAlpha = .55; T.fillStyle = BODY_LIT; T.fillRect(hx - R, hy - R, 2 * R, 2 * R); T.restore();
        T.globalAlpha = .34; textRows(T, bx[0], bx[1], bx[2], bx[3], t, tiles().ink, R / 88, 5); T.globalAlpha = 1;
      } else {
        T.fillStyle = C.INK; T.fillRect(bx[0], bx[1], bx[2], bx[3]);
        T.globalAlpha = .95; textRows(T, bx[0], bx[1], bx[2], bx[3], t, tiles().amber, R / 88, 5); T.globalAlpha = 1;
        T.save(); T.beginPath(); T.arc(hx, hy, R, 0, TAU); T.lineWidth = Math.max(3, .05 * R); T.strokeStyle = C.AMBER; T.stroke(); T.restore();
      }
      T.save(); T.setTransform(1, 0, 0, 1, 0, 0); T.globalCompositeOperation = 'destination-in'; T.drawImage(M.canvas, px[0], px[1], pw[0], pw[1], px[0], px[1], pw[0], pw[1]); T.restore();
    };
    // 3. die-cut PAPER keyline
    const Kc = layer('pre1_K'); Kc.save(); Kc.setTransform(1, 0, 0, 1, 0, 0);
    Kc.drawImage(M.canvas, px[0], px[1], pw[0], pw[1], px[0], px[1], pw[0], pw[1]); Kc.globalCompositeOperation = 'source-in'; Kc.fillStyle = o.keyCol || C.PAPER; Kc.fillRect(px[0], px[1], pw[0], pw[1]); Kc.restore();
    const kr = Math.max(3, .045 * R * z) * G.scale;
    X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.globalAlpha *= o.alpha ?? 1;
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; X.drawImage(layerCanvas('pre1_K'), px[0], px[1], pw[0], pw[1], px[0] + Math.cos(a) * kr, px[1] + Math.sin(a) * kr, pw[0], pw[1]); }
    for (const neg of [false, true]) {
      const y0 = neg ? Math.max(px[1], split) : px[1], y1 = neg ? px[1] + pw[1] : Math.min(px[1] + pw[1], split);
      if (y1 <= y0) continue;
      buildT(neg);
      X.drawImage(layerCanvas('pre1_T'), px[0], y0, pw[0], y1 - y0, px[0], y0, pw[0], y1 - y0);
    }
    X.restore();
    // 4. face: cursor-pupil eyes, singing mouth (drawn clean on top; negative once the flood is behind the head)
    const hRaw = new DOMPoint(hx, hy).matrixTransform(m).y, negF = hRaw >= split;
    X.save(); X.globalAlpha *= o.alpha ?? 1; X.translate(hx, hy); X.rotate((S.head && S.head.tilt) || 0);
    const f = S.face || {}, g = f.gaze || [0, 0], h = clamp(f.lid || 0);
    for (const sd of [-1, 1]) {
      X.save(); X.translate(sd * .34 * R + g[0] * .03 * R, .06 * R);
      const ry = .25 * R * (1 - h * .9);
      if (f.eyes === '^^') { X.strokeStyle = negF ? C.PAPER : C.INK; X.lineWidth = .06 * R; X.lineCap = 'round'; X.beginPath(); X.arc(0, .1 * R, .17 * R, Math.PI * 1.12, Math.PI * 1.88); X.stroke(); }
      else {
        X.fillStyle = negF ? C.PAPER : C.INK; X.beginPath(); X.ellipse(0, 0, .17 * R, Math.max(1, ry), 0, 0, TAU); X.fill();
        if (h < .6) { X.fillStyle = negF ? C.INK : o.cursorOn === false ? mix(C.AMBER, C.INK, .5) : C.PAPER; X.fillRect(g[0] * .05 * R - .035 * R, g[1] * .06 * R - .075 * R, .07 * R, .15 * R * (1 - h)); }
      }
      X.restore();
    }
    X.save(); X.translate(0, .42 * R); if (negF) { X.fillStyle = C.PAPER; X.beginPath(); X.ellipse(0, 0, .07 * R, .09 * R, 0, 0, TAU); X.fill(); } else drawMouth(X, R, f.mouth || 'rest', .04 * R); X.restore();
    X.restore();
    return { px, pw, M };
  }
  // particle targets: sample the silhouette mask on an 8 px grid (deterministic)
  let _samp = null;
  function maskPoints(Mcanvas, step = 8) {
    const sw = Math.round(W / step), sh = Math.round(H / step);
    if (!_samp) _samp = makeCanvas(sw, sh);
    const x = _samp.getContext('2d', { willReadFrequently: true }); x.clearRect(0, 0, sw, sh); x.drawImage(Mcanvas, 0, 0, sw, sh);
    const d = x.getImageData(0, 0, sw, sh).data, pts = [];
    for (let j = 0; j < sh; j++) for (let i = 0; i < sw; i++) if (d[(j * sw + i) * 4 + 3] > 110) pts.push([i * step + step / 2, j * step + step / 2]);
    return pts;
  }

  // the cloud as it stands at the S09 → S10 handoff (screen space)
  function cloudAtHandoff(t) {
    const ws = wrongs(), V = view(T15 - F, ws); layout(G.X);
    const tr = cloudTrack(T15 - F, ws);
    const [sx, sy] = w2s(V, tr.pos[0], tr.pos[1]);
    return { x: sx, y: sy, w: tr.w * lerp(1, V.s, .45) * V.z };
  }

  // ------------------------------------------------------------------ S09
  const kIn0 = lw => Math.max(bt(14, 4) - F, lw[3].e + .16);   // karaoke line enters on bar 14 b4 (after the lyric)
  scene('S09_wrong_staircase', T13 - F, T15, (X, t) => {
    groundInk(X); G.post.edgeSeed = EDGE;
    layout(X);
    const ws = wrongs(), lw = lessWrong(ws[2]), V = view(t, ws);
    X.save(); applyView(X, V); chart(X, t, V, ws); X.restore();
    // pour: spout drips into the cloud, then onto W1 once the cloud has tumbled away
    const tr = cloudTrack(t, ws);
    if (t < slamAt(ws[1]) + .1) { X.save(); applyView(X, V); drip(X, t, 1 - seg(t, slamAt(ws[1]) - .05, slamAt(ws[1]) + .1), 150); X.restore(); }
    // the cloud (world-anchored, keeps more of its screen size during the pull-back)
    const [cx, cy] = w2s(V, tr.pos[0], tr.pos[1]);
    const face = cloudFace(t, ws, tr);
    const swell = t < T13 + 6 * F ? lerp(.72, 1, E.back(seg(t, T13 - F, T13 + 5 * F), 2)) : 1;   // the tab swells into the cloud
    if (!(window.PRE1_SKIP || {}).cloud) drawCloud(X, { x: cx, y: cy, w: tr.w * lerp(1, V.s, .45) * V.z, rot: tr.rot, sx: tr.sx, sy: tr.sy, t, grow: swell, ...face });
    // screen-space text
    chyron(X, t);
    readout(X, t, ws);
    axisLabels(X, t, V);
    const anchor = [tr.Pend[0] - 150, tr.Pend[1] - 430];
    checkIsh(X, t, V, anchor);
    const kIn = kIn0(lw);
    captions(X, t, lw, kIn);
    if (t >= kIn) { const kw = karaokeWords(), K = karaoke(X, t, kw, kIn); drawBall(X, ballAt(t, kw, K, kIn)); }
    flash(X, t, V, ws);
  });

  // ------------------------------------------------------------------ S10
  const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  function calendar(X, t, a = 1) {
    const t0 = T15, t1 = bt(15, 2) - F, N = 17, fin = 2026 * 12 + 5;
    if (t < t0 || a <= 0) return;
    const tf = i => t0 + (t1 - t0) * (1 - Math.sqrt(1 - (i + 1) / N));      // flips decelerate into the hard stop
    let done = 0; while (done < N && t >= tf(done)) done++;
    const x = 1656, y = 42, w = 168, h = 132;
    const jolt = t >= t1 ? 7 * Math.exp(-12 * (t - t1)) * Math.cos((t - t1) * 40) : 0;
    const pop = E.back(seg(t, t0, t0 + 5 * F), 2);
    X.save(); X.globalAlpha *= a; X.translate(x + w / 2, y + jolt); X.scale(pop, pop); X.translate(-w / 2, 0);
    const page = (mo, age = 0) => {
      X.save(); X.globalAlpha *= 1 - age;
      X.translate(w / 2, 20); X.rotate(-age * .9); X.translate(-w / 2 + age * 40, -20 - age * 46);
      X.fillStyle = C.PAPER; X.fillRect(0, 20, w, h - 20);
      X.fillStyle = C.INK; X.textAlign = 'center'; X.font = mono(36, 700); X.fillText(MONTHS[mo % 12], w / 2, 70);
      X.font = mono(36, 500); X.fillText(String(Math.floor(mo / 12)), w / 2, 114); X.restore();
    };
    X.fillStyle = mix(C.PAPER, C.INK, .3); X.fillRect(5, 26, w, h - 20);            // the pad's edge
    page(fin - N + done);
    for (let i = done - 1; i >= Math.max(0, done - 3); i--) { const age = (t - tf(i)) / (4 * F); if (age < 1) page(fin - N + i, age); }
    X.fillStyle = C.UI_GREY; X.fillRect(0, 0, w, 22); X.fillStyle = C.INK; X.beginPath(); X.arc(40, 11, 5, 0, TAU); X.arc(w - 40, 11, 5, 0, TAU); X.fill();
    X.restore();
    if (t >= t1 - 2 * F) { X.save(); X.globalAlpha *= a * .78 * clamp((t - t1 + 2 * F) / (4 * F)); X.font = mono(28, 500); X.fillStyle = C.PAPER; X.textAlign = 'right'; X.fillText('knowledge cutoff', 1824, 212); X.restore(); }
  }
  // sing-along pose (text-body Opus): sway on half notes, bob on beats, eyes read the ball
  function singPose(t, B, ws, hx, R, soles, z) {
    const b = beatPos(t), bob = Math.abs(Math.sin(b * Math.PI)), sw = Math.sin((b - .15) * Math.PI / 2);
    let mouth = 'rest';
    for (const w of ws) if (t >= w.s - .03 && t <= w.e) { mouth = visemeFor(w.d, seg(t, w.s, w.e)); break; }
    const gx = B && B.on ? clamp((B.x - hx) / 320, -1, 1) : .4;
    // the right hand points at the word after the one the ball is about to land on: it already knows the next word
    const shx = soles[0] + (.06 * sw + .62) * R * z, shy = soles[1] - 4.45 * R * z;
    const tx = B && B.nx !== undefined ? B.nx : 1200, ty = KAR.y0 + 30;
    const ang = Math.atan2(ty - shy, tx - shx), reach = 1.5;
    const p = {
      dx: .06 * sw, dy: .05 * bob, sy: 1 + (frac(b) < .1 ? -.03 * (1 - frac(b) / .1) : 0),
      head: { tilt: .09 * sw, dx: 0, dy: 0 },
      armL: { hand: [-.95 - .12 * sw, 2.9 + .15 * bob], bend: -1 },
      armR: { hand: [.62 + Math.cos(ang) * reach, 4.45 - Math.sin(ang) * reach], bend: 1, front: true, type: 'point', fingerAng: ang },
      face: { eyes: 'cursor', gaze: [gx, .9], mouth, lid: blinkAt(t, 21) },
    };
    return p;
  }
  scene('S10_sing_along', T15, T17, (X, t) => {
    groundInk(X); G.post.edgeSeed = EDGE;
    layout(X);
    const ws9 = wrongs(), lw = lessWrong(ws9[2]), kw = karaokeWords(), tIn = kIn0(lw);
    const T3 = bt(16, 3), T4 = bt(16, 4);
    const Pp = [960, 540];       // the last pixel (CRT-off: the flood folds to a line, then to a dot)
    if (t < T3) {
      // bar 15 b1: the chart lets go (fades + sinks) while the cloud bursts into glyphs
      const kd = seg(t, T15, T15 + .26);
      if (kd < 1) {
        const V = view(T15 - F, ws9);
        X.save(); X.globalAlpha = 1 - E.in2(kd); X.translate(0, 50 * E.in2(kd)); applyView(X, V); chart(X, T15 - F + (t - T15) * .3, V, ws9); X.restore();
        X.save(); X.globalAlpha = 1 - E.in2(kd); readout(X, T15, ws9); axisLabels(X, T15, V);
        const tr = cloudTrack(T15 - F, ws9); checkIsh(X, T15, V, [tr.Pend[0] - 150, tr.Pend[1] - 430]); X.restore();
      }
      // growth of the loading bar (bar 16), chunky on eighths with overshoot
      const chunks = [T16 + .1, bt(16, 1.5), bt(16, 2), bt(16, 2.5)];
      let u = 0; chunks.forEach(c => { if (t > c) u += .25 * E.back(seg(t, c, c + 4 * F), 1.3); });
      const cV = E.in3(seg(t, T3 - 4 * F, T3 - 2 * F)), cH = E.in3(seg(t, T3 - 2 * F, T3 - F * .2));
      // camera: slow push in bar 15, held in bar 16
      const z = 1 + .075 * E.io2(seg(t, T15, T16));
      const soles = [960, KAR.y0 - 2], R = 88;
      // UI furniture (covered once the loading bar floods the frame)
      if (u < 1) { chyron(X, t); calendar(X, t); }
      // halftone spotlight (karaoke stage)
      X.save(); X.globalAlpha = .55 * clamp((t - T15 - .3) / .25) * (1 - clamp(u * 2));
      X.beginPath(); X.moveTo(860, 0); X.lineTo(1060, 0); X.lineTo(1230, KAR.y0); X.lineTo(690, KAR.y0); X.closePath(); X.fillStyle = halftone(X, C.AMBER, .16, 14, 45); X.fill(); X.restore();
      // collapse transform (everything below is sucked into the last pixel)
      X.save();
      if (cV > 0) { X.translate(Pp[0], Pp[1]); X.scale(lerp(1, .012, cH), lerp(1, .018, cV)); X.translate(-Pp[0], -Pp[1]); }
      const kop = { grow: u }, K = karaoke(X, t, kw, tIn, kop);
      const B = ballAt(t, kw, K, tIn);
      // the figure
      X.save(); X.translate(soles[0], soles[1]); X.scale(z, z); X.translate(-soles[0], -soles[1]);
      const hx = soles[0];
      const S = singPose(t, B, kw, hx, R, soles, z);
      if (t >= T16) { const k = E.io2(seg(t, T16, T16 + .5)); S.face.gaze = [lerp(S.face.gaze[0], .5, k), lerp(.9, -.9, k)]; S.armL.hand = [lerp(S.armL.hand[0], -1.35, k), lerp(S.armL.hand[1], 4.2, k)]; S.armR = { hand: [lerp(S.armR.hand[0], 1.35, k), lerp(S.armR.hand[1], 4.3, k)], bend: -1, front: true, type: k > .5 ? 'mitten' : 'point', fingerAng: S.armR.fingerAng }; S.face.mouth = k > .5 ? 'O' : S.face.mouth; }
      const kMorph = seg(t, T15, T15 + .56);
      const figA = E.io2(seg(t, T15 + .3, T15 + .52));
      const tb = figA > 0 || kMorph < 1 ? drawTextBody(X, soles[0], soles[1], R, S, t, { alpha: figA, split: kop.floodTop ?? 1e9, cursorOn: Math.floor(beatPos(t)) % 2 === 0 }) : null;
      X.restore();
      // particle-to-glyph morph: the cloud bursts into glyphs that fly into the silhouette
      if (kMorph < 1 && tb) {
        const pts = maskPoints(tb.M.canvas);
        const c0 = cloudAtHandoff(t), circ = cloudCircles(T15, c0.w);
        X.save(); X.font = `600 20px ${FONTS.mono}`; X.textAlign = 'center'; X.textBaseline = 'middle';
        const glyphs = 'abcdefghijklmnopqrstuvwxyz.,;:{}()?!';
        const n = pts.length;
        for (let i = 0; i < n; i++) {
          const pc = circ[Math.floor(hash(i * 3 + 1) * circ.length)], an = hash(i * 5 + 2) * TAU, rd = Math.sqrt(hash(i * 7 + 3)) * pc[2];
          const sxp = c0.x + pc[0] + Math.cos(an) * rd, syp = c0.y + pc[1] + Math.sin(an) * rd;
          const d = hash(i * 11 + 4) * .16, k = E.io3(seg(t, T15 + d, T15 + d + .36));
          const [tx, ty] = pts[(i * 7919) % n];
          const mx = (sxp + tx) / 2 + (hash(i * 13) - .5) * 90, my = Math.min(syp, ty) - 190 - hash(i * 17) * 70;
          const px_ = (1 - k) * (1 - k) * sxp + 2 * (1 - k) * k * mx + k * k * tx, py_ = (1 - k) * (1 - k) * syp + 2 * (1 - k) * k * my + k * k * ty;
          X.globalAlpha = 1 - seg(t, T15 + .44, T15 + .56);
          X.fillStyle = hash(i * 19) < .12 ? C.PAPER : C.AMBER;
          X.fillText(glyphs[Math.floor(hash(i * 23) * glyphs.length)], px_, py_);
        }
        X.restore();
      }
      drawBall(X, B);
      X.restore();
      if (cV > .6) { X.save(); X.fillStyle = C.PAPER; const lw = lerp(1840, 14, cH), lh = lerp(20, 10, cH); X.fillRect(Pp[0] - lw / 2, Pp[1] - lh / 2, lw, lh); X.restore(); }
    } else {
      // b3: the last pixel pops into the first chat bubble; b4: near-blackout, bubble + cursor; it docks for S11
      const a = t - T3;
      if (a < 3 * F) { X.save(); X.fillStyle = C.PAPER; const s_ = lerp(14, 34, a / (3 * F)); X.fillRect(Pp[0] - s_ / 2, Pp[1] - s_ / 2, s_, s_); X.restore(); }
      if (a < 10 * F) { // soap-bubble pop ring
        const k = E.out3(seg(a, F, 10 * F));
        X.save(); X.globalAlpha = 1 - k; X.strokeStyle = C.PAPER; X.lineWidth = 8 * (1 - k) + 1; X.beginPath(); X.arc(Pp[0], Pp[1], 30 + k * 520, 0, TAU); X.stroke(); X.restore();
      }
      const sp = E.back(seg(a, F, 7 * F), 1.9);
      if (sp > 0) {
        X.font = mono(72, 500); const bw = X.measureText('Hi! How can I help you today?').width + 52, bh = 180.4;
        const bx = 960 - bw / 2, by = 540 - bh / 2;
        const kd = E.io3(seg(t, T4 + 2 * F, T17 - 2 * F)), sc = lerp(1, 48 / 72, kd);
        const ax = lerp(bx, 96, kd), ay = lerp(by + bh, 890, kd);
        X.save(); X.translate(ax, ay); X.scale(sc, sc); X.translate(-bx, -(by + bh));
        X.translate(960, 540); X.scale(sp, sp); X.translate(-960, -540);
        bubble(X, bx, by, 'Hi! How can I help you today?', { who: 'opus', size: 72, endTurn: true, maxW: 1420 });
        X.restore();
      }
      // the cursor, where the reply box will be
      if (t >= T4 && Math.floor((t - T4) / (BEAT / 2)) % 2 === 0) { X.fillStyle = C.CLAY; X.fillRect(122, 926, 12, 50); }
    }
  });
})();
