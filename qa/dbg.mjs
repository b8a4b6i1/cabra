import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', headless: true, args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 600, height: 400 } }); p.on('pageerror', (e) => console.log('PAGEERR', e.stack.slice(0, 900))); p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(m.type(), m.text().slice(0, 600)); });
await p.goto('http://127.0.0.1:4290/index.html?t=2'); await p.waitForTimeout(25000); console.log('ready', await p.evaluate(() => window.__dioramaReady)); await b.close();
