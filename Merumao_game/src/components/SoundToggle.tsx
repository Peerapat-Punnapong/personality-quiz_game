import { setSound, useSoundOn } from '../lib/sound';
export function SoundToggle({ floating = false }: { floating?: boolean }) {
  const on = useSoundOn();
  return <button className={'sound-btn ' + (floating ? 'fab ' : '') + (on ? 'on' : 'off')} data-sfx="none" onClick={() => setSound(!on)}
    aria-pressed={on} aria-label={on ? 'ปิดเพลง' : 'เปิดเพลง'} title={on ? 'ปิดเพลง (เสียงปุ่มยังอยู่)' : 'เปิดเพลง'}>
    <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
      <path d="M12 7l14-3v16.5a4 4 0 1 1-2.6-3.7V9.6l-8.8 1.9v11.6a4 4 0 1 1-2.6-3.7z" fill="currentColor" className={on ? 'wave' : ''} />
      {!on && <path d="M4 4l24 24" stroke="#ff8c2e" strokeWidth="3" strokeLinecap="round" />}
    </svg>
    {on && <span className="note" aria-hidden="true">♪</span>}
  </button>;
}
