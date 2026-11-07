import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeResult, mbtiOf, SCORING } from '../src/data/scoring';
import { GHOSTS, GHOST_ORDER } from '../src/data/ghosts';

test('16 ghosts cover all 16 MBTI types exactly once', () => {
  const types = GHOST_ORDER.map(g => GHOSTS[g].mbti);
  assert.equal(new Set(types).size, 16);
});
test('every question splits each used axis 2–2 and axes are orthogonal', () => {
  const ax = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
  for (const opts of Object.values(SCORING)) {
    const v = opts.map(c => ax.map(([a, b]) => (c.includes(a) ? 1 : c.includes(b) ? -1 : 0)));
    for (let k = 0; k < 4; k++) assert.equal(v.reduce((s, r) => s + r[k], 0), 0);
    for (let k = 0; k < 4; k++) for (let m = k + 1; m < 4; m++) assert.equal(v.reduce((s, r) => s + r[k] * r[m], 0), 0);
  }
});
test('deterministic + rejects incomplete', () => {
  const a = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1];
  assert.equal(computeResult(a), computeResult([...a])); assert.throws(() => computeResult([0]));
});
test('all 4^10 combinations: every ghost reachable, each 4–9%', () => {
  const c: Record<string, number> = {}; const a = Array(10).fill(0); const N = 4 ** 10;
  for (let k = 0; k < N; k++) { let x = k; for (let i = 0; i < 10; i++) { a[i] = x & 3; x >>= 2; } const g = computeResult(a); c[g] = (c[g] || 0) + 1; }
  GHOST_ORDER.forEach(g => { const pct = 100 * (c[g] || 0) / N; assert.ok(pct >= 4 && pct <= 9, `${g} ${pct.toFixed(1)}%`); });
  console.log(Object.fromEntries(GHOST_ORDER.map(g => [g, (100 * c[g] / N).toFixed(1) + '%'])));
});
test('sanity: all-A answers → extravert feeler', () => { assert.match(mbtiOf(Array(10).fill(0)), /^E.F./); });
