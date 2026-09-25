import { chromium } from 'playwright';
import path from 'node:path'; import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const ROOT = process.cwd();
let exe; for (const d of fs.readdirSync('/opt/pw-browsers').sort().reverse()) { const p = path.join('/opt/pw-browsers', d, 'chrome-linux', 'chrome'); if (d.startsWith('chromium-') && fs.existsSync(p)) { exe = p; break; } }
const b = await chromium.launch({ executablePath: exe, args: ['--allow-file-access-from-files','--enable-unsafe-swiftshader','--use-angle=swiftshader'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(pathToFileURL(path.join(ROOT, 'engine/index.html')).href + '?mode=render&scenes=scenes/chants.js');
await p.waitForFunction(() => window.READY === true);
const r = await p.evaluate(() => {
  const T = [46.5, 51.9];
  const meas = () => T.map(t => { let best = 1e9; for (let i = 0; i < 4; i++) { const a = performance.now(); renderAt(t + i / 30); window.CANVAS.toDataURL('image/jpeg', .94); best = Math.min(best, performance.now() - a); } return best | 0; }).join('/');
  const out = ['base ' + meas()];
  const keep = {};
  for (const name of ['hero', 'drawOpus', 'halftone', 'finishStyle']) {
    keep[name] = window[name];
    if (name === 'halftone') window[name] = () => '#888'; else if (name === 'finishStyle') window.finishStyle = () => {}; else window[name] = () => {};
    out.push('no ' + name + ' ' + meas());
    window[name] = keep[name];
  }
  return out.join('  |  ');
});
console.log(r);
await b.close();
