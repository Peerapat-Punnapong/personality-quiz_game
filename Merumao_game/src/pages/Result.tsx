import { useEffect, useState } from 'react';
import { GHOSTS, type GhostId } from '../data/ghosts';
import { hrefFor, navigate } from '../lib/router';
import { resetQuiz } from '../lib/store';
import { Flame, Img, Particles, SceneBg, Toast } from '../components/ui';
import { play } from '../lib/sound';
import { makeResultImage } from '../lib/shareImage';

// icons in front of the 3 trait chips (same order as the mockup: food / chat / ghost)
const CHIP_ICONS = ['assets/result/chip-1-bowl.webp', 'assets/result/chip-2-chat.webp', 'assets/result/chip-3-ghost.webp'];

export default function Result({ id }: { id: GhostId }) {
  const g = GHOSTS[id];
  const [more, setMore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [card, setCard] = useState<{ url: string; file: File } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const t = setTimeout(() => play('fanfare'), 700); return () => clearTimeout(t); }, [id]);
  useEffect(() => { document.title = `คืนนี้ฉันเป็น ${g.name} · เมรุเมา`; return () => { document.title = 'เมรุเมา — คืนนี้คุณเป็นผีอะไร?'; }; }, [id]);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2200); };
  const url = hrefFor(`/result/${id}`);
  const text = `คืนนี้ฉันเป็น ${g.name}! มาเปิดไพ่ดูว่าคุณเป็นผีอะไร`;
  // 1) build the image and show a preview
  const share = async () => {
    if (busy) return; setBusy(true);
    try {
      const blob = await makeResultImage(g, location.host || 'merumao');
      const file = new File([blob], `merumao-${id}.png`, { type: 'image/png' });
      setCard({ url: URL.createObjectURL(blob), file });
    } catch { shareLink(); } finally { setBusy(false); }
  };
  // 2) share the picture (phones) …
  const shareImage = async () => {
    if (!card) return;
    try {
      if (navigator.canShare?.({ files: [card.file] })) { await navigator.share({ files: [card.file], title: 'เมรุเมา', text: `${text} ${url}` }); return; }
    } catch (e: any) { if (e?.name === 'AbortError') return; }
    saveImage();
  };
  // … or save it (desktop / browsers without file sharing)
  const saveImage = () => {
    if (!card) return;
    const a = document.createElement('a'); a.href = card.url; a.download = card.file.name; document.body.append(a); a.click(); a.remove();
    flash('บันทึกรูปแล้ว');
  };
  const shareLink = async () => {
    try { if (navigator.share) { await navigator.share({ title: 'เมรุเมา', text, url }); return; } } catch (e: any) { if (e?.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(`${text} ${url}`); flash('คัดลอกลิงก์แล้ว'); } catch { setLink(url); }
  };
  const closeCard = () => { if (card) URL.revokeObjectURL(card.url); setCard(null); };
  const again = () => { resetQuiz(); navigate('/ready', 'portal'); };
  return <main className="stage result" style={{ '--aura': g.aura } as any}>
    <SceneBg bg="result" blur dim={0.1} />
    <Particles count={16} className="bg-motes" />
    <div className="r-frame">
      <span className="rc tl" /><span className="rc tr" /><span className="rc bl" /><span className="rc br" /><i className="r-dia top" /><i className="r-dia bottom" />
      <button className="r-logo" onClick={() => navigate('/', 'fade')} aria-label="หน้าแรก"><Img slug="brand/logo" alt="เมรุเมา" eager /></button>
      <Img slug="result/sign-lantern" alt="" eager className="r-sign" />
      <h1 className="flame-title stage-title r-title"><span className="ft-line" /><Flame /><span className="ft-text">คืนนี้คุณเป็นผี.....</span><Flame flip /><span className="ft-line r" /></h1>
      <div className="r-grid">
        <section className="r-left">
          <h2 className="name-plate r-step" style={{ '--s': 1 } as any}>{g.name}</h2>
          <div className="r-char">
            <div className="aura big" /><div className="aura-ring" /><Particles count={22} color={g.aura} />
            <Img slug={`ghosts/${id}`} alt={g.name} eager className="char enter" />
          </div>
        </section>
        <section className="r-right">
          <div className="quote-card r-step" style={{ '--s': 2 } as any}>
            <p className="big-quote">“{g.quote}”</p>
            <p className="mbti-line"><b>{g.mbti}</b> - {more ? <>{g.mbtiTh} — {g.mbtiDesc}<br /><br />{g.ghostDesc}</> : g.short}</p>
            <button className="more" onClick={() => setMore(m => !m)} aria-expanded={more}>{more ? 'ย่อ' : 'อ่านเพิ่มเติม...'}</button>
          </div>
          <ul className="chips r-step" style={{ '--s': 3 } as any} title={g.chipsDraft ? 'draft' : undefined}>
            {g.chips.map((c, i) => <li key={c} style={{ '--k': i } as any}><img src={CHIP_ICONS[i]} alt="" className="chip-ic" width={34} height={34} />{c}</li>)}
          </ul>
          <div className="traits">
            {([['str', 'จุดแข็ง', g.strengths], ['weak', 'จุดอ่อน', g.weaknesses], ['love', 'ความรัก', g.love]] as const).map(([k, t, d], i) =>
              <article key={k} className="trait r-step" style={{ '--s': 4 + i } as any}>
                <Img slug="result/trait-frame" alt="" className="trait-bg" eager />
                <header><Img slug={`result/icon-${k === 'str' ? 'strength' : k}`} alt="" className="trait-ic" eager /><h3>{t}</h3></header><p>{d}</p>
                <Img slug={`result/prop-${k === 'str' ? 'glasses' : k === 'weak' ? 'pot' : 'bowl'}`} alt="" className={`trait-prop p-${k}`} eager />
              </article>)}
          </div>
        </section>
      </div>
      <div className="r-actions r-step" style={{ '--s': 7 } as any}>
        <button className="btn-orange" onClick={share} disabled={busy}>{busy ? 'กำลังเสกรูป...' : 'แชร์ผลลัพธ์'} <img src="assets/result/btn-ghost-yellow.webp" alt="" className="btn-ic" width={34} height={34} /></button>
        <button className="btn-purple" data-sfx="back" onClick={() => navigate('/', 'portal')}><img src="assets/result/btn-ghost-purple.webp" alt="" className="btn-ic" width={34} height={34} /> หน้าหลัก</button>
        <button className="link-again" onClick={again}>เล่นอีกครั้ง</button>
      </div>
    </div>
    {link && <div className="share-fallback" role="dialog" aria-label="คัดลอกลิงก์">
      <p>คัดลอกลิงก์นี้ไปแชร์ได้เลย</p><input readOnly value={link} onFocus={(e: any) => e.currentTarget.select()} autoFocus /><button className="pill small" onClick={() => setLink(null)}>ปิด</button>
    </div>}
    {card && <div className="modal-back" onClick={closeCard}>
      <div className="share-card" role="dialog" aria-modal="true" aria-label="รูปผลลัพธ์" onClick={(e: any) => e.stopPropagation()}>
        <button className="modal-x" onClick={closeCard} data-sfx="back" aria-label="ปิด">×</button>
        <img src={card.url} alt={`ผลลัพธ์: ${g.name}`} className="share-preview" />
        <p className="share-hint">บนมือถือกดค้างที่รูปเพื่อบันทึกได้เลย</p>
        <div className="share-actions">
          <button className="btn-orange" onClick={shareImage}>แชร์รูป</button>
          <button className="btn-purple" onClick={saveImage}>บันทึกรูป</button>
          <button className="link-again" onClick={shareLink}>คัดลอกลิงก์</button>
        </div>
      </div>
    </div>}
    <Toast msg={toast} />
  </main>;
}
