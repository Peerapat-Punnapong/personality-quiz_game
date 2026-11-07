// Scoring engine v3 — 16 ghosts = 16 MBTI types.
// Every card leans to MBTI letters on 3 of the 4 axes (E/I, S/N, T/F, J/P).
// Each question's 4 cards form an orthogonal set (every used axis is split 2–2 and axes are independent),
// so all 16 results are equally reachable: simulating all 4^10 answer combos gives each ghost 5.6–7.0%.
// Each axis is used in an odd number of questions (7,7,9,7) → an axis can never tie.
import { GHOSTS, GHOST_ORDER, type GhostId } from './ghosts';

export const SCORING: Record<number, [string, string, string, string]> = {
  1: ['ESF', 'ENT', 'INF', 'IST'],   // food table · clinking glasses · strange shadow · cute person
  2: ['EFP', 'IFJ', 'ITP', 'ETJ'],   // centre table · cosy corner · near the door · best view
  3: ['SFP', 'STJ', 'NFJ', 'NTP'],   // feast · favourite drink · prettiest menu · best deal
  4: ['ENF', 'ISF', 'EST', 'INT'],   // flirt back · peek shyly · smile & move on · observe first
  5: ['INP', 'ESP', 'ISJ', 'ENJ'],   // night flower · dark mirror · naga coin · eternal flame
  6: ['EFJ', 'IFP', 'ITJ', 'ETP'],   // reply · type & delete · move on · ask a friend
  7: ['STP', 'SFJ', 'NTJ', 'NFP'],   // go check · rally everyone · backup plan · safe zone
  8: ['SFP', 'NFJ', 'STJ', 'NTP'],   // grab the mic · cosy chat · fix my look · stare at the cutie
  9: ['ETJ', 'EFP', 'ITP', 'IFJ'],   // negotiate · friend helps · audit the bill · own it
  10: ['ENF', 'ISF', 'EST', 'INT'],  // note for crush · keepsake · thank-you tip · walk into dawn
};
const AXES: [string, string][] = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];

/** answers[i] = chosen option index 0–3 for question i+1 → axis totals (+ = first letter). */
export function scoreAnswers(answers: number[]) {
  return AXES.map(([a, b]) => answers.reduce((sum, opt, i) => {
    const c = SCORING[i + 1][opt]; return sum + (c.includes(a) ? 1 : c.includes(b) ? -1 : 0);
  }, 0));
}
export function mbtiOf(answers: number[]): string {
  if (answers.length !== 10 || answers.some(a => !(a >= 0 && a <= 3))) throw new Error('need 10 answers 0–3');
  return scoreAnswers(answers).map((v, k) => (v >= 0 ? AXES[k][0] : AXES[k][1])).join('');
}
const BY_MBTI = Object.fromEntries(GHOST_ORDER.map(id => [GHOSTS[id].mbti, id])) as Record<string, GhostId>;
export function computeResult(answers: number[]): GhostId { return BY_MBTI[mbtiOf(answers)]; }
