// Page-transition overlay: smoke sweep, portal, flash or fade. Swaps the route at the midpoint.
import { useEffect, useState } from 'react';
import { registerVeil, type Fx } from '../lib/router';
import { Img } from './ui';
import { play } from '../lib/sound';
const TIMES: Record<Fx, [number, number]> = { none: [0, 0], fade: [260, 320], smoke: [620, 700], portal: [650, 700], flash: [380, 700] };
export function Veil() {
  const [st, setSt] = useState<{ fx: Fx; phase: 'idle' | 'in' | 'out' }>({ fx: 'fade', phase: 'idle' });
  useEffect(() => {
    registerVeil((fx, swap) => {
      setSt({ fx, phase: 'in' });
      if (fx === 'smoke') play('whoosh'); else if (fx === 'portal') play('portal'); else if (fx === 'flash') play('sparkle');
      setTimeout(() => { swap(); setSt({ fx, phase: 'out' }); setTimeout(() => setSt({ fx, phase: 'idle' }), TIMES[fx][1]); }, TIMES[fx][0]);
    });
    return () => registerVeil(null);
  }, []);
  return <div className={`veil veil-${st.fx} ${st.phase}`} aria-hidden="true">
    {st.fx === 'smoke' && <><Img slug="home/smoke7" className="vs v1" eager /><Img slug="home/smoke7" className="vs v2" eager /></>}
    {st.fx === 'portal' && <div className="vportal"><Runes /></div>}
  </div>;
}
export const Runes = ({ className = '' }: { className?: string }) => (
  <svg className={'runes ' + className} viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="100" cy="100" r="92" fill="none" stroke="var(--gold)" strokeWidth="1.2" opacity=".8" />
    <circle cx="100" cy="100" r="78" fill="none" stroke="var(--violet)" strokeWidth="2" strokeDasharray="4 7" />
    <circle cx="100" cy="100" r="60" fill="none" stroke="var(--gold)" strokeWidth=".8" opacity=".7" />
    {Array.from({ length: 12 }, (_, i) => <g key={i} transform={`rotate(${i * 30} 100 100)`}><path d="M100 10 l4 8 -4 4 -4 -4z" fill="var(--gold)" /><path d="M100 30 q6 6 0 12 q-6 -6 0 -12" fill="none" stroke="var(--violet)" strokeWidth="1.4" /></g>)}
    <polygon points="100,44 148,128 52,128" fill="none" stroke="var(--violet)" strokeWidth="1" opacity=".6" />
    <polygon points="100,156 52,72 148,72" fill="none" stroke="var(--violet)" strokeWidth="1" opacity=".6" />
  </svg>
);
