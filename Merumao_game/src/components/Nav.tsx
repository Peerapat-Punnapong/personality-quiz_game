import { useEffect, useState } from 'react';
import { navigate } from '../lib/router';
import { Img } from './ui';
import { SoundToggle } from './SoundToggle';
import { DonateButton } from './Donate';
const LINKS: [string, string][] = [['หน้าแรก', 'top'], ['วิธีเล่น', 'how'], ['ผีน้อย', 'ghosts'], ['ตำนาน', 'lore']];
export function Nav({ active = 'top' }: { active?: string }) {
  const [open, setOpen] = useState(false); const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const f = () => setScrolled(scrollY > 20); f(); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  const go = (id: string) => {
    setOpen(false);
    if (id === 'lore') return navigate('/lore', 'fade');
    if (!['', '#', '#home', '#/'].includes(location.hash)) { navigate('/', 'fade'); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 700); return; }
    if (id === 'top') return scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return <header className={'nav ' + (scrolled ? 'scrolled' : '')}>
    <button className="nav-logo" onClick={() => go('top')} aria-label="เมรุเมา หน้าแรก"><Img slug="brand/logo" eager alt="เมรุเมา" /></button>
    <div className="nav-right"><DonateButton variant="nav" /><SoundToggle /><button className="nav-burger" aria-label="เมนู" aria-expanded={open} onClick={() => setOpen(o => !o)}><span /><span /><span /></button></div>
    <nav className={'nav-links ' + (open ? 'open' : '')} aria-label="หลัก">
      {LINKS.map(([t, id], i) => <span key={id} className="nl-wrap">{i > 0 && <i className="nl-sep" aria-hidden="true" />}
        <button className={'nl ' + (active === id ? 'active' : '')} onClick={() => go(id)}>{t}</button></span>)}
      <span className="nav-ghost" aria-hidden="true"><svg viewBox="0 0 40 44" width="34" height="38"><defs><radialGradient id="ng" cx=".4" cy=".35"><stop offset="0" stopColor="#c9a6ff" /><stop offset="1" stopColor="#6b35c9" /></radialGradient></defs><path d="M20 2C10 2 4 10 4 20v20l5-4 5 4 6-4 6 4 5-4 5 4V20C36 10 30 2 20 2z" fill="url(#ng)" /><circle cx="14" cy="19" r="3" fill="#24113f" /><circle cx="26" cy="19" r="3" fill="#24113f" /><ellipse cx="20" cy="27" rx="2.4" ry="3" fill="#24113f" /></svg></span>
    </nav>
  </header>;
}
