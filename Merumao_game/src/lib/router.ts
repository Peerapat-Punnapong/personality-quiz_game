// Tiny hash router (works on any static host / artifact sandbox).
import { useSyncExternalStore } from 'react';
export type Fx = 'none' | 'fade' | 'smoke' | 'portal' | 'flash';
const listeners = new Set<() => void>();
// Routes live in a plain hash name (e.g. #quiz-3, #result-pob) so links survive any static host / artifact viewer.
const toHash = (path: string) => path.replace(/^\//, '').replace(/\//g, '-') || 'home';
const getPath = () => { const h = location.hash.replace(/^#\/?/, ''); return !h || h === 'home' ? '/' : '/' + h.replace(/^(intro|quiz|result)[-/]/, '$1/'); };
export const hrefFor = (path: string) => location.href.split('#')[0] + '#' + toHash(path);
window.addEventListener('hashchange', () => listeners.forEach(l => l()));
export function useRoute(): string {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, getPath);
}
type VeilFn = (fx: Fx, swap: () => void) => void;
let veil: VeilFn | null = null;
export const registerVeil = (fn: VeilFn | null) => { veil = fn; };
export function navigate(path: string, fx: Fx = 'fade', replace = false) {
  const swap = () => {
    if (replace) history.replaceState(null, '', '#' + toHash(path)); else location.hash = toHash(path);
    if (replace) listeners.forEach(l => l());
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };
  if (veil && fx !== 'none' && !reducedMotion()) veil(fx, swap); else swap();
}
export const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
