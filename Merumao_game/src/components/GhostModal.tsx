import { useEffect, useRef } from 'react';
import type { Ghost } from '../data/ghosts';
import { Img, Particles } from './ui';
export function GhostModal({ ghost, onClose }: { ghost: Ghost | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!ghost) return; closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k);
  }, [ghost, onClose]);
  if (!ghost) return null;
  return <div className="modal-back" onClick={onClose}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={ghost.name} onClick={(e: any) => e.stopPropagation()} style={{ '--aura': ghost.aura } as any}>
      <button ref={closeRef} className="modal-x" onClick={onClose} aria-label="ปิด">×</button>
      <div className="modal-art"><div className="aura" /><Particles count={12} /><Img slug={`ghosts/${ghost.id}`} alt={ghost.name} eager className="char idle" /></div>
      <div className="modal-body">
        <h3 className="modal-name">{ghost.name}</h3>
        <p className="mbti-tag">{ghost.mbti} — {ghost.mbtiEn}</p>
        <blockquote className="quote">“{ghost.quote}”</blockquote>
        <p className="modal-traits">{ghost.traits}</p>
        <dl className="modal-grid">
          <div><dt>จุดแข็ง</dt><dd>{ghost.strengths}</dd></div>
          <div><dt>จุดอ่อน</dt><dd>{ghost.weaknesses}</dd></div>
          <div><dt>ความรัก</dt><dd>{ghost.love}</dd></div>
        </dl>
      </div>
    </div>
  </div>;
}
