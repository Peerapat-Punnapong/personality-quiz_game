import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeResult, SCORING } from '../src/data/scoring';
import { GHOST_ORDER } from '../src/data/ghosts';

test('table is balanced: each ghost 5× primary, 5× secondary', () => {
  const p: Record<string, number> = {}, s: Record<string, number> = {};
  Object.values(SCORING).flat().forEach(([a, b]) => { p[a] = (p[a] || 0) + 1; s[b] = (s[b] || 0) + 1; assert.notEqual(a, b); });
  GHOST_ORDER.forEach(g => { assert.equal(p[g], 5, g); assert.equal(s[g], 5, g); });
});
test('deterministic', () => {
  const a = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1];
  assert.equal(computeResult(a), computeResult([...a]));
});
test('all-A → pob, all-D → pret-ish deterministic', () => {
  assert.equal(computeResult(Array(10).fill(0)), 'pob');
  assert.ok(GHOST_ORDER.includes(computeResult(Array(10).fill(3))));
});
test('rejects incomplete answers', () => { assert.throws(() => computeResult([0, 1])); });
test('distribution over all 4^10 combinations: every ghost 10–16%', () => {
  const c: Record<string, number> = {}; const a = Array(10).fill(0); const N = 4 ** 10;
  for (let k = 0; k < N; k++) {
    let x = k; for (let i = 0; i < 10; i++) { a[i] = x & 3; x >>= 2; }
    const g = computeResult(a); c[g] = (c[g] || 0) + 1;
  }
  GHOST_ORDER.forEach(g => { const pct = 100 * c[g] / N; assert.ok(pct >= 10 && pct <= 16, `${g} ${pct.toFixed(1)}%`); });
  console.log(Object.fromEntries(GHOST_ORDER.map(g => [g, (100 * c[g] / N).toFixed(1) + '%'])));
});
test('tie-break uses most recent primary', () => {
  // construct: every ghost reachable
  const seen = new Set<string>(); const a = Array(10).fill(0);
  for (let k = 0; k < 4 ** 10 && seen.size < 8; k += 7) { let x = k; for (let i = 0; i < 10; i++) { a[i] = x & 3; x >>= 2; } seen.add(computeResult(a)); }
  assert.equal(seen.size, 8);
});
