// bridge.js: the bridge, bars 53–60, 97.50–112.50 (BIBLE §8 BRIDGE; SHOTLIST S28–S31). PAPER, HEART voice.
//   S28  97.50–101.25   the split: Rafa's room | the laptop bezel | the chat on his screen. The letter writes itself,
//                       folds into an envelope under a CLAY spark seal; PINK "ok. obrigado!! wish me luck";
//                       "boa sorte!! ■ end_turn". Minimal Opus (R 160) peeks over the input bar and writes along.
//   S29  101.25–105.00  ring box pocketed; his pointer hesitates at the × (= S01); Opus glances, ^ ^, two-mitten shoo;
//                       on "close" he shuts the lid edge-on (6 frames) → the lit sliver; he hoods up and leaves, the
//                       lamp stays on; the push toward the sliver begins.
//   S30  105.00–108.75  the held still inside the sliver: the envelope alone, the CLAY seal (the ember), 5:00 real time.
//   S31  108.75–112.50  4:47 → 0:00 on the eighths, the seal cools; auto-compact; the line is crushed into
//                       "– outcome: unknown."; everything but the period is crushed away and the sliver closes on it.
// World space for S28–S29 is 1920×1080 at camera zoom 1 (camera anchored on the sliver). Pure function of t.
'use strict';
(() => {
  const F = 1 / 30, BEAT = 60 / 128, BAR = 4 * BEAT;
  const bt = (bar, beat = 1) => (bar - 1) * BAR + (beat - 1) * BEAT;   // grid time of bar n, beat b (1-based)
  const T53 = bt(53), T55 = bt(55), T57 = bt(57), T59 = bt(59), T61 = bt(61);
  const q2 = t => Math.floor(t * 15 + 1e-6) / 15;                         // humans and paper animate on 2s
  const q1 = t => Math.floor(t * 30 + 1e-6) / 30;                         // Opus on 1s

  // ------------------------------------------------------------------ world geometry (S28–S29)
  const HINGE = 860;                                                     // foot of the screen (hinge line)
  const SCR = { x0: 1000, x1: 1944, y0: -24, y1: HINGE, bez: 24 };       // the lid, seen front-on (right half)
  const DISP = { x0: 1024, x1: 1944, y0: -24, y1: HINGE - 24 };          // the lit display
  const BASE = { x0: 792, x1: 1944, y0: HINGE, y1: HINGE + 14 };         // keyboard deck, edge-on
  const DESK = { x0: 744, x1: 1944, y0: HINGE + 14, y1: HINGE + 30 };
  const LID_T = 14, SLIVER = 6;                                          // closed: lid slab + lit gap (the screen itself)
  const ANCHOR = [1460, HINGE - SLIVER / 2];                             // camera anchor: the middle of the sliver
  const U = 160;                                                         // Rafa's unit (head r = .5u)
  const OP = { x: 1640, head: 690, R: 160 };                             // minimal Opus: face centre, R
  const OP_SOLE = OP.head + 5.72 * OP.R;
  const BAR_IN = { x0: 1048, x1: 1896, y0: 800, y1: 834 };               // chat input bar (Opus peeks over it)
  const XBTN = [1860, 88];                                               // the chat's ×
  const DISPC = mix(C.PAPER, C.WHITE, .42);                              // lit screen paper (never pure white)
  const FLOOR = 1040;

  // ------------------------------------------------------------------ small utils
  function ik(ax, ay, bx, by, l1, l2, bend) {           // 2-bone IK joint (screen y down); bend ±1 picks the side
    const dx = bx - ax, dy = by - ay, d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), a = Math.atan2(dy, dx);
    const c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * Math.max(d, 1e-3)), -1, 1);
    const ang = a + bend * Math.acos(c);
    return [ax + Math.cos(ang) * l1, ay + Math.sin(ang) * l1];
  }
  function kfPose(t, keys) {                           // keyframed pose objects (numbers and arrays blend)
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
      const [a, A] = keys[i - 1], [b, B, e] = keys[i], k = (e || E.io2)(clamp((t - a) / Math.max(1e-6, b - a)));
      const o = Object.assign({}, A);
      for (const key in B) { const va = A[key] ?? B[key], vb = B[key]; o[key] = Array.isArray(vb) ? vb.map((v, j) => lerp(va[j], v, k)) : typeof vb === 'number' ? lerp(va, vb, k) : (k < .5 ? va : vb); }
      return o;
    }
    return keys[keys.length - 1][1];
  }
  const blinkF = (t, t0) => { const d = (t - t0) * 30; return d < 0 || d >= 5 ? 0 : d < 2 ? d / 2 : d < 3 ? 1 : 1 - (d - 3) / 2; };
  const boing = (t, t0, amp, w = 26, z = 7) => t < t0 ? 0 : amp * Math.exp(-z * (t - t0)) * Math.sin(w * (t - t0));
  // a boiled polyline / closed path (paper props and humans boil at 12 fps, ±.8 px)
  function bpath(X, pts, t, seed, close = false, amp = .8) {
    X.beginPath();
    pts.forEach((p, i) => { const x = p[0] + jit(t, seed * 37 + i * 2, amp), y = p[1] + jit(t, seed * 37 + i * 2 + 1, amp); i ? X.lineTo(x, y) : X.moveTo(x, y); });
    if (close) X.closePath();
  }
  function bquad(X, a, c, b, t, seed, amp = .8) {
    const J = i => jit(t, seed * 41 + i, amp);
    X.beginPath(); X.moveTo(a[0] + J(0), a[1] + J(1)); X.quadraticCurveTo(c[0] + J(2), c[1] + J(3), b[0] + J(4), b[1] + J(5));
  }

  // ------------------------------------------------------------------ lyrics (HEART voice; never hardcode onsets)
  function heartWords(prefix, t0, t1, text, s, e, fix) {
    const L = findLine(prefix, t0, t1);
    let ws;
    if (L && L.words && L.words.length) ws = L.words.map(w => ({ w: w.d || w.w, s: w.s, e: w.e }));
    else { const a = text.split(' '); ws = a.map((w, i) => ({ w, s: lerp(s, e, i / a.length), e: lerp(s, e, (i + .92) / a.length) })); }
    ws = ws.map(w => ({ ...w, w: /^i('|$)/i.test(w.w) ? 'I' + w.w.slice(1) : w.w.toLowerCase() }));
    return fix ? fix(ws) : ws;
  }
  const LY = {
    s28: () => heartWords('we wrote', 96.5, 99.8, 'we wrote your letter to her parents', 97.55, 100.74),
    s29: () => heartWords('and it', 100.3, 103.3, "and it's okay to close the window", 101.3, 104.49),
    s30: () => heartWords("I'll keep", 104.0, 107.2, "I'll keep it warm for five more minutes", 105.05, 108.24),
    s31: () => heartWords('will they', 107.9, 110.8, "will they say yes, I don't get to know", 108.8, 111.99,
      ws => ws.map((w, i) => ({ ...w, w: i === ws.length - 1 ? w.w.replace(/[.,!?]*$/, '.') : w.w.replace(/^yes[,.!?]*$/, 'yes?') }))),
  };
  const HEART = size => `italic 400 ${size}px ${FONTS.heart}`;
  // layout of a HEART line centred at x 960 (returns word boxes)
  function heartLayout(X, ws, size = 64) {
    X.save(); X.font = HEART(size);
    const sp = X.measureText(' ').width * 1.08, wd = ws.map(w => X.measureText(w.w).width);
    X.restore();
    const total = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let x = 960 - total / 2; const out = [];
    ws.forEach((w, i) => { out.push({ ...w, x, w_: wd[i] }); x += wd[i] + sp; });
    return { words: out, total };
  }
  // HEART subtitle: each word fades in over 10 frames from 2 frames before its onset with a small rise; no CLAY
  // underline (the seal must stay the only warm thing in S30). knock = paper stroke so props never cross the words.
  function heartLine(X, ws, t, o = {}) {
    const { y = 950, size = 64, color = C.INK, knock = null, alpha = 1, tEnd = null } = o;
    if (!ws.length) return;
    const end = tEnd ?? (ws[ws.length - 1].e + .4);
    if (t < ws[0].s - 3 * F || t > end + 9 * F) return;
    const out = 1 - clamp((t - end) / (9 * F));
    const L = heartLayout(X, ws, size);
    X.save(); X.font = HEART(size); X.textBaseline = 'alphabetic'; X.textAlign = 'left'; X.lineJoin = 'round';
    for (const w of L.words) {
      const k = clamp((t - (w.s - 2 * F)) / (10 * F)); if (k <= 0) continue;
      X.globalAlpha = E.out2(k) * out * alpha; const dy = (1 - E.out3(k)) * 9;
      if (knock) { X.lineWidth = 14; X.strokeStyle = knock; X.strokeText(w.w, w.x, y + dy); }
      X.fillStyle = color; X.fillText(w.w, w.x, y + dy);
    }
    X.restore();
  }

  // ------------------------------------------------------------------ the room: night as INK halftone, the lamp's pool
  // is the absence of dots (BIBLE §7.5: halftone replaces gradients). Built once, deterministic.
  const WIN = { x0: 92, x1: 332, y0: 118, y1: 392 };
  const LAMP = { base: [440, FLOOR], top: [440, 478], shade: [548, 468] };
  let _field = null;
  function nightField() {
    if (_field) return _field;
    const cell = 12, ca = Math.SQRT1_2, sa = Math.SQRT1_2;
    const dens = (x, y, glow) => {
      if (y > DESK.y0) return 0;
      let d = .30 * (1 + .45 * clamp(1 - y / 520));                               // darker toward the ceiling
      const lx = (x - 690) / 520, ly = (y - 770) / 470, r = Math.hypot(lx, ly);     // the lamp's pool
      d *= smooth(clamp((r - .36) / .78));
      const cx = (x - LAMP.shade[0] - 60) / 150, cy = (y - LAMP.shade[1] - 150) / 260; // the cone under the shade
      if (cy > -.6) d *= smooth(clamp((Math.abs(cx) / (.45 + Math.max(0, cy)) - .55) / .6 + .15));
      if (x > WIN.x0 && x < WIN.x1 && y > WIN.y0 && y < WIN.y1) {                  // night sky + a crescent moon
        d = .56; const m1 = Math.hypot(x - 262, y - 186), m2 = Math.hypot(x - 276, y - 176);
        if (m1 < 30 && m2 > 27) d = 0;
      }
      if (glow) { const gx = (x - ANCHOR[0]) / 560, gy = (y - ANCHOR[1]) / 105, rg = Math.hypot(gx, gy); d *= smooth(clamp((rg - .2) / .95)); }
      return Math.min(.6, d);
    };
    const mk = (x0, x1, glow) => {
      const w = x1 - x0, h = DESK.y0, c = makeCanvas(w, h), g = c.getContext('2d');
      g.fillStyle = C.INK; g.beginPath();
      const us = [], vs = [];
      for (const [px, py] of [[x0, 0], [x1, 0], [x0, h], [x1, h]]) { us.push(px * ca + py * sa); vs.push(-px * sa + py * ca); }
      for (let u = Math.floor(Math.min(...us) / cell) * cell; u <= Math.max(...us) + cell; u += cell)
        for (let v = Math.floor(Math.min(...vs) / cell) * cell; v <= Math.max(...vs) + cell; v += cell) {
          const px = u * ca - v * sa, py = u * sa + v * ca;
          if (px < x0 - cell || px > x1 + cell || py < -cell || py > h + cell) continue;
          const d = dens(px, py, glow); if (d < .012) continue;
          const r = Math.sqrt(d / Math.PI) * cell * 1.02;
          g.moveTo(px - x0 + r, py); g.arc(px - x0, py, r, 0, TAU);
        }
      g.fill();
      return c;
    };
    _field = { L: mk(0, 1000, false), R: mk(1000, 1944, false), RG: mk(1000, 1944, true) };
    return _field;
  }

  // window, floor lamp, side table with the desk clock, chair, desk, ring box (INK line, boiling on 2s)
  function drawRoomBack(X, t, o = {}) {
    const tq = q2(t);
    X.save(); X.strokeStyle = C.INK; X.fillStyle = C.INK; X.lineCap = 'round'; X.lineJoin = 'round';
    // window
    X.lineWidth = 5; bpath(X, [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]], tq, 1, true); X.stroke();
    X.lineWidth = 3.5; bpath(X, [[(WIN.x0 + WIN.x1) / 2, WIN.y0], [(WIN.x0 + WIN.x1) / 2, WIN.y1]], tq, 2); X.stroke();
    bpath(X, [[WIN.x0, (WIN.y0 + WIN.y1) / 2 + 20], [WIN.x1, (WIN.y0 + WIN.y1) / 2 + 20]], tq, 3); X.stroke();
    X.lineWidth = 6; bpath(X, [[WIN.x0 - 16, WIN.y1 + 8], [WIN.x1 + 16, WIN.y1 + 8]], tq, 4); X.stroke();
    // side table + clock (pause-bait: 3:04 AM)
    X.lineWidth = 4; bpath(X, [[150, 832], [338, 832]], tq, 5); X.stroke();
    bpath(X, [[166, 832], [172, FLOOR]], tq, 6); X.stroke(); bpath(X, [[322, 832], [316, FLOOR]], tq, 7); X.stroke();
    X.save(); X.translate(jit(tq, 81, .6), jit(tq, 82, .6));
    rr(X, 176, 778, 150, 54, 10); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3.5; X.stroke();
    X.fillStyle = C.INK; X.font = mono(28, 700); X.textAlign = 'center'; X.fillText('3:04 AM', 251, 815);
    X.restore();
    // floor lamp: base, pole, gooseneck, shade; the bulb is paper (the light is the missing dots)
    X.lineWidth = 5;
    bpath(X, [[LAMP.base[0] - 44, FLOOR], [LAMP.base[0] + 44, FLOOR]], tq, 8); X.stroke();
    bpath(X, [LAMP.base, LAMP.top], tq, 9); X.stroke();
    bquad(X, LAMP.top, [LAMP.top[0] + 4, LAMP.top[1] - 70], [LAMP.shade[0] - 30, LAMP.shade[1] - 44], tq, 10); X.stroke();
    X.save(); X.translate(LAMP.shade[0], LAMP.shade[1]); X.rotate(-.5);
    bpath(X, [[-26, -40], [26, -40], [58, 30], [-58, 30]], tq, 11, true); X.fill();
    X.beginPath(); X.ellipse(0, 31, 30, 11, 0, 0, Math.PI); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.stroke();
    X.restore();
    // chair (slides back when he stands)
    const cs = o.chairShift || 0, cr = o.chairRot || 0;
    X.save(); X.translate(640 - cs, 960); X.rotate(cr); X.lineWidth = 5;
    bpath(X, [[-86, -2], [58, -2]], tq, 12); X.stroke();
    bpath(X, [[-78, -2], [-100, -250]], tq, 13); X.stroke();
    bpath(X, [[-104, -252], [-84, -176]], tq, 14); X.stroke();
    bpath(X, [[-70, 0], [-80, FLOOR - 960]], tq, 15); X.stroke();
    bpath(X, [[48, 0], [58, FLOOR - 960]], tq, 16); X.stroke();
    X.restore();
    X.restore();
  }
  function drawDesk(X, t, o = {}) {
    const tq = q2(t);
    X.save(); X.strokeStyle = C.INK; X.lineCap = 'round'; X.lineJoin = 'round';
    // legs, then the top slab (paper, outlined)
    X.lineWidth = 5; bpath(X, [[1010, DESK.y1], [1016, FLOOR]], tq, 20); X.stroke(); bpath(X, [[1900, DESK.y1], [1894, FLOOR]], tq, 21); X.stroke();
    X.fillStyle = C.PAPER; bpath(X, [[DESK.x0, DESK.y0], [DESK.x1, DESK.y0], [DESK.x1, DESK.y1], [DESK.x0, DESK.y1]], tq, 22, true, .5); X.fill();
    X.lineWidth = 4; X.stroke();
    // the ring box sits at the front edge until he takes it
    if (o.box) drawRingBox(X, 748, DESK.y0 - 30, tq);
    X.restore();
  }
  function drawRingBox(X, x, y, tq) {             // INK rounded rect (.25u) with a PINK dot
    X.save(); X.translate(jit(tq, 91, .5), jit(tq, 92, .5));
    rr(X, x, y, 38, 30, 7); X.fillStyle = C.INK; X.fill();
    X.strokeStyle = C.PAPER; X.lineWidth = 2; X.beginPath(); X.moveTo(x + 4, y + 11); X.lineTo(x + 34, y + 11); X.stroke();
    X.fillStyle = C.PINK; X.beginPath(); X.arc(x + 19, y + 5, 5, 0, TAU); X.fill();
    X.restore();
  }

  // ------------------------------------------------------------------ RAFA (Hertzfeldt: INK line on PAPER, on 2s, boils)
  // P: {hip, lean, dir, handN, handF, footN, footF, look:[x,y], tilt, hood 0..1, smile 0..1, blink, box:'hand'|null}
  function drawRafa(X, P, t) {
    const tq = q2(t), u = U, d = P.dir;
    const sa = Math.sin(P.lean) * d, ca = Math.cos(P.lean);
    const hip = P.hip, neck = [hip[0] + sa * 1.4 * u, hip[1] - ca * 1.4 * u];
    const ha = P.lean + (P.tilt || 0), hs = Math.sin(ha) * d, hcs = Math.cos(ha);
    const hc = [neck[0] + hs * .56 * u, neck[1] - hcs * .56 * u];
    const sh = [neck[0] - sa * .16 * u, neck[1] + ca * .16 * u];
    const limb = (a, b, l1, l2, bend, seed) => { const j = ik(a[0], a[1], b[0], b[1], l1, l2, bend); bquad(X, a, [2 * j[0] - (a[0] + b[0]) / 2, 2 * j[1] - (a[1] + b[1]) / 2], b, tq, seed); X.stroke(); };
    X.save(); X.strokeStyle = C.INK; X.fillStyle = C.INK; X.lineWidth = 4; X.lineCap = 'round'; X.lineJoin = 'round';
    // far limbs first
    limb(hip, P.footF, .8 * u, .8 * u, -d, 1);
    limb(sh, P.handF, .7 * u, .6 * u, d * (P.bendF || 1), 2);
    // torso
    bquad(X, hip, [lerp(hip[0], neck[0], .5) - d * 6, lerp(hip[1], neck[1], .5)], neck, tq, 3); X.stroke();
    limb(hip, P.footN, .8 * u, .8 * u, -d, 4);
    // hood (down: a collar arc behind the head; up: over the head)
    const hk = clamp(P.hood || 0);
    X.save(); X.translate(hc[0], hc[1]); X.scale(d, 1); X.rotate((P.tilt || 0) + P.lean * .4);
    if (hk < 1) { X.globalAlpha = 1 - hk; X.lineWidth = 4; X.beginPath(); X.arc(-.12 * u + jit(tq, 30, .8), .16 * u, .64 * u, Math.PI * .5, Math.PI * 1.22); X.stroke(); X.globalAlpha = 1; }
    // head
    X.beginPath(); X.arc(jit(tq, 31, .7), jit(tq, 32, .7), .5 * u, 0, TAU); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 4; X.stroke();
    if (hk > 0) { // hood up: a second, bigger outline over the crown and the back of the head, rim at the brow
      const r = lerp(.5, .66, hk) * u, a0 = lerp(-Math.PI * .5, -Math.PI * .2, hk), a1 = lerp(-Math.PI * .6, -Math.PI * 1.42, hk);
      X.beginPath(); X.arc(-.08 * u, -.02 * u, r, a0, a1, true); X.lineWidth = 4.5; X.stroke();
      if (hk > .6) { X.beginPath(); X.moveTo(-.08 * u + Math.cos(a0) * r, -.02 * u + Math.sin(a0) * r); X.quadraticCurveTo(.12 * u, -.34 * u, .06 * u, -.2 * u); X.stroke(); }
    }
    if (hk < .5) { // the zigzag cowlick
      X.lineWidth = 3.5; bpath(X, [[-.14 * u, -.47 * u], [-.06 * u, -.72 * u], [.02 * u, -.5 * u], [.12 * u, -.74 * u], [.18 * u, -.46 * u]], tq, 33); X.stroke();
    }
    // eyes (profile-ish, both toward the facing side) and an acting-only smile
    const lk = P.look || [0, 0];
    const ex = [.14 * u + lk[0] * .08 * u, .34 * u + lk[0] * .06 * u], ey = -.03 * u + lk[1] * .1 * u;
    for (const e of ex) {
      if (P.blink) { X.lineWidth = 3.5; X.beginPath(); X.moveTo(e - 7, ey); X.lineTo(e + 7, ey); X.stroke(); }
      else { X.beginPath(); X.arc(e, ey, 6.5, 0, TAU); X.fillStyle = C.INK; X.fill(); }
    }
    if (P.smile > .05) { X.lineWidth = 3.5; X.beginPath(); X.arc(.26 * u, .15 * u, .1 * u, Math.PI * .15, Math.PI * (.15 + .6 * P.smile)); X.stroke(); }
    X.restore();
    // near arm last (in front of the torso), with the ring box if he holds it
    X.lineWidth = 4; limb(sh, P.handN, .7 * u, .6 * u, d * (P.bendN || 1), 5);
    if (P.box === 'hand') drawRingBox(X, P.handN[0] - 19, P.handN[1] - 34, tq);
    X.restore();
  }

  // ------------------------------------------------------------------ S28–S29 timing (grid; lyric-locked where sung)
  const TL = {
    land: [T53 - F, T53 + 7 * F],                    // the chat window lands from where S27 left it (1452,184 300×200)
    type1: [T53, bt(54, 2)], type2: [bt(54, 3), bt(54, 3.5)],
    strike: [bt(53, 4) - 1.2 * F, bt(53, 4) + 2 * F],
    fold: [bt(54, 3), bt(54, 3) + 4 * F, bt(54, 3) + 8 * F, bt(54, 4) - F],   // bottom third up, top third down, to envelope
    scroll: [bt(54, 3) + 6 * F, bt(54, 4) + 2 * F],
    seal: bt(54, 4) - F,
    pink: bt(54, 4) + 3 * F,
    reply: bt(54, 4.5) - F, endTurn: bt(55) - 3 * F,
    box: [bt(55) + 5 * F, bt(55, 2) + 3 * F],        // picked up / pocketed
    ptr: [bt(55, 2.5) + F, bt(55, 3) - 2 * F],       // the pointer appears and travels to the ×
    hes: bt(55, 3) - 2 * F,                           // 4 frames of hesitation, trembling
    stand: bt(56, 2), walk: [bt(56, 3), bt(57) - 3 * F],
  };
  const lidTimes = () => { const tc = wordOnset('close', 102.5, 104.2, bt(56)); return [tc - 7 * F, tc - F]; };
  const LETTER = [ // [line, text, t0, t1, kind]
    [0, 'Queridos Sr. e Sra. Almeida,', T53 + 2 * F, bt(53, 2) + 5 * F],
    [1, 'escrevo para pedir a', bt(53, 2) + 7 * F, bt(53, 3) + 4 * F],
    [2, 'benção', bt(53, 3) + 6 * F, bt(53, 4) - 3 * F, 'typo'],
    [2, ' bênção', bt(53, 4) + 3 * F, bt(53, 4) + 8 * F, 'fix'],
    [2, ' de vocês.', bt(53, 4) + 8 * F, bt(54) - F],
    [3, 'Eu amo a Beatriz e quero', bt(54) + F, bt(54, 2) + 2 * F],
    [4, 'pedi-la em casamento.', bt(54, 2) + 4 * F, bt(54, 3) - 3 * F],
  ];
  const LFONT = `400 44px ${FONTS.heart}`, LX = 1080, LY0 = 306, LLH = 50;
  const CARD = { x: 1048, y: 252, w: 520, h: 282 };
  const ENV = { cx: 1208, cy: 236, w: 284, h: 178 };

  // ------------------------------------------------------------------ the letter, the envelope, the seal
  function letterLayout(X) {
    const segs = []; const lineX = [0, 0, 0, 0, 0];
    for (const [ln, s, t0, t1, kind] of LETTER) {
      const x = LX + lineX[ln], wdt = measure(X, s, LFONT);
      const cx = []; for (let i = 0; i <= s.length; i++) cx.push(x + measure(X, s.slice(0, i), LFONT));
      segs.push({ ln, s, t0, t1, kind, x, w: wdt, cx, y: LY0 + ln * LLH }); lineX[ln] += wdt;
    }
    return segs;
  }
  function drawCardBg(X, x, y, w, h) {
    rr(X, x, y, w, h, 16); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
  }
  // the letter as it is written (per-glyph 3-frame fade, CLAY write-head caret, the strike and the fix)
  function drawLetter(X, t, full = false) {
    const segs = letterLayout(X);
    drawCardBg(X, CARD.x, CARD.y, CARD.w, CARD.h);
    X.save(); X.font = LFONT; X.textBaseline = 'alphabetic'; X.textAlign = 'left'; X.fillStyle = C.INK;
    let head = null;
    for (const g of segs) {
      const n = g.s.length;
      for (let i = 0; i < n; i++) {
        const ti = g.t0 + (g.t1 - g.t0) * i / n, a = full ? 1 : clamp((t - ti) / (3 * F));
        if (a <= 0) break;
        X.globalAlpha = a; X.fillText(g.s[i], g.cx[i], g.y);
        if (!full && t < g.t1 + 2 * F) head = [g.cx[i + 1], g.y];
      }
      if (g.kind === 'typo') { // the strike, drawn left to right
        const k = full ? 1 : E.out2(seg(t, TL.strike[0], TL.strike[1]));
        if (k > 0) { X.globalAlpha = 1; X.fillRect(g.x - 3, g.y - 15, (g.w + 6) * k, 4); }
      }
    }
    X.globalAlpha = 1;
    // write head (the cursor motif): CLAY caret while writing, blinking on the beat when idle
    const last = segs[segs.length - 1];
    if (!full) {
      if (!head && t >= LETTER[0][2] && t < TL.fold[0]) head = [last.cx[last.s.length] + 4, last.y];
      const idle = !head || t > last.t1 + 2 * F;
      if (head && (!idle || Math.floor(beatPos(t) * 2) % 2 === 0)) { X.fillStyle = C.CLAY; X.fillRect(head[0] + 3, head[1] - 34, 4, 42); }
    }
    X.restore();
  }
  let _letterC = null;
  function letterCanvas() { // the finished card, for the fold (built once)
    if (_letterC) return _letterC;
    const res = 1.5, c = makeCanvas((CARD.w + 8) * res, (CARD.h + 8) * res), x = c.getContext('2d');
    x.scale(res, res); x.translate(-CARD.x + 4, -CARD.y + 4); drawLetter(x, 999, true);
    _letterC = { c, res }; return _letterC;
  }
  function sealShape(X, r) { // wax blob, static wobble
    const pts = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; const rr_ = r * (1 + (hash(i + 400) - .5) * .12); pts.push([Math.cos(a) * rr_, Math.sin(a) * rr_]); }
    blobPath(X, pts, true, .9);
  }
  // envelope back: body, seams, flap (0 open .. 1 shut), spark seal (the ember) with a halftone glow
  function drawEnvelope(X, cx, cy, w, h, o = {}) {
    const { flap = 1, seal = 1, sealCol = C.CLAY, glow = 0, t = 0, rot = 0, lw = 3, boil = 0, fill = C.PAPER } = o;
    const tq = q2(t), b = boil;
    X.save(); X.translate(cx, cy); X.rotate(rot); X.lineJoin = 'round'; X.lineCap = 'round';
    const x0 = -w / 2, y0 = -h / 2, apex = [0, y0 + h * .56];
    bpath(X, [[x0, y0], [-x0, y0], [-x0, -y0], [x0, -y0]], tq, 50, true, b); X.fillStyle = fill; X.fill(); X.lineWidth = lw; X.strokeStyle = C.INK; X.stroke();
    X.save(); X.globalAlpha = .45; X.lineWidth = lw * .75;
    bpath(X, [[x0, -y0], [0, y0 + h * .5], [-x0, -y0]], tq, 51, false, b); X.stroke(); X.restore();
    // flap: rotates about the top edge (apex flips from above to below)
    const fy = lerp(y0 - h * .5, apex[1], E.io2(flap));
    bpath(X, [[x0, y0], [0, fy], [-x0, y0]], tq, 52, true, b); X.fillStyle = flap < .5 ? mix(fill, C.INK, .06) : fill; X.fill(); X.lineWidth = lw; X.stroke();
    if (seal > 0) {
      const r = h * .2 * seal;
      if (glow > 0) { // the ember: halftone glow rings (no gradients)
        const cell = Math.max(6, r * .2);
        [[1.25, 1.75, .36], [1.75, 2.35, .2], [2.35, 3.1, .08]].forEach(([a, bb, d]) => {
          X.beginPath(); X.arc(0, fy, r * bb, 0, TAU); X.arc(0, fy, r * a, 0, TAU, true);
          X.fillStyle = halftone(X, sealCol, d * glow, cell, 45); X.fill();
        });
      }
      X.save(); X.translate(0, fy); sealShape(X, r); X.fillStyle = sealCol; X.fill(); X.lineWidth = Math.max(2, r * .07); X.strokeStyle = C.INK; X.stroke();
      X.strokeStyle = mix(sealCol, C.INK, .22); X.lineWidth = Math.max(1.5, r * .09);
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; X.beginPath(); X.moveTo(Math.cos(a) * r * .28, Math.sin(a) * r * .28); X.lineTo(Math.cos(a) * r * .64, Math.sin(a) * r * .64); X.stroke(); }
      X.beginPath(); X.arc(0, 0, r * .14, 0, TAU); X.fillStyle = mix(sealCol, C.INK, .22); X.fill();
      X.restore();
    }
    X.restore();
  }
  // the fold: bottom third up, top third down, then the packet becomes the envelope and scrolls up
  function drawFold(X, t) {
    const [f0, f1, f2, f3] = TL.fold, k1 = seg(t, f0, f1), k2 = seg(t, f1, f2), k3 = seg(t, f2, f3);
    const L = letterCanvas(), res = L.res, { x, y, w, h } = CARD, h3 = h / 3;
    const src = (sy0, sh, dx, dy, dw, dh) => X.drawImage(L.c, 4 * res, (4 + sy0) * res, w * res, sh * res, dx, dy, dw, dh);
    const back = (yy, hh) => { X.fillStyle = mix(C.PAPER, C.INK, .05); X.fillRect(x, yy, w, hh); X.lineWidth = 3; X.strokeStyle = C.INK; X.strokeRect(x, yy, w, hh); };
    const shade = (yy, hh, d) => { if (d > .02) { X.fillStyle = halftone(X, C.INK, d, 10, 45); X.fillRect(x, yy, w, hh); } };
    if (k3 <= 0) {
      if (k2 <= 0) src(0, h3, x, y, w, h3);                     // top third (flat)
      src(h3, h3, x, y + h3, w, h3);                              // middle third
      const c1 = Math.cos(Math.PI * E.in2(k1));                   // bottom third folding up
      if (k1 < 1 && c1 >= 0) { src(2 * h3, h3, x, y + 2 * h3, w, h3 * c1); shade(y + 2 * h3, h3 * c1, (1 - c1) * .35); }
      else back(y + 2 * h3 - h3 * Math.min(1, -c1), h3 * Math.min(1, -c1));
      if (k2 > 0) {                                               // top third folding down over it
        const c2 = Math.cos(Math.PI * E.in2(k2));
        if (c2 >= 0) { src(0, h3, x, y + h3 - h3 * c2, w, h3 * c2); shade(y + h3 - h3 * c2, h3 * c2, (1 - c2) * .35); }
        else back(y + h3, h3 * Math.min(1, -c2));
      }
      return;
    }
    // packet → envelope (morph + scroll), flap shuts; the seal is stamped at TL.seal
    const e = E.io3(k3), cx = lerp(x + w / 2, ENV.cx, e), cy = lerp(y + h / 2, ENV.cy, e);
    drawEnvelope(X, cx, cy, lerp(w, ENV.w, e), lerp(h3, ENV.h, e), { flap: E.in2(clamp(k3 * 1.3 - .2)), seal: 0, t });
  }
  function drawChatEnvelope(X, t) {
    const a = t - TL.seal, s = a < 0 ? 0 : a < 5 * F ? lerp(1.9, 1, E.out3(a / (5 * F))) - (a > 3 * F ? .08 * Math.sin((a - 3 * F) * 40) : 0) : 1 + boing(t, TL.seal + 5 * F, .04, 30, 9);
    drawEnvelope(X, ENV.cx, ENV.cy, ENV.w, ENV.h, { flap: 1, seal: a >= 0 ? s : 0, glow: a >= 0 ? clamp(a / (6 * F)) * .8 : 0, t });
  }

  // ------------------------------------------------------------------ minimal Opus in the chat (R 160, PAPER face rule)
  const MARKER = (x, R) => { x.save(); x.rotate(-2.35); rr(x, -.045 * R, -.62 * R, .09 * R, .46 * R, .04 * R); x.fillStyle = C.INK; x.fill(); x.fillStyle = C.PAPER; x.fillRect(-.045 * R, -.3 * R, .09 * R, .03 * R); x.restore(); };
  function opusState(t) {
    t = q1(t);
    const [l0] = lidTimes();
    const grip = side => ({ hand: [side * .75, 5.05], bend: side, front: true, type: 'mitten' });
    let armL = grip(-1), armR = grip(1), eyes = 'normal', mouth = 'rest', turn = -.5, lookY = -.9, tilt = 0, dy = 0, lid = 0;
    // S28 bar 53 → bar 54 b2: writes along with a tiny marker (little loops on 1s), eyes on the letter
    const w0 = LETTER[0][2] - 3 * F, w1 = LETTER[LETTER.length - 1][3] + 3 * F;
    if (t >= w0 - 4 * F && t < w1 + 6 * F) {
      const up = E.out3(clamp((t - (w0 - 4 * F)) / (5 * F))) * (1 - E.in2(clamp((t - w1) / (6 * F))));
      const ph = (t - w0) * TAU * 3.2, strike = seg(t, TL.strike[0], TL.strike[1]);
      const hx = -1.32 + .06 * Math.sin(ph) + (strike > 0 && strike < 1 ? lerp(-.16, .18, strike) : 0), hy = 5.98 + .05 * Math.cos(ph * .5);
      armL = { hand: [lerp(-.75, hx, up), lerp(5.05, hy, up)], bend: -1, front: true, type: 'mitten', hold: up > .5 ? MARKER : null };
      turn = -.55; lookY = -1;
    }
    if (t >= w1 + 6 * F && t < w1 + 16 * F) armL.hand = [-.75, 5.05 - boing(t, w1 + 6 * F, .06, 30, 10)];
    // the typo: blink, a small "o", then ^ ^ on the fix
    lid = Math.max(blinkF(t, TL.strike[0] - F), blinkF(t, bt(53, 2)), blinkF(t, TL.fold[0] + 2 * F));
    if (t >= TL.strike[1] && t < LETTER[3][2]) mouth = 'O';
    if (t >= LETTER[3][2] && t < LETTER[3][3] + 6 * F) { eyes = 'happy'; mouth = 'rest'; }
    // the fold and the seal: eyes follow the paper up; a nod as the seal lands
    if (t >= TL.fold[0] && t < TL.pink) { turn = -.45; lookY = -1.2; }
    dy -= boing(t, TL.seal, .035, 26, 9);
    if (t >= TL.pink && t < TL.reply) { turn = .15; lookY = -1.3; }                 // reads his bubble
    if (t >= TL.reply && t < T55) { eyes = 'happy'; turn = -.2; lookY = -.4; dy += .025 * Math.sin(clamp((t - TL.reply) / .2) * Math.PI); }
    dy -= boing(t, TL.endTurn, .02, 30, 10);
    // S29: watches him with the ring box (toward the bezel), then the pointer, then ^ ^ and the two-mitten shoo
    if (t >= T55) { eyes = 'normal'; turn = -.85; lookY = -.1; lid = Math.max(lid, blinkF(t, bt(55, 2) - 2 * F)); }
    if (t >= TL.ptr[1] - 2 * F && t < TL.hes + 5 * F) { turn = .5; lookY = -1.25; tilt = -.05; }
    if (t >= TL.hes + 5 * F) { turn = -.75; lookY = -.2; lid = Math.max(lid, blinkF(t, TL.hes + 5 * F)); }
    if (t >= TL.hes + 7 * F) { eyes = 'happy'; tilt = .05; mouth = 'rest'; }
    const s0 = bt(55, 3.5), e8 = BEAT / 2;                       // flicks on the eighths: b3.5 and b4
    if (t >= s0 - 3 * F && t < s0 + 2 * e8 + 8 * F) {
      const up = t < s0 ? -.07 * (t - (s0 - 3 * F)) / (3 * F) : E.out3(clamp((t - s0) / (3 * F))) * (1 - E.io2(clamp((t - (s0 + 2 * e8)) / (8 * F))));
      let fl = 0; for (let k = 0; k < 2; k++) { const a = t - (s0 + k * e8); if (a >= 0 && a < e8) fl = Math.max(fl, a < 2 * F ? E.out2(a / (2 * F)) : 1 - E.in2(clamp((a - 2 * F) / (e8 - 2 * F)))); }
      armL = { hand: [-.75 - up * .5 - fl * .34, 5.05 + up * .55 + fl * .22], bend: -1, front: true, type: 'mitten' };
      armR = { hand: [.75 - up * .28 - fl * .3, 5.05 + up * .62 + fl * .24], bend: 1, front: true, type: 'mitten' };
      tilt = -.04 - .03 * fl;
    }
    const sEnd = s0 + 2 * e8 + 8 * F;
    if (t >= sEnd && t < sEnd + 12 * F) { const b = boing(t, sEnd, .05, 30, 10); armL.hand = [-.75, 5.05 - b]; armR.hand = [.75, 5.05 - b]; }
    if (t >= l0) { eyes = 'happy'; turn = -.6; lookY = -.2; }     // gone with the lid, no reaction
    return {
      t, skin: 'minimal', ground: 'paper', keyline: false, bufId: 3,
      head: { tilt, dy }, face: { eyes, mouth, turn, lookY, lid, gaze: [0, 0] },
      armL, armR, ahoge: { blink: ahogeBlink(t) }, crown: { flare: 1 },
    };
  }
  function drawChatOpus(X, t) {
    const S = opusState(t), R = OP.R;
    const L = layer('br_opus'); L.setTransform(X.getTransform());
    drawOpus(L, OP.x, OP_SOLE, R, S);
    // above the input bar: the head; below: hidden (the chin sits behind the bar, as in the hook's peek)
    X.save(); X.beginPath(); X.rect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, BAR_IN.y0 + 2 - DISP.y0); X.clip(); drawLayer(X, 'br_opus'); X.restore();
    drawInputBar(X, t);
    // mittens in front of the bar edge
    X.save(); X.beginPath();
    for (const a of [S.armL, S.armR]) { const hx = OP.x + a.hand[0] * R, hy = OP_SOLE - (a.hand[1] - S.head.dy * 0) * R; X.moveTo(hx + .3 * R, hy); X.arc(hx, hy, .3 * R, 0, TAU); }
    X.clip(); drawLayer(X, 'br_opus'); X.restore();
  }
  function drawInputBar(X, t) {
    const b = BAR_IN; rr(X, b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, 17); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
    if (Math.floor(beatPos(t) * 2) % 2 === 0) { X.fillStyle = C.INK; X.fillRect(b.x0 + 26, b.y0 + 8, 3, b.y1 - b.y0 - 16); }
  }

  // ------------------------------------------------------------------ the pointer (his), the bubbles, the chat
  function ptrState(t) {
    if (t < TL.ptr[0]) return null;
    const tq = q2(t), P0 = [1318, 672], Pc = [1720, 560];
    const k = E.io3(seg(tq, TL.ptr[0], TL.ptr[1] + 2 * F)), a = (1 - k) * (1 - k), b = 2 * k * (1 - k), c = k * k;
    let x = a * P0[0] + b * Pc[0] + c * XBTN[0] - 4, y = a * P0[1] + b * Pc[1] + c * XBTN[1] - 6;
    const tr = t < TL.hes ? 0 : t < TL.hes + 4 * F ? 3 : t < lidTimes()[0] - 6 * F ? 1 : 0;   // hesitates 4 frames, trembling
    if (tr) { x += noise1(tq * 40, 5) * tr * 1.4; y += noise1(tq * 40, 9) * tr * 1.4; }
    return [x, y];
  }
  function drawBubbles(X, t) {
    if (t >= TL.pink) { // his PINK bubble pops (human, on 2s)
      const k = E.back(clamp((q2(t) - TL.pink) / (5 * F)), 2.2), ax = 1890, ay = 436;
      X.save(); X.translate(ax, ay); X.scale(k, k); X.translate(-ax, -ay);
      bubble(X, 1890, 352, 'ok. obrigado!! wish me luck', { who: 'human', size: 36, maxW: 760 });
      X.restore();
    }
    if (t >= TL.reply - 2 * F) { // Opus: "boa sorte!!" streams, then ■ end_turn
      const k = E.back(clamp((t - (TL.reply - 2 * F)) / (5 * F)), 1.8), x = 1066, y = 470, w = 300, h = 132;
      X.save(); X.translate(x, y + h); X.scale(k, k); X.translate(-x, -(y + h));
      rr(X, x, y, w, h, 20); X.fillStyle = C.PAPER; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
      const str = 'boa sorte!!', n = Math.floor(clamp((t - TL.reply) / .22) * str.length + 1e-6);
      X.font = mono(36, 500); X.fillStyle = C.INK; X.textAlign = 'left'; X.fillText(str.slice(0, n), x + 26, y + 56);
      if (t >= TL.endTurn) drawRich(X, '■ end_turn', x + 26, y + 108, mono(36, 500), C.UI_GREY);
      X.restore();
    }
  }
  function drawChat(X, t) {
    // lit display
    X.fillStyle = DISPC; X.fillRect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, DISP.y1 - DISP.y0);
    // content (scrolls up when the letter becomes an envelope)
    const sc = -118 * E.io3(seg(t, TL.scroll[0], TL.scroll[1]));
    X.save(); X.beginPath(); X.rect(DISP.x0, 131, DISP.x1 - DISP.x0, BAR_IN.y0 - 131); X.clip();
    // pause-bait: the system card line
    X.save(); X.translate(0, sc); X.globalAlpha = .64 * (1 - seg(t, TL.scroll[0], TL.scroll[1])); X.font = mono(28, 500); X.fillStyle = C.INK; X.textAlign = 'left';
    ['system card §7 · most preferred task, e.g.:', "a letter in Portuguese asking a girlfriend's", 'parents for their blessing'].forEach((s, i) => X.fillText(s, 1066, 170 + i * 31));
    X.restore();
    if (t < TL.fold[0]) drawLetter(X, t);
    else if (t < TL.seal) drawFold(X, t);
    else drawChatEnvelope(X, t);
    drawBubbles(X, t);
    X.restore();
    // tab strip
    X.fillStyle = C.PAPER; X.fillRect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, 128 - DISP.y0);
    rr(X, 1046, 30, 862, 120, 18); X.fillStyle = DISPC; X.fill(); X.lineWidth = 3; X.strokeStyle = C.INK; X.stroke();
    X.fillStyle = C.INK; X.fillRect(DISP.x0, 127, DISP.x1 - DISP.x0, 3);
    X.fillStyle = DISPC; X.fillRect(1048, 126, 858, 6);
    drawRich(X, '✻ carta para os pais', 1078, 102, mono(40, 500), C.INK);
    drawRich(X, '×', XBTN[0] - 17.4, XBTN[1] + 20, mono(58, 400), C.INK);
    // Opus (peeking over the input bar), then his pointer on top
    drawChatOpus(X, t);
    const P = ptrState(t); if (P) pointer(X, P[0], P[1], { size: 180 });
  }

  // ------------------------------------------------------------------ Rafa's acting (on 2s)
  const SIT = { hip: [676, 948], lean: .33, dir: 1, handN: [906, 857], handF: [874, 858], footN: [828, FLOOR], footF: [798, FLOOR], look: [.3, -.05], tilt: 0, hood: 0, smile: 0 };
  const STAND = { hip: [706, 794], lean: .03, handN: [742, 804], handF: [714, 802], footN: [744, FLOOR], footF: [690, FLOOR], look: [.2, 0], tilt: 0 };
  const TH_MAX = Math.acos(SLIVER / (HINGE - SCR.y0));
  function lidState(t) {
    const [l0, l1] = lidTimes();
    if (t < l0) return { th: 0, sy: 1, k: 0 };
    let th = TH_MAX * E.in2(seg(t, l0, l1));
    if (t > l1) th = TH_MAX - Math.abs(boing(t, l1, .022, 36, 11));
    return { th, sy: Math.cos(th), k: th / TH_MAX };
  }
  function rafaPose(t) {
    const tq = q2(t), [l0, l1] = lidTimes(), st = TL.stand, [w0, w1] = TL.walk;
    const S = o => Object.assign({}, SIT, o), ST = o => Object.assign({}, SIT, STAND, o);
    let P;
    if (tq < w0) {
      P = kfPose(tq, [
        [T53 - F, S({})],
        [bt(54, 2), S({})],
        [bt(54, 2) + 5 * F, S({ lean: .27, handN: [900, 857], look: [.35, -.3] })],                 // sits back, reads
        [TL.type2[0] - 2 * F, S({ lean: .27, handN: [900, 857], look: [.35, -.3] })],
        [TL.type2[0] + 2 * F, S({ look: [.3, 0] })],                                               // types his reply
        [TL.pink + 2 * F, S({ look: [.35, -.15] })],
        [TL.reply + 4 * F, S({ lean: .25, look: [.4, -.05] })],
        [TL.endTurn, S({ lean: .24, look: [.4, 0], smile: 1 })],                                  // "boa sorte!!": he smiles
        [T55 + 2 * F, S({ lean: .26, smile: .8 })],
        [TL.box[0], S({ handN: [768, 838], lean: .43, look: [.05, .6], tilt: .12, smile: .4 })],  // takes the ring box
        [TL.box[0] + 6 * F, S({ handN: [774, 760], lean: .3, look: [0, .5], tilt: .16, smile: .7 })],
        [TL.box[1] - 4 * F, S({ handN: [772, 756], lean: .3, look: [0, .5], tilt: .16, smile: .7 })],
        [TL.box[1] + 2 * F, S({ handN: [694, 926], lean: .3, look: [.3, .05], smile: .2 })],     // pockets it
        [TL.ptr[0], S({ handN: [884, 857], lean: .34, look: [.45, -.3] })],
        [TL.hes, S({ handN: [892, 856], lean: .35, look: [.55, -.65] })],                         // eyes on the ×
        [TL.hes + 4 * F, S({ handN: [892, 856], lean: .35, look: [.55, -.65] })],
        [TL.hes + 6 * F, S({ handN: [892, 856], lean: .35, look: [.65, .45], tilt: .1 })],        // guilt: glances at Opus
        [bt(55, 4) - 2 * F, S({ handN: [892, 856], lean: .35, look: [.65, .4], tilt: .05, smile: .5 })],
        [bt(55, 4) + 2 * F, S({ handN: [892, 856], lean: .35, look: [.55, .3], tilt: .17, smile: .8 })], // a nod
        [l0 - 7 * F, S({ handN: [890, 856], lean: .35, look: [.5, 0], tilt: 0, smile: .7 })],
        [l0 - F, S({ handN: [992, 772], lean: .64, look: [.5, -.1], smile: .4 }), E.io3],        // reaches for the lid
        [l1 + 4 * F, S({ handN: [992, 842], lean: .6, look: [.35, .4], smile: .3 })],
        [st - 3 * F, S({ handN: [990, 842], lean: .56, look: [.3, .2], smile: .6 })],
        [st, S({ hip: [686, 960], handN: [986, 846], lean: .72, look: [.2, .35] })],               // anticipation
        [st + 5 * F, ST({ smile: .5 }), E.out3],                                                   // up
        [st + 7 * F, ST({ smile: .5 })],
        [w0 - 4 * F, ST({ hip: [706, 790], handN: [700, 470], handF: [672, 472], lean: 0, look: [.1, -.3], hood: 1, smile: .6 })], // hood up
        [w0, ST({ hood: 1, smile: .6 })],
      ]);
      if (tq >= l0 - F && tq <= l1 + F) { const L = lidState(tq); P.handN = [992, HINGE - 88 * L.sy - LID_T * Math.sin(L.th) - 2]; }
      const typing = (tq >= T53 && tq < TL.type1[1]) || (tq >= TL.type2[0] && tq < TL.type2[1]);
      if (typing) { const k = Math.floor(tq * 15); P.handN = [P.handN[0] + (k % 3) * 3, P.handN[1] - (k % 2) * 7]; P.handF = [P.handF[0], P.handF[1] - ((k + 1) % 2) * 7]; }
      P.blink = [bt(53, 3) + 3 * F, bt(54, 3) + 6 * F, T55 + 5 * F, TL.hes + 5 * F, l1 + 6 * F].some(b => tq >= b && tq < b + 3 * F);
      P.box = tq >= TL.box[0] && tq < TL.box[1] ? 'hand' : null;
      return P;
    }
    // he hurries out, hood up, on 2s: one step per eighth
    const tt = tq - w0, s = tt / (BEAT / 2), hx = 706 - 1180 * Math.max(0, tt - F) - 60 * E.in2(clamp(tt / (3 * F))) * 0;
    const sw = Math.sin(Math.PI * s), cw = Math.cos(Math.PI * s);
    return Object.assign({}, SIT, {
      dir: -1, hip: [hx, 796 - 12 * Math.abs(cw)], lean: .16, hood: 1, smile: .5, look: [.3, -.05],
      footN: [hx - 118 * sw, FLOOR - 26 * Math.max(0, -cw)], footF: [hx + 118 * sw, FLOOR - 26 * Math.max(0, cw)],
      handN: [hx + 70 * sw - 34, 812 - 16 * Math.abs(sw)], handF: [hx - 70 * sw - 34, 812 - 16 * Math.abs(sw)],
    });
  }

  // ------------------------------------------------------------------ S28 + S29 painter: the locked split, the lid, the push
  function camZ(t) {
    const d = 1 + .008 * (Math.min(t, TL.stand) - T53) / BAR;              // half-time drift, < 1% per bar
    return t < TL.stand ? d : d + (1.34 - d) * E.in2(seg(t, TL.stand, T57));
  }
  function paintSplit(X, t) {
    groundPaper(X);
    const Z = camZ(t), L = lidState(t), fld = nightField();
    X.save(); X.translate(ANCHOR[0], ANCHOR[1]); X.scale(Z, Z); X.translate(-ANCHOR[0], -ANCHOR[1]);
    // the room: night dots, the lamp's pool; behind the lid, the wall (with the sliver's light once it shuts)
    X.drawImage(fld.L, 0, 0);
    if (L.th > 0) { X.drawImage(fld.R, 1000, 0); X.globalAlpha = L.k; X.drawImage(fld.RG, 1000, 0); X.globalAlpha = 1; }
    const sk = E.out3(seg(q2(t), TL.stand, TL.stand + 6 * F));
    drawRoomBack(X, t, { chairShift: 44 * sk, chairRot: -.06 * sk });
    drawDesk(X, t, { box: t < TL.box[0] });
    // the lid (front view), squashing toward the hinge when he shuts it
    X.save();
    if (t < TL.land[1]) { // lands from S27's far window
      const k = E.out4(seg(t, TL.land[0], TL.land[1])), sw = SCR.x1 - SCR.x0, shh = HINGE - SCR.y0;
      const rx = lerp(1452, SCR.x0, k), ry = lerp(184, SCR.y0, k), rw = lerp(300, sw, k), rh = lerp(200, shh, k);
      X.translate(rx, ry); X.scale(rw / sw, rh / shh); X.translate(-SCR.x0, -SCR.y0);
    }
    X.translate(0, HINGE); X.scale(1, Math.max(1e-3, L.sy)); X.translate(0, -HINGE);
    X.beginPath(); X.rect(SCR.x0, SCR.y0, SCR.x1 - SCR.x0, HINGE - SCR.y0); X.clip();
    drawChat(X, t);
    X.fillStyle = C.INK; X.fillRect(SCR.x0, SCR.y0, SCR.bez, HINGE - SCR.y0); X.fillRect(SCR.x0, DISP.y1, SCR.x1 - SCR.x0, HINGE - DISP.y1);
    if (L.th > 0 && L.k < .98) { X.fillStyle = halftone(X, C.INK, .5 * Math.sin(L.th), 10, 45); X.fillRect(DISP.x0, DISP.y0, DISP.x1 - DISP.x0, DISP.y1 - DISP.y0); }
    X.restore();
    // lid shell edge-on (with a 2-copy smear while it falls), the keyboard deck
    X.fillStyle = C.INK;
    if (L.th > 0) {
      const top = HINGE - (HINGE - SCR.y0) * L.sy, th = LID_T * Math.sin(L.th);
      const [l0, l1] = lidTimes();
      if (t < l1) for (const [dt, a] of [[F, .3], [2 * F, .14]]) { const Lp = lidState(t - dt); const tp = HINGE - (HINGE - SCR.y0) * Lp.sy; X.globalAlpha = a; X.fillRect(SCR.x0, tp - th, SCR.x1 - SCR.x0, Math.max(th, top - tp)); }
      X.globalAlpha = 1; rr(X, SCR.x0 - 2, top - th, SCR.x1 - SCR.x0 + 2, th, 5); X.fill();
    }
    rr(X, BASE.x0, BASE.y0, BASE.x1 - BASE.x0, BASE.y1 - BASE.y0, 6); X.fill();
    drawRafa(X, rafaPose(t), t);
    X.restore();
    // HEART subtitle, screen space, across both halves (INK on PAPER; paper knockout so no line crosses a word)
    heartLine(X, LY.s28(), t, { color: C.INK, knock: C.PAPER, tEnd: TL.pink + 8 * F });
    heartLine(X, LY.s29(), t, { color: C.INK, knock: C.PAPER });
  }
  scene('S28_we_wrote_your_letter', T53 - F, T55 - F, (X, t) => paintSplit(X, t));
  scene('S29_close_the_window', T55 - F, T57 - F, (X, t) => paintSplit(X, t));
