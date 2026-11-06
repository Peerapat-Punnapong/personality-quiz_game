// Quiz progress: React state mirrored to sessionStorage (survives refresh mid-quiz).
import { useSyncExternalStore } from 'react';
import type { GhostId } from '../data/ghosts';
interface State { answers: (number | null)[]; pendingReveal: GhostId | null; }
const KEY = 'merumao.v1';
const load = (): State => {
  try { const s = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (s && Array.isArray(s.answers) && s.answers.length === 10) return s; } catch { /* storage blocked */ }
  return { answers: Array(10).fill(null), pendingReveal: null };
};
let state = load();
const subs = new Set<() => void>();
const set = (s: State) => { state = s; try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } subs.forEach(f => f()); };
export const useQuiz = () => useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => state);
export const getQuiz = () => state;
export const setAnswer = (q: number, opt: number) => { const a = [...state.answers]; a[q - 1] = opt; set({ ...state, answers: a }); };
export const setPendingReveal = (g: GhostId | null) => set({ ...state, pendingReveal: g });
export const resetQuiz = () => set({ answers: Array(10).fill(null), pendingReveal: null });
export const firstUnanswered = () => { const i = state.answers.findIndex(a => a === null); return i === -1 ? 10 : i + 1; };
