// close-up of a point: node qa/close.mjs T px py pz  (camera 6 m out along the fixed view direction)
import { chromium } from 'playwright-core';
const [T, x, y, z] = process.argv.slice(2).map(Number); const D = +(process.env.D || 6);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 700, height: 900 }, deviceScaleFactor: 1 });
await p.goto((process.env.URL || 'http://127.0.0.1:4260/index.html'));
await p.waitForFunction(() => window.__dioramaReady === true, null, { timeout: 100000 });
await p.evaluate(([T, x, y, z, D]) => { const d = window.__diorama; d.freeze(T); const c = Math.cos(33 * Math.PI / 180), s = Math.sin(33 * Math.PI / 180), a = Math.PI / 4; d.view([x + D * c * Math.cos(a), y + D * s, z + D * c * Math.sin(a)], [x, y, z]); d.post.render(d.scene, d.camera); }, [T, x, y, z, D]);
await p.waitForTimeout(300); await p.screenshot({ path: process.env.OUT || '/tmp/close.png' }); await b.close();
