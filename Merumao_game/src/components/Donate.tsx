import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Flame, Img, Particles } from './ui';
import { play } from '../lib/sound';

const Coin = () => <svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true"><circle cx="16" cy="16" r="13" fill="#ffc54d" stroke="#b5650d" strokeWidth="2.5" /><circle cx="16" cy="16" r="8.5" fill="none" stroke="#e08a1e" strokeWidth="1.6" /><path d="M16 10.5c-2 2.6-4 3.8-4 6a4 4 0 0 0 8 0c0-2.2-2-3.4-4-6z" fill="#e0451c" /></svg>;

/** Themed "ทำบุญให้ผีน้อย" button that opens the donation QR. */
export function DonateButton({ variant = 'big' }: { variant?: 'big' | 'nav' }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className={variant === 'nav' ? 'btn-donate nav' : 'btn-fire btn-donate'} data-sfx="sparkle" onClick={() => setOpen(true)}>
      <span className="coin"><Coin /></span>ทำบุญให้ผีน้อย
    </button>
    {open && createPortal(<DonateModal onClose={() => setOpen(false)} />, document.body)}
  </>;
}

function DonateModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { ref.current?.focus(); const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  return <div className="modal-back" onClick={onClose}>
    <div className="donate-modal" role="dialog" aria-modal="true" aria-label="ทำบุญให้ผีน้อย" onClick={(e: any) => e.stopPropagation()}>
      <button ref={ref} className="modal-x" onClick={onClose} data-sfx="back" aria-label="ปิด">×</button>
      <Particles count={14} color="var(--gold)" />
      <h2 className="flame-title donate-title"><Flame /><span className="ft-text">ทำบุญให้ผีน้อย</span><Flame flip /></h2>
      <p className="donate-p">ชอบเมรุเมาไหม? ร่วมทำบุญเลี้ยงข้าวผีน้อยได้ที่ QR นี้<br />ทุกบาทช่วยให้โรงเตี๊ยมเปิดต่อได้อีกหลายคืน</p>
      <div className="qr-frame"><span className="qr-corner a" /><span className="qr-corner b" /><span className="qr-corner c" /><span className="qr-corner d" />
        <Img slug="donate/qr" alt="Thai QR PromptPay สำหรับทำบุญให้เมรุเมา" eager />
      </div>
      <p className="donate-hint">อยู่บนมือถือ? แคปหน้าจอ แล้วเปิดสแกนจากรูปในแอปธนาคารได้เลย</p>
      <button className="btn-ghost center" onClick={() => { play('back'); onClose(); }} data-sfx="none">ขอบคุณจากใจผีน้อย ♡</button>
    </div>
  </div>;
}
