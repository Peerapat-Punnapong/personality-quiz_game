import { useEffect, useRef, useState } from 'react';
import { isGhostId } from '../data/ghosts';
import { navigate, reducedMotion } from '../lib/router';
import { getQuiz, setPendingReveal } from '../lib/store';
import { Img, Particles } from '../components/ui';
import { Runes } from '../components/Veil';
import { duck, play } from '../lib/sound';

const portrait = () => innerHeight > innerWidth * 1.1;
const pickSrc = () => portrait() ? 'assets/video/reveal-portrait.mp4' : innerWidth <= 900 ? 'assets/video/reveal-720.mp4' : 'assets/video/reveal-1080.mp4';
let preloader: HTMLVideoElement | null = null;
/** Warm the browser cache during Q8–Q10 so the cinematic starts instantly. */
export function preloadReveal() {
  if (preloader) return; preloader = document.createElement('video');
  preloader.preload = 'auto'; preloader.muted = true; preloader.src = pickSrc(); preloader.load();
}

export default function Reveal() {
  const ghost = getQuiz().pendingReveal;
  const vid = useRef<HTMLVideoElement | null>(null);
  const [mode, setMode] = useState<'video' | 'fallback' | 'reduced'>(reducedMotion() ? 'reduced' : 'video');
  const [canSkip, setCanSkip] = useState(false);
  const [ending, setEnding] = useState(false);
  const done = useRef(false);
  const finish = () => {
    if (done.current || !isGhostId(ghost ?? undefined)) return; done.current = true;
    setEnding(true); setPendingReveal(null);
    setTimeout(() => navigate(`/result/${ghost}`, 'flash', true), 520);
  };
  useEffect(() => {
    if (!isGhostId(ghost ?? undefined)) { navigate('/', 'none', true); return; } // refresh after reveal → home
    duck(true); if (mode !== 'video') play('portal');
    const t1 = setTimeout(() => setCanSkip(true), 1000);
    let t2: any, t3: any;
    if (mode === 'video') {
      const v = vid.current!;
      t2 = setTimeout(() => { if (v.currentTime < 0.05) setMode('fallback'); }, 2500); // slow/failed → web fallback
      v.play().catch(() => setMode('fallback'));
    }
    if (mode === 'fallback') t3 = setTimeout(finish, 6500);
    if (mode === 'reduced') t3 = setTimeout(finish, 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); duck(false); };
  }, [mode]);
  return <main className={`reveal-stage ${ending ? 'ending' : ''}`}>
    {mode === 'video' && <video ref={vid} className="reveal-video" muted playsInline preload="auto" poster="assets/video/poster.webp"
      src={pickSrc()} onEnded={finish} onError={() => setMode('fallback')} />}
    {mode !== 'video' && <div className={`reveal-fallback ${mode}`}>
      <img src="assets/bg/result-blur.webp" alt="" className="rf-bg" />
      <div className="rf-cards">{[0, 1, 2, 3, 4].map(i => <span key={i} style={{ '--k': i } as any} />)}</div>
      <Runes className="rf-runes" /><Runes className="rf-runes two" />
      <Img slug="icons/step-siamsi" alt="เซียมซี" eager className="rf-siamsi" />
      <span className="rf-stick" />
      <Particles count={36} />
      <div className="rf-tunnel" />
    </div>}
    <div className="reveal-flash" />
    {canSkip && !ending && <button className="pill small skip" onClick={finish}>ข้าม ›</button>}
  </main>;
}
