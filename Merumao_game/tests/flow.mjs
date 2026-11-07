// End-to-end flow: home → intro (next + skip) → ready → Q1–Q10 → reveal → result. Also no-stretch + overflow checks.
import { chromium } from 'playwright';
const BASE = 'http://localhost:8765/';
const b = await chromium.launch();
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
for (const vp of [{ width: 1440, height: 1024 }, { width: 390, height: 844 }]) {
  const p = await b.newPage({ viewport: vp });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(BASE + '#home'); await p.evaluate(() => sessionStorage.clear()); await p.reload();
  await p.getByRole('button', { name: /เริ่มเปิดโลกแห่งผี/ }).click(); await p.waitForTimeout(1800);
  ok(p.url().endsWith('#intro-1'), `${vp.width}: CTA → intro/1`);
  await p.getByRole('button', { name: 'ถัดไป' }).click(); await p.waitForTimeout(900);
  ok(p.url().endsWith('#intro-2'), 'next → intro/2');
  await p.getByRole('button', { name: 'ข้ามบทนำ' }).click(); await p.waitForTimeout(1800);
  ok(p.url().endsWith('#ready'), 'skip → ready');
  await p.getByRole('button', { name: /เริ่มเปิดไพ่ทำนาย/ }).click(); await p.waitForTimeout(1800);
  ok(p.url().endsWith('#quiz-1'), 'ready → quiz/1');
  const picks = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1];
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(1100);
    const cards = p.locator('.card'); await cards.nth(picks[i]).click();
    if (i === 3) { // back-navigation keeps answers
      await p.waitForTimeout(1400); await p.getByRole('button', { name: /ย้อนกลับ/ }).click(); await p.waitForTimeout(1200);
      ok(await p.locator('.card').nth(picks[3]).getAttribute('aria-pressed') === 'true', 'back keeps Q4 answer');
      await p.reload(); await p.waitForTimeout(1200);
      ok(p.url().endsWith('#quiz-4') && await p.locator('.card').nth(picks[3]).getAttribute('aria-pressed') === 'true', 'refresh keeps answers');
      await p.locator('.card').nth(picks[3]).click();
    }
    await p.waitForTimeout(500);
  }
  await p.waitForTimeout(1600);
  ok(p.url().includes('#reveal'), 'Q10 → reveal');
  await p.waitForTimeout(1300);
  const skip = p.getByRole('button', { name: /ข้าม/ });
  ok(await skip.isVisible(), 'skip button visible after 1s');
  if (vp.width === 390) await skip.click();
  await p.waitForURL(/#result-/, { timeout: 25000 });
  const id = p.url().split('-').pop();
    ok(id === 'maemo', 'result matches scoring engine (answers ABCDABCDAB → INFJ maemo): ' + id);
  await p.waitForTimeout(2500);
  // no-stretch: rendered aspect == natural aspect for every <img> not using object-fit
  const bad = await p.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth && i.offsetWidth > 2).filter(i => {
    const fit = getComputedStyle(i).objectFit; if (fit === 'cover' || fit === 'contain') return false;
    const r2 = i.naturalWidth / i.naturalHeight; return Math.abs(i.offsetHeight - i.offsetWidth / r2) > 1.5; // >1.5px off = stretched
  }).map(i => i.src.split('/').slice(-2).join('/') + ` ${i.offsetWidth}x${i.offsetHeight}`));
  ok(bad.length === 0, 'no stretched images on result ' + bad.join(', '));
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal scroll');
  // share fallback (no navigator.share in headless) → clipboard or link box
  await p.getByRole('button', { name: /แชร์ผลลัพธ์/ }).click();
  await p.waitForSelector('.share-preview', { timeout: 10000 }).catch(() => {});
  ok(await p.locator('.share-preview').count() > 0, 'share builds the result image');
  await p.locator('.share-card .modal-x').click(); await p.waitForTimeout(300);
  await p.getByRole('button', { name: /หน้าหลัก/ }).click(); await p.waitForTimeout(1600);
  ok(p.url().endsWith('#home'), 'home button');
  await p.goto(BASE + '#result-pret'); await p.waitForTimeout(800);
  ok((await p.locator('.name-plate').textContent()) === 'ผีเปรตเบรกมองหนุ่มตี๋', 'direct /result/pret');
  ok(errs.length === 0, 'no page errors ' + errs.join(' | '));
  await p.close();
}
// reduced motion
const ctx = await b.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
const p = await ctx.newPage(); await p.goto(BASE + '#home');
await p.evaluate(() => sessionStorage.setItem('merumao.v1', JSON.stringify({ answers: [0,0,0,0,0,0,0,0,0,null], pendingReveal: null })));
await p.goto(BASE + '#quiz-10'); await p.reload(); await p.waitForTimeout(800);
await p.locator('.card').nth(0).click(); for (let i = 0; i < 20 && !p.url().endsWith('#result-pob'); i++) await p.waitForTimeout(400);
ok(p.url().endsWith('#result-pob'), 'reduced-motion flow reaches result (all A → pob)');
await b.close();
console.log(fails ? `${fails} FAILED` : 'ALL PASSED'); process.exit(fails ? 1 : 0);
