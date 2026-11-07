import { useState } from 'react';
import { GHOSTS, GHOST_ORDER, type Ghost } from '../data/ghosts';
import { navigate } from '../lib/router';
import { resetQuiz } from '../lib/store';
import { Nav } from '../components/Nav';
import { play } from '../lib/sound';
import { GhostModal } from '../components/GhostModal';
import { DonateButton } from '../components/Donate';
import { Arrow, Diamond, Flame, FlameTitle, Img, Particles, Reveal, Smoke, useTilt } from '../components/ui';

const start = () => { resetQuiz(); navigate('/intro/1', 'smoke'); };
const STEPS = [
  { icon: 'icons/step-bowl', n: 1, t: 'เตะขันน้ำมนต์', d: ['วางมือที่ขอบขัน แล้วแตะผิวน้ำ', 'หลับตา... แล้วข้ามภพไปยังโลกแห่งผี'] },
  { icon: 'icons/step-cards', n: 2, t: 'เลือกไพ่ 10 ข้อ', d: ['ผ่านเหตุการณ์ต่างๆ ในร้านเมรุเมา', 'เลือกตามความรู้สึก ไม่ต้องคิดมาก'] },
  { icon: 'icons/step-siamsi', n: 3, t: 'เสี่ยงเซียมซี', d: ['เซียมซีจะทำนายว่าคุณเป็นผีตนใด', 'พร้อมอธิบายแบบจัดเต็ม'] },
];
const BULLETS: [string, string][] = [
  ['icons/bullet-mirror', 'ค้นพบว่าตัวตนเจ้าคล้ายผีไทยตนใดใน 16 คาแรกเตอร์'], ['icons/bullet-cards', 'เลือกไพ่ 10 ใบ ไม่มีคำตอบถูกหรือผิด'],
  ['icons/bullet-scroll', 'รับคำทำนายบุคลิก จุดแข็ง จุดอ่อน และความรัก'], ['icons/bullet-share', 'แชร์ผลลัพธ์ชวนเพื่อนมาค้นหาตัวตนด้วยกัน'],
];

function GhostTile({ g, i, onOpen }: { g: Ghost; i: number; onOpen: (g: Ghost) => void }) {
  const ref = useTilt<HTMLButtonElement>(8);
  return <button ref={ref} className="ghost-tile" data-sfx="boing" onPointerEnter={() => play('tick')} onClick={() => onOpen(g)} style={{ '--aura': g.aura, '--d': `${-i * .7}s`, '--dur': `${4.2 + (i % 3) * .8}s` } as any} aria-label={`ดูรายละเอียด ${g.name}`}>
    <span className="gt-art"><span className="aura" /><Img slug={`ghosts/${g.id}`} alt="" className="char idle" /></span>
    <span className="gt-name">{g.name}</span>
  </button>;
}

export default function Home() {
  const [modal, setModal] = useState<Ghost | null>(null);
  return <div className="home">
    <Nav />
    {/* HERO */}
    <section className="hero" id="top">
      <div className="hero-sky" aria-hidden="true">
        <Img slug="home/shadow-house" className="h-house" eager />
        <Img slug="home/red-moon" className="h-moon" eager />
        <Img slug="home/smoke7" className="h-smoke a" eager /><Img slug="home/smoke6" className="h-smoke b" />
        <Img slug="home/lantern-post" className="h-post" eager />
        <div className="h-post-glow" />
      </div>
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="badge"><span>Halloween Thai</span><i /><span>Personality Quiz</span></p>
          <h1 className="hero-logo"><Img slug="brand/logo-tagline" alt="เมรุเมา คืนนี้คุณเป็นผีอะไร?" eager /></h1>
          <div className="hero-rail" aria-hidden="true"><i /><i /><i /></div>
          <p className="ten-min">10 minutes only</p>
          <p className="hero-sub">แตะขันข้ามภพ เปิดไพ่ตัวตน<br />แล้วให้เซียมซีทำนาย</p>
          <button className="btn-fire" onClick={start}>เริ่มเปิดโลกแห่งผี <Arrow /></button>
        </div>
        <div className="hero-art">
          <Img slug="icons/step-bowl" className="h-bowl" eager alt="" />
          <Img slug="home/hero-duo" className="h-duo" eager alt="ผีกระสือน้อยกับผีตาโขน" />
          <Particles count={22} />
        </div>
      </div>
      <div className="hero-frame" aria-hidden="true"><span className="corner l" /><span className="corner r" /><Diamond /></div>
    </section>

    {/* HOW TO PLAY */}
    <section className="sec how" id="how">
      <Smoke />
      <Reveal><FlameTitle>ข้ามภพไป<wbr /><span className="nowrap">เอาตัวตนที่ซ่อนอยู่</span></FlameTitle></Reveal>
      <Reveal delay={100}><p className="sec-sub">“เลือกไพ่ทั้ง 10 ใบ แล้วให้เซียมซีเผยตัวตนผีในตัวคุณ”</p></Reveal>
      <ol className="steps">
        {STEPS.map((s, i) => <Reveal as="li" key={s.n} delay={150 + i * 140} className="step">
          <div className="step-icon"><Img slug={s.icon} alt="" className="float" style={{ animationDelay: `${-i * 1.3}s` } as any} /><span className="step-n"><Flame size={30} /><b>{s.n}</b></span></div>
          <h3>{s.t}</h3><p>{s.d[0]}<br />{s.d[1]}</p>
        </Reveal>)}
      </ol>
    </section>

    <Diamond className="big" />
    {/* GHOSTS */}
    <section className="sec ghosts" id="ghosts">
      <div className="ghosts-copy">
        <Reveal><h2 className="script-title"><Flame /> คืนนี้...เจ้าเป็นผีอะไร? <Flame flip /></h2></Reveal>
        <Reveal delay={80}><p className="script-p">ณ โรงเตี๊ยมเมรุเมา<br />ที่ซึ่งเหล่าวิญญาณมารวมตัวกัน<br />ความลับในตัวเจ้าอาจถูกเปิดเผยผ่านไพ่<br />ทำนายทั้งสิบใบ</p></Reveal>
        <ul className="bullets">{BULLETS.map(([ic, t], i) => <Reveal as="li" key={ic} delay={120 + i * 80}><Img slug={ic} alt="" /><span>{t}</span></Reveal>)}</ul>
        <button className="btn-ghost" onClick={start}>เริ่มเปิดไพ่ทำนาย <Arrow /></button>
      </div>
      <div className="ghost-grid">
        {GHOST_ORDER.map((id, i) => <Reveal key={id} delay={i * 70}><GhostTile g={GHOSTS[id]} i={i} onOpen={setModal} /></Reveal>)}
      </div>
    </section>
    <Diamond className="big" />

    {/* LORE TEASER */}
    <section className="sec lore-teaser">
      <Img slug="bg/intro4-blur" className="lt-bg" alt="" />
      <Reveal className="lt-art"><Img slug="home/group" alt="เหล่าวิญญาณร่วมวงที่โรงเตี๊ยมเมรุเมา" className="tilt-card" /></Reveal>
      <Reveal delay={120} className="lt-copy">
        <h2 className="script-title"><Flame /> เมรุเมา โลกแห่งผี <Flame flip /></h2>
        <p className="script-p">เมื่อโลกของคนเป็นเงียบสงัด<br />โลกของเหล่าผีกลับเพิ่งเริ่มคึกคัก...<br />ณ โรงเตี๊ยมลึกลับที่ซ่อนอยู่ระหว่างสองภพ<br />วิญญาณทั้ง 16 ตนต่างมีเรื่องราว<br />ความปรารถนา และตัวตนที่แตกต่างกัน<br />แต่ใครจะรู้ว่า... หนึ่งในวิญญาณเหล่านั้น<br />อาจมีนิสัยเหมือนเจ้ามากกว่าที่คิด</p>
        <button className="btn-ghost" onClick={() => navigate('/lore', 'fade')}>เปิดตำนานเมรุเมา <Arrow /></button>
      </Reveal>
    </section>

    {/* FINAL CTA + FOOTER */}
    <section className="sec final">
      <Img slug="bg/ready-blur" className="final-bg" alt="" />
      <Smoke variant="b" />
      <Reveal><FlameTitle>ข้ามภพไป<wbr /><span className="nowrap">เอาตัวตนที่ซ่อนอยู่</span></FlameTitle></Reveal>
      <Reveal delay={80}><p className="final-p">เมื่อโลกคนเป็นหลับใหล โรงเตี๊ยมเมรุเมากลับคึกคัก!</p></Reveal>
      <Reveal delay={140}><p className="final-p">ไพ่ทำนายทั้ง 10 ใบกำลังรอเจ้าอยู่ มาค้นหาว่าตัวตนที่ซ่อนอยู่ของเจ้าจะเหมือนวิญญาณตนใดใน 16 คาแรกเตอร์สุดป่วน</p></Reveal>
      <button className="btn-ghost center" onClick={start}>เริ่มเปิดไพ่ทำนาย <Arrow /></button>
      <Reveal className="donate-band">
        <Img slug="icons/step-bowl" alt="" className="db-bowl" />
        <div className="db-copy"><h3 className="script-title"><Flame /> ทำบุญให้ผีน้อย <Flame flip /></h3><p>ถ้าสนุกกับเมรุเมา ร่วมเลี้ยงข้าวผีน้อยสักจาน ให้โรงเตี๊ยมเปิดต่ออีกหลายคืน</p></div>
        <DonateButton />
      </Reveal>
      <footer className="footer">
        <div className="f-links">
          <a href="https://www.instagram.com/gyoza_pt/" target="_blank" rel="noreferrer"><Img slug="icons/email" alt="" /> IG : Gyoza_pt</a>
          <a href="https://personality-quizgame.vercel.app/" target="_blank" rel="noreferrer"><Img slug="icons/website" alt="" /> https://Merumao.app</a>
        </div>
        <hr />
        <p className="f-stats"><span>◆ 16 วิญญาณ</span><span>◆ 10 ไพ่ทำนาย</span><span>◆ 1 ตัวตนของเจ้า</span></p>
        <p className="f-copy">© 2026 MERUMAO · โรงเตี๊ยมสำหรับคนที่ยังไม่อยากกลับ</p>
      </footer>
    </section>
    <GhostModal ghost={modal} onClose={() => setModal(null)} />
  </div>;
}
