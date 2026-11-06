import { navigate } from '../lib/router';
import { firstUnanswered } from '../lib/store';
import { Arrow, FlameTitle, Img, Particles, SceneBg, Smoke } from '../components/ui';
import { Runes } from '../components/Veil';
// NOTE: no mockup supplied for this screen — copy reuses existing site text (placeholder for approval).
export default function Ready() {
  return <main className="stage ready">
    <SceneBg bg="ready" focal="70% 40%" blur={false} dim={0.35} />
    <Smoke />
    <div className="stage-inner center">
      <FlameTitle as="h1" className="stage-title">ข้ามภพไปเอาตัวตนที่ซ่อนอยู่</FlameTitle>
      <div className="ready-cards"><Runes className="spin" /><Img slug="icons/step-cards" alt="ไพ่ทำนาย" eager className="fan" /><Particles count={20} /></div>
      <p className="narration static">“เลือกไพ่ทั้ง 10 ใบ แล้วให้เซียมซีเผยตัวตนผีในตัวคุณ”</p>
      <button className="btn-fire" onClick={() => navigate(`/quiz/${Math.min(firstUnanswered(), 10)}`, 'portal')}>เริ่มเปิดไพ่ทำนาย <Arrow /></button>
    </div>
  </main>;
}
