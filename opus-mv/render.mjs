// Deterministic frame renderer for the music video.
//
// Every frame is a pure function of song time t, painted by engine/index.html
// (window.renderAt(t)) in headless Chromium, captured from the canvas and
// encoded with ffmpeg.
//
//   node render.mjs --frames=0:142.5 --workers=3          paint frames into out/frames (resumable)
//   node render.mjs --encode --audio=audio/song.mp3 --out=out/video.mp4
//   node render.mjs --sheet=10,10.5,11,12 --cols=4 --w=480 --out=out/check/a.jpg
//   node render.mjs --stills=12.3,40 --out=out/check/stills
//   node render.mjs --clip=30:40 --scale=0.5 --out=out/check/clip.mp4   quick low-res preview with audio
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [m[1], m[2] ?? true] : [a, true];
}));
const FPS = +(args.fps || 30);
const W = 1920, H = 1080;
const SCALE = +(args.scale || 1);
const QUALITY = +(args.q || 0.94);
const AUDIO = args.audio || path.join(ROOT, 'audio', 'song.mp3');
const PAGE = pathToFileURL(path.join(ROOT, 'engine', 'index.html')).href;

function chromePath() {
  if (args.chrome) return args.chrome;
  const base = '/opt/pw-browsers';
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base).sort().reverse()) {
      const p = path.join(base, d, 'chrome-linux', 'chrome');
      if (d.startsWith('chromium-') && fs.existsSync(p)) return p;
    }
  }
  return undefined;
}

async function openPage(browser, extra = {}) {
  const page = await browser.newPage({ viewport: { width: Math.round(W * SCALE), height: Math.round(H * SCALE) } });
  page.on('console', m => { if (m.type() === 'error' || args.verbose) console.log('[page]', m.text()); });
  page.on('pageerror', e => console.log('[pageerror]', e.message));
  const q = new URLSearchParams({ mode: 'render', scale: String(SCALE), ...(args.scenes ? { scenes: args.scenes } : {}), ...extra });
  await page.goto(`${PAGE}?${q}`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  return page;
}

async function grab(page, t, label) {
  const b64 = await page.evaluate(([t, label, q]) => {
    window.renderAt(t, { label });
    return window.CANVAS.toDataURL('image/jpeg', q).split(',')[1];
  }, [t, label, QUALITY]);
  return Buffer.from(b64, 'base64');
}

async function launch() {
  return chromium.launch({
    executablePath: chromePath(),
    args: ['--disable-web-security', '--allow-file-access-from-files', '--enable-unsafe-swiftshader',
      '--use-angle=swiftshader', '--disable-background-timer-throttling', '--force-color-profile=srgb'],
  });
}

async function renderFrames() {
  const [a, b] = String(args.frames).split(':').map(Number);
  const out = args.out || path.join(ROOT, 'out', 'frames');
  fs.mkdirSync(out, { recursive: true });
  const f0 = Math.round(a * FPS), f1 = Math.round(b * FPS);
  const todo = [];
  for (let f = f0; f < f1; f++) {
    const p = path.join(out, String(f).padStart(5, '0') + '.jpg');
    if (!fs.existsSync(p) || args.force) todo.push(f);
  }
  const nW = Math.max(1, +(args.workers || 3));
  console.log(`frames ${f0}..${f1}: ${todo.length} to paint with ${nW} workers`);
  const browser = await launch();
  let done = 0, next = 0; const t0 = Date.now();
  await Promise.all(Array.from({ length: nW }, async () => {
    const page = await openPage(browser);
    while (next < todo.length) {
      const f = todo[next++];
      const buf = await grab(page, f / FPS, false);
      fs.writeFileSync(path.join(out, String(f).padStart(5, '0') + '.jpg'), buf);
      done++;
      if (done % 60 === 0 || done === todo.length) {
        const el = (Date.now() - t0) / 1000;
        console.log(`${done}/${todo.length}  ${(el * 1000 / done * nW).toFixed(0)} ms/frame/worker  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`);
      }
    }
    await page.close();
  }));
  await browser.close();
}

function encode(framesDir, outFile, startFrame = 0, audioOffset = 0, dur = null) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  const a = ['-y', '-framerate', String(FPS), '-start_number', String(startFrame), '-i', path.join(framesDir, '%05d.jpg')];
  if (fs.existsSync(AUDIO) && !args.mute) a.push('-ss', String(audioOffset), ...(dur ? ['-t', String(dur)] : []), '-i', AUDIO);
  a.push('-c:v', 'libx264', '-preset', args.preset || 'slow', '-crf', String(args.crf || 16), '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-movflags', '+faststart');
  if (fs.existsSync(AUDIO) && !args.mute) a.push('-c:a', 'aac', '-b:a', '256k', '-shortest');
  a.push(outFile);
  const r = spawnSync('ffmpeg', a, { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('ffmpeg failed');
  console.log('wrote', outFile);
}

async function stills(times, dir, label) {
  fs.mkdirSync(dir, { recursive: true });
  const browser = await launch();
  const page = await openPage(browser);
  const files = [];
  for (const t of times) {
    const t1 = Date.now();
    const buf = await grab(page, t, label);
    const f = path.join(dir, `t${t.toFixed(2).padStart(7, '0')}.jpg`);
    fs.writeFileSync(f, buf);
    files.push(f);
    console.log(`t=${t}  ${Date.now() - t1} ms`);
  }
  await browser.close();
  return files;
}

async function sheet() {
  const times = String(args.sheet).split(',').map(Number);
  const cols = +(args.cols || 4);
  const w = +(args.w || 480);
  const out = args.out || path.join(ROOT, 'out', 'check', 'sheet.jpg');
  const tmp = path.join(path.dirname(out), '.sheet_' + path.basename(out, '.jpg'));
  fs.rmSync(tmp, { recursive: true, force: true });
  const files = await stills(times, tmp, true);
  const rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap(f => ['-i', f]);
  const h = Math.round(w * 9 / 16);
  let filter = files.map((_, i) => `[${i}:v]scale=${w}:${h}[s${i}]`).join(';') + ';';
  const pads = [];
  for (let i = files.length; i < rows * cols; i++) pads.push(i);
  filter += files.map((_, i) => `[s${i}]`).join('') + `xstack=inputs=${files.length}:layout=` +
    files.map((_, i) => `${(i % cols) * w}_${Math.floor(i / cols) * h}`).join('|') + `:fill=black[v]`;
  const r = spawnSync('ffmpeg', ['-y', '-v', 'error', ...inputs, '-filter_complex', filter, '-map', '[v]', '-q:v', '3', out], { stdio: 'inherit' });
  if (r.status !== 0) throw new Error('sheet failed');
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('wrote', out);
}

async function clip() {
  const [a, b] = String(args.clip).split(':').map(Number);
  const out = args.out || path.join(ROOT, 'out', 'check', `clip_${a}_${b}.mp4`);
  const tmp = path.join(path.dirname(out), '.clip_' + path.basename(out, '.mp4'));
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  const fps = +(args.fps || 30);
  const browser = await launch();
  const nW = Math.max(1, +(args.workers || 3));
  const n = Math.round((b - a) * fps);
  let next = 0;
  await Promise.all(Array.from({ length: nW }, async () => {
    const page = await openPage(browser);
    while (next < n) {
      const i = next++;
      fs.writeFileSync(path.join(tmp, String(i).padStart(5, '0') + '.jpg'), await grab(page, a + i / fps, !!args.label));
    }
  }));
  await browser.close();
  encode(tmp, out, 0, a, b - a);
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (args.frames) await renderFrames();
else if (args.encode) encode(args.frames_dir || path.join(ROOT, 'out', 'frames'), args.out || path.join(ROOT, 'out', 'video.mp4'));
else if (args.sheet) await sheet();
else if (args.stills) await stills(String(args.stills).split(',').map(Number), args.out || path.join(ROOT, 'out', 'check', 'stills'), !!args.label);
else if (args.clip) await clip();
else console.log('see header for usage');
