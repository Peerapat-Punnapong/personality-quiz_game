// Scoring engine (prompt v2 §6). Each card: +2 primary, +1 secondary. Balanced table:
// every ghost is primary on 5 cards and secondary on 5 cards.
import { GHOST_ORDER, type GhostId } from './ghosts';
export type Weight = [primary: GhostId, secondary: GhostId];

export const SCORING: Record<number, [Weight, Weight, Weight, Weight]> = {
  1: [['pob', 'dib'], ['takien', 'pob'], ['am', 'tani'], ['pret', 'krasue']],
  2: [['pob', 'pret'], ['dib', 'kongkoi'], ['tani', 'takien'], ['pret', 'pob']],
  3: [['pob', 'dib'], ['dib', 'am'], ['krasue', 'pret'], ['takien', 'tani']],
  4: [['pob', 'pret'], ['kongkoi', 'am'], ['tani', 'takien'], ['am', 'kongkoi']],
  5: [['am', 'dib'], ['krasue', 'am'], ['takien', 'tani'], ['kongkoi', 'pob']],
  6: [['am', 'kongkoi'], ['kongkoi', 'am'], ['tani', 'dib'], ['krasue', 'takien']],
  7: [['pret', 'tani'], ['krasue', 'pob'], ['takien', 'tani'], ['dib', 'kongkoi']],
  8: [['pob', 'pret'], ['dib', 'kongkoi'], ['krasue', 'pret'], ['pret', 'krasue']],
  9: [['takien', 'pob'], ['dib', 'krasue'], ['kongkoi', 'am'], ['tani', 'takien']],
  10: [['pret', 'krasue'], ['am', 'dib'], ['kongkoi', 'krasue'], ['tani', 'takien']],
};
export const PRIMARY_PTS = 2, SECONDARY_PTS = 1;

/** answers[i] = chosen option index 0–3 for question i+1 */
export function scoreAnswers(answers: number[]) {
  const total = Object.fromEntries(GHOST_ORDER.map(g => [g, 0])) as Record<GhostId, number>;
  const primaries = { ...total };
  answers.forEach((opt, i) => {
    const [p, s] = SCORING[i + 1][opt];
    total[p] += PRIMARY_PTS; total[s] += SECONDARY_PTS; primaries[p] += 1;
  });
  return { total, primaries };
}

export function computeResult(answers: number[]): GhostId {
  if (answers.length !== 10 || answers.some(a => !(a >= 0 && a <= 3))) throw new Error('need 10 answers 0–3');
  const { total, primaries } = scoreAnswers(answers);
  const best = Math.max(...GHOST_ORDER.map(g => total[g]));
  let tied = GHOST_ORDER.filter(g => total[g] === best);
  if (tied.length > 1) { // 1) most primary picks
    const bp = Math.max(...tied.map(g => primaries[g]));
    tied = tied.filter(g => primaries[g] === bp);
  }
  if (tied.length > 1) { // 2) primary of the most recent answer
    for (let i = 9; i >= 0; i--) {
      const p = SCORING[i + 1][answers[i]][0];
      if (tied.includes(p)) return p;
    }
  }
  return tied[0]; // 3) fixed order
}
