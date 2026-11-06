// Minimal React typings (no @types/react available offline). Keeps tsc useful for our own code.
declare module 'react' {
  export type ReactNode = any;
  export type CSSProperties = Record<string, string | number | undefined>;
  export type Dispatch<T> = (v: T | ((prev: T) => T)) => void;
  export function useState<T>(init: T | (() => T)): [T, Dispatch<T>];
  export function useEffect(fn: () => void | (() => void), deps?: unknown[]): void;
  export function useLayoutEffect(fn: () => void | (() => void), deps?: unknown[]): void;
  export function useRef<T>(init: T): { current: T };
  export function useRef<T>(init: T | null): { current: T | null };
  export function useMemo<T>(fn: () => T, deps: unknown[]): T;
  export function useCallback<T extends (...a: any[]) => any>(fn: T, deps: unknown[]): T;
  export function useSyncExternalStore<T>(sub: (cb: () => void) => () => void, get: () => T, getServer?: () => T): T;
  export const Fragment: any; export const StrictMode: any;
  const React: any; export default React;
}
declare module 'react/jsx-runtime' { export const jsx: any; export const jsxs: any; export const Fragment: any; }
declare module 'react-dom/client' { export function createRoot(el: Element): { render(n: any): void }; }
declare namespace JSX { interface IntrinsicElements { [k: string]: any } interface Element {} interface ElementAttributesProperty { props: {} } interface IntrinsicAttributes { key?: any } }
declare module '*.css';
declare module 'react-dom' { export function createPortal(node: any, el: Element): any; }
