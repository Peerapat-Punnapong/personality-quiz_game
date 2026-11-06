import { useEffect } from 'react';
import { INTRO } from '../data/intro';
import { navigate } from '../lib/router';
import { Arrow, FlameTitle, Img, Particles, SceneBg, Smoke } from '../components/ui';

export default function Intro({ n }: { n: number }) {
  const s = INTRO[Math.min(Math.max(n, 1), 6) - 1];
  const next = () => n < 6 ? navigate(`/intro/${n + 1}`, n === 5 ? 'portal' : 'fade') : navigate('/ready', 'fade');
  const prev = () => n > 1 ? navigate(`/intro/${n - 1}`, 'fade') : navigate('/', 'fade');
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); };
    addEventListener('keydown', k);
    let x0 = 0; const ts = (e: TouchEvent) => { x0 = e.touches[0].clientX; };
    const te = (e: TouchEvent) => { const dx = e.changedTouches[0].clientX - x0; if (dx > 70) prev(); if (dx < -70) next(); };
    addEventListener('touchstart', ts, { passive: true }); addEventListener('touchend', te);
    if (n < 6) { const im = new Image(); im.src = INTRO[n].art; }
    return () => { removeEventListener('keydown', k); removeEventListener('touchstart', ts); removeEventListener('touchend', te); };
  }, [n]);
  const lines = s.text.split('\n');
  return <main className={`stage intro intro-${n}`} key={n}>
    <SceneBg bg={s.bg} focal={s.focal} />
    <Smoke variant="b" />
    <div className="stage-inner">
      <FlameTitle as="h1" className="stage-title">เกริ่นนำ</FlameTitle>
      <div className="intro-art"><div className="art-glow" /><Img slug={s.art.replace('assets/', '').replace('.webp', '')} alt={s.artAlt} eager className="art-in" /><Particles count={14} /></div>
      <p className="narration">{lines.map((l, i) => <span key={i} className="line" style={{ animationDelay: `${450 + i * 260}ms` }}>{l}</span>)}</p>
      <div className="intro-nav">
        {s.skip ? <button className="pill" onClick={() => navigate('/ready', 'smoke')}>ข้ามบทนำ</button> : <span />}
        <span className="dots" aria-label={`ฉากที่ ${n} จาก 6`}>{INTRO.map(x => <i key={x.n} className={x.n === n ? 'on' : ''} />)}</span>
        <button className="round-next" data-sfx="bell" onClick={next} aria-label="ถัดไป"><Arrow /></button>
      </div>
    </div>
  </main>;
}
