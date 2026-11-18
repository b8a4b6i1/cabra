// audio smoke test: unmute and play from ?from=N for D seconds, fail on page errors; counts oscillators/noise sources started
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage({ viewport: { width: 500, height: 350 } }); const errs = [];
p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript(() => { window.__n = 0; for (const k of ['createOscillator', 'createBufferSource']) { const o = AudioContext.prototype[k]; AudioContext.prototype[k] = function () { window.__n++; return o.apply(this, arguments); }; } });
await p.goto((process.env.URL || 'http://127.0.0.1:4260/index.html') + '?from=' + (process.env.FROM || 50));
await p.waitForFunction(() => window.__dioramaReady === true, null, { timeout: 100000 });
await p.click('#snd'); await p.waitForTimeout(+(process.env.D || 25) * 1000);
console.log('sources started:', await p.evaluate(() => window.__n), 'errors:', errs.length ? errs : 'none'); await b.close();
