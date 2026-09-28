// Loop-seam test (BIBLE §11.2, SHOTLIST S43): the last frame, renderAt(4319/30), must equal renderAt(-1/30)
// pixel for pixel, both in fresh pages and after other frames have warmed the caches.
//   node tools/seam_test.mjs [scale=0.5]
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = pathToFileURL(path.join(ROOT, 'engine', 'index.html')).href;
const base = '/opt/pw-browsers'; let exe;
for (const d of fs.readdirSync(base).sort().reverse()) { const p = path.join(base, d, 'chrome-linux', 'chrome'); if (d.startsWith('chromium-') && fs.existsSync(p)) { exe = p; break; } }
const browser = await chromium.launch({ executablePath: exe, args: ['--disable-web-security', '--allow-file-access-from-files', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--disable-background-timer-throttling', '--force-color-profile=srgb'] });
const scale = process.argv[2] || '0.5';
async function page() {
  const p = await browser.newPage({ viewport: { width: Math.round(1920 * scale), height: Math.round(1080 * scale) } });
  p.on('pageerror', e => console.log('[pageerror]', e.message));
  await p.goto(`${PAGE}?${new URLSearchParams({ mode: 'render', scale, scenes: 'scenes/hook.js,scenes/outro.js' })}`);
  await p.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  return p;
}
const hashAt = (p, t) => p.evaluate(t => { window.renderAt(t, {}); const c = window.CANVAS; const x = document.createElement('canvas'); x.width = c.width; x.height = c.height; const g = x.getContext('2d'); g.drawImage(c, 0, 0); const d = g.getImageData(0, 0, x.width, x.height).data; let h = 0x811c9dc5; for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619) >>> 0; } return h; }, t);
const A = await page(); const hLastFresh = await hashAt(A, 4319 / 30);
const B = await page(); const hZeroFresh = await hashAt(B, -1 / 30);
const hLastWarm = await (async () => { await hashAt(B, 143.2); await hashAt(B, 141.0); return hashAt(B, 4319 / 30); })();
const hZeroWarm = await hashAt(A, -1 / 30);
const ok = hLastFresh === hZeroFresh && hLastWarm === hZeroFresh && hZeroWarm === hZeroFresh;
console.log(JSON.stringify({ scale, hLastFresh, hZeroFresh, hLastWarm, hZeroWarm, ok }));
await browser.close();
process.exit(ok ? 0 : 1);
