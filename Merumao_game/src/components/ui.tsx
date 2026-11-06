import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import manifest from '../../public/assets/manifest.json';
type M = Record<string, { w: number; h: number; source: string }>;
const MAN = manifest as unknown as M;

/** Image that always keeps its intrinsic aspect ratio (width/height from manifest). */
export function Img({ slug, alt = '', className = '', eager = false, style }: { slug: string; alt?: string; className?: string; eager?: boolean; style?: CSSProperties }) {
  const m = MAN[slug];
  return <img src={`assets/${slug}.webp`} alt={alt} width={m?.w} height={m?.h} className={'img ' + className} style={style}
    loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} />;
}
export const dims = (slug: string) => MAN[slug];

/** Orange flame glyph used in every section title. */
export const Flame = ({ size = 26, flip = false }: { size?: number; flip?: boolean }) => (
  <svg className="flame" width={size} height={size * 1.2} viewBox="0 0 40 48" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <defs><linearGradient id="fg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff3d1f" /><stop offset=".6" stopColor="#ff7a1f" /><stop offset="1" stopColor="#ffb347" /></linearGradient></defs>
    <path fill="url(#fg)" d="M20 2c3 9 14 13 14 27a14 14 0 0 1-28 0c0-7 4-11 7-14 0 5 2 8 5 9-2-8 0-15 2-22z" />
    <path fill="#2a1030" d="M20 26c2 4 7 6 7 12a7 7 0 0 1-14 0c0-3 2-5 3-6 0 2 1 4 3 4-1-4 0-7 1-10z" />
  </svg>
);
/** "──◆🔥  Title  🔥◆──" header used across pages. */
export const FlameTitle = ({ children, as: Tag = 'h2', className = '' }: { children: ReactNode; as?: any; className?: string }) => (
  <Tag className={'flame-title ' + className}>
    <span className="ft-line" aria-hidden="true" /><Flame /><span className="ft-text">{children}</span><Flame flip /><span className="ft-line r" aria-hidden="true" />
  </Tag>
);
export const Diamond = ({ className = '' }: { className?: string }) => (
  <div className={'diamond-rule ' + className} aria-hidden="true"><span /><i /><span /></div>
);
export const Arrow = () => <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

/** Small rising sparks / spirit motes (pure CSS, deterministic positions). */
export function Particles({ count = 18, color = 'var(--violet)', className = '' }: { count?: number; color?: string; className?: string }) {
  const parts = useMemo(() => Array.from({ length: count }, (_, i) => {
    const r = (k: number) => ((Math.sin((i + 1) * 9301 + k * 49297) + 1) / 2);
    return { left: `${r(1) * 100}%`, top: `${40 + r(2) * 60}%`, size: 2 + r(3) * 4, delay: -r(4) * 8, dur: 5 + r(5) * 6, gold: r(6) > .72 };
  }), [count]);
  return <div className={'particles ' + className} aria-hidden="true">
    {parts.map((p, i) => <span key={i} style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, background: p.gold ? 'var(--gold)' : color }} />)}
  </div>;
}

/** Drifting purple smoke built from the supplied smoke layers. */
export function Smoke({ variant = 'a' }: { variant?: 'a' | 'b' }) {
  return <div className={'smoke smoke-' + variant} aria-hidden="true">
    <Img slug="home/smoke7" className="s1" /><Img slug="home/smoke2" className="s2" /><Img slug="home/smoke1" className="s3" />
  </div>;
}

/** Full-screen scene background: pre-baked blurred art + slow Ken Burns + scrim. */
export function SceneBg({ bg, focal = '50% 50%', blur = true, dim = 0.15 }: { bg: string; focal?: string; blur?: boolean; dim?: number }) {
  const slug = `bg/${bg}${blur ? '-blur' : ''}`;
  return <div className="scene-bg" aria-hidden="true">
    <img src={`assets/${slug}.webp`} alt="" className="kb" style={{ objectPosition: focal }} decoding="async" />
    <div className="scrim" style={{ background: `rgba(14,6,26,${dim})` }} />
  </div>;
}

/** Pointer-driven 3D tilt (max deg) for cards & characters. */
export function useTilt<T extends HTMLElement>(max = 6) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el || matchMedia('(hover: none)').matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--ry', `${x * max * 2}deg`); el.style.setProperty('--rx', `${-y * max * 2}deg`);
      el.style.setProperty('--mx', `${(x + .5) * 100}%`); el.style.setProperty('--my', `${(y + .5) * 100}%`);
    };
    const leave = () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, [max]);
  return ref;
}

/** Reveal children when scrolled into view. */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: any }) {
  // Visible at rest: only elements that start below the fold animate in on scroll.
  const ref = useRef<HTMLElement | null>(null); const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!('IntersectionObserver' in window) || el.getBoundingClientRect().top < innerHeight) { setOn(true); return; }
    setOn(false);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }), { threshold: .12 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${on === false ? 'pre' : on ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</Tag>;
}

export function Toast({ msg }: { msg: string | null }) { return <div className={'toast ' + (msg ? 'show' : '')} role="status" aria-live="polite">{msg}</div>; }
