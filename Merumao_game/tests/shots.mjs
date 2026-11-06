// Visual check: screenshots of key routes at desktop + phone sizes.
import { chromium } from 'playwright';
const OUT = process.argv[2] || 'test-results/shots';
const routes = (process.argv[3] || '/,/intro/1,/intro/5,/ready,/quiz/1,/quiz/5,/result/pob,/result/krasue,/lore').split(',');
const sizes = (process.argv[4] || '1440x1024,390x844').split(',');
const b = await chromium.launch();
for (const sz of sizes) {
  const [w, h] = sz.split('x').map(Number);
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  for (const r of routes) {
    // seed answers so quiz guard doesn't redirect
    await p.goto('http://localhost:8765/#/');
    await p.evaluate(() => sessionStorage.setItem('merumao.v1', JSON.stringify({ answers: [0,1,2,3,0,1,2,3,0, null], pendingReveal: null })));
    await p.goto('http://localhost:8765/#' + r); await p.reload();
    await p.waitForTimeout(1200);
    if (r === '/' || r === '/lore') { for (let y = 0; y < 12000; y += 500) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(60); } await p.evaluate(() => scrollTo(0, 0)); }
    await p.waitForTimeout(1400);
    const full = r === '/' || r === '/lore';
    await p.screenshot({ path: `${OUT}/${sz}${r.replace(/\//g, '_')}.png`, fullPage: full });
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (ov > 0) console.log('H-OVERFLOW', sz, r, ov);
  }
  await p.close();
}
await b.close();
