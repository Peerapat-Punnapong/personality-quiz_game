import { useEffect, useRef, useState } from 'react';
import { QUESTIONS, thaiNum, type Card } from '../data/quiz';
import { computeResult } from '../data/scoring';
import { navigate } from '../lib/router';
import { getQuiz, setAnswer, setPendingReveal, useQuiz } from '../lib/store';
import { Flame, Img, SceneBg, useTilt } from '../components/ui';
import { preloadReveal } from './Reveal';
import { SceneFx } from '../components/SceneFx';
import { play } from '../lib/sound';

function AnswerCard({ c, i, selected, dim, onPick }: { c: Card; i: number; selected: boolean; dim: boolean; onPick: () => void }) {
  const ref = useTilt<HTMLButtonElement>(6);
  const slug = c.img.replace('assets/', '').replace('.webp', '');
  return <div className="ans" style={{ '--i': i } as any}>
    <span className="ans-letter">ไพ่ {c.letter}</span>
    <button ref={ref} className={`card ${selected ? 'selected' : ''} ${dim ? 'dim' : ''}`} onClick={onPick} aria-pressed={selected} data-sfx="chime" onPointerEnter={() => play('tick')}
      aria-label={`ไพ่ ${c.letter} ${c.label}: ${c.caption.replace('\n', ' ')}`}>
      <span className="card-glow" /><Img slug={slug} alt="" eager={i < 4} /><span className="card-shine" />
      <span className="sparks" aria-hidden="true">{[0, 1, 2, 3, 4].map(k => <i key={k} />)}</span>
      {selected && <span className="ripple" aria-hidden="true" />}
    </button>
    <p className="ans-cap">{c.caption.split('\n').map((l, k) => <span key={k}>{l}<br /></span>)}</p>
  </div>;
}

export default function Quiz({ n }: { n: number }) {
  const q = QUESTIONS[n - 1];
  const { answers } = useQuiz();
  const [picked, setPicked] = useState<number | null>(answers[n - 1]);
  const lock = useRef(false);
  const frameRef = useTilt<HTMLElement>(5);
  useEffect(() => { setPicked(getQuiz().answers[n - 1]); lock.current = false; }, [n]);
  useEffect(() => { // guard: can't skip ahead past unanswered questions
    const a = getQuiz().answers; const firstGap = a.findIndex(x => x === null);
    if (firstGap !== -1 && firstGap < n - 1) navigate(`/quiz/${firstGap + 1}`, 'none', true);
    if (n < 10) { const nq = QUESTIONS[n]; [nq.scene, ...nq.cards.map(c => c.img)].forEach(s => { const im = new Image(); im.src = s; }); }
    if (n >= 8) preloadReveal();
  }, [n]);
  const pick = (i: number) => {
    if (lock.current) return; lock.current = true;
    if (n === 10) play('sparkle');
    setPicked(i); setAnswer(n, i);
    setTimeout(() => {
      if (n < 10) return navigate(`/quiz/${n + 1}`, 'fade');
      const a = getQuiz().answers as number[];
      setPendingReveal(computeResult(a));
      navigate('/reveal', 'portal');
    }, 650);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { const m = '1234'.indexOf(e.key) + 1 || 'abcd'.indexOf(e.key.toLowerCase()) + 1; if (m) pick(m - 1); };
    addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  });
  const [l1, l2] = q.narrative.split('\n');
  return <main className="stage quiz" key={n}>
    <SceneBg bg="quiz" dim={0.2} />
    <div className="stage-inner">
      <header className="quiz-head">
        {n > 1 ? <button className="pill small back" data-sfx="back" onClick={() => navigate(`/quiz/${n - 1}`, 'fade')}>← ย้อนกลับ</button> : <button className="pill small back" data-sfx="back" onClick={() => navigate('/ready', 'fade')}>← ย้อนกลับ</button>}
        <h1 className="flame-title stage-title" aria-live="polite"><span className="ft-line" /><Flame /><span className="ft-text">คำถามที่ {thaiNum(n)} /{thaiNum(10)}</span><Flame flip /><span className="ft-line r" /></h1>
        <span className="sr-only">คำถามที่ {n} จาก 10</span>
      </header>
      <div className="progress" aria-hidden="true">{QUESTIONS.map(x => <i key={x.n} className={x.n < n || answers[x.n - 1] !== null ? 'done' : x.n === n ? 'now' : ''} />)}</div>
      <figure className="scene-frame" ref={frameRef}><span className="frame-glow" aria-hidden="true" /><div className="kb-wrap">{q.video
        ? <video src={q.video} muted playsInline autoPlay loop poster={q.scene} />
        : <Img slug={q.scene.replace('assets/', '').replace('.webp', '')} alt="" eager className="kb-live" />}<SceneFx n={n} /></div></figure>
      <p className="q-narr"><span>{l1}</span> <span>{l2}</span></p>
      <h2 className="q-text">{q.question}</h2>
      <div className="cards">{q.cards.map((c, i) => <AnswerCard key={c.letter} c={c} i={i} selected={picked === i} dim={picked !== null && picked !== i} onPick={() => pick(i)} />)}</div>
    </div>
  </main>;
}
