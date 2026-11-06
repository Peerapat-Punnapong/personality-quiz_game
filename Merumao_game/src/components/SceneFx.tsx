// Living layer for the 10 quiz illustrations: each scene gets its own themed motion
// (lantern flicker, steam, hearts, music notes, blackout, sunrise rays...) on top of a slow camera drift.
import { useMemo } from 'react';
type P = [number, number]; // x%, y%
interface Fx {
  glows?: { at: P; size?: number; color?: string }[];
  emit?: { glyph: string; from: P; spread?: number; count?: number; dir?: 'up' | 'down'; color?: string; size?: number; dur?: number };
  steam?: { from: P; color?: string };
  pulse?: { at: P; color: string; size?: number };
  rays?: P; spots?: boolean; blackout?: boolean; shake?: boolean; ping?: P; wisps?: boolean;
}
const LANTERN = '#ffb347', MAGENTA = '#ff4fd8', VIOLET = '#b07cff';
const FX: Record<number, Fx> = {
  1: { glows: [{ at: [14, 18] }, { at: [50, 8] }, { at: [84, 16] }, { at: [30, 36], size: 14 }, { at: [72, 40], size: 14 }], wisps: true, emit: { glyph: '✦', from: [50, 70], spread: 80, count: 8, color: '#ffd77a', size: 10 } },
  2: { glows: [{ at: [12, 20] }, { at: [88, 22] }, { at: [40, 26], color: '#ffe6a8', size: 22 }, { at: [57, 14], color: '#ffe6a8', size: 22 }, { at: [66, 32], color: '#ffe6a8', size: 22 }], emit: { glyph: '✦', from: [55, 30], spread: 40, count: 7, color: '#fff2c4', size: 9 } },
  3: { steam: { from: [52, 28], color: VIOLET }, glows: [{ at: [78, 44], size: 16 }, { at: [20, 30] }], emit: { glyph: '●', from: [52, 50], spread: 6, count: 6, color: '#e7b6ff', size: 5, dur: 3 } },
  4: { emit: { glyph: '♥', from: [46, 46], spread: 26, count: 8, color: '#ff7ab8', size: 15 }, glows: [{ at: [56, 40], color: '#ff9bd2', size: 30 }, { at: [86, 30] }], wisps: true },
  5: { pulse: { at: [50, 46], color: MAGENTA, size: 60 }, emit: { glyph: '✦', from: [50, 46], spread: 60, count: 10, color: '#ffb8f3', size: 11 }, wisps: true },
  6: { shake: true, ping: [63, 46], glows: [{ at: [62, 48], color: '#c9a2ff', size: 26 }, { at: [12, 18] }], emit: { glyph: '✉', from: [64, 40], spread: 14, count: 4, color: '#e6d4ff', size: 14 } },
  7: { blackout: true, glows: [{ at: [24, 66], size: 20 }, { at: [70, 74], size: 12 }], emit: { glyph: '╱', from: [55, 0], spread: 70, count: 7, dir: 'down', color: '#d9e6ff', size: 12, dur: 2.2 } },
  8: { spots: true, emit: { glyph: '♪', from: [55, 32], spread: 50, count: 10, color: '#ffd1f4', size: 16 }, glows: [{ at: [50, 22], color: MAGENTA, size: 30 }] },
  9: { emit: { glyph: '●', from: [45, 8], spread: 40, count: 9, dir: 'down', color: '#ffcf4d', size: 9, dur: 2.6 }, glows: [{ at: [15, 20] }, { at: [84, 18] }, { at: [62, 82], color: '#ffd86b', size: 18 }] },
  10: { rays: [62, 44], pulse: { at: [46, 82], color: MAGENTA, size: 34 }, emit: { glyph: '❀', from: [50, 20], spread: 90, count: 7, dir: 'down', color: '#ffb3c8', size: 12, dur: 7 } },
};
const rnd = (i: number, k: number) => (Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453) % 1;
const r01 = (i: number, k: number) => Math.abs(rnd(i, k));

export function SceneFx({ n }: { n: number }) {
  const fx = FX[n] || {};
  const parts = useMemo(() => {
    const e = fx.emit; if (!e) return [];
    return Array.from({ length: e.count ?? 8 }, (_, i) => ({
      left: e.from[0] + (r01(i, 1) - .5) * (e.spread ?? 30), top: e.from[1] + (r01(i, 2) - .5) * 10,
      delay: -r01(i, 3) * (e.dur ?? 4.5), dur: (e.dur ?? 4.5) * (0.8 + r01(i, 4) * .5), drift: (r01(i, 5) - .5) * 40, rot: (r01(i, 6) - .5) * 60, s: .7 + r01(i, 7) * .6,
    }));
  }, [n]);
  return <div className={`scene-fx fx-${n} ${fx.shake ? 'shake' : ''}`} aria-hidden="true">
    {fx.rays && <div className="fx-rays" style={{ left: `${fx.rays[0]}%`, top: `${fx.rays[1]}%` }} />}
    {fx.spots && <><div className="fx-spot s1" /><div className="fx-spot s2" /><div className="fx-spot s3" /></>}
    {fx.glows?.map((g, i) => <span key={i} className="fx-glow" style={{ left: `${g.at[0]}%`, top: `${g.at[1]}%`, width: `${g.size ?? 18}%`, '--c': g.color ?? LANTERN, animationDelay: `${-r01(i, 9) * 3}s`, animationDuration: `${1.8 + r01(i, 8) * 2}s` } as any} />)}
    {fx.pulse && <span className="fx-pulse" style={{ left: `${fx.pulse.at[0]}%`, top: `${fx.pulse.at[1]}%`, width: `${fx.pulse.size ?? 40}%`, '--c': fx.pulse.color } as any} />}
    {fx.steam && [0, 1, 2, 3].map(i => <span key={i} className="fx-steam" style={{ left: `${fx.steam!.from[0]}%`, top: `${fx.steam!.from[1]}%`, '--c': fx.steam!.color, animationDelay: `${-i * .9}s` } as any} />)}
    {fx.ping && [0, 1].map(i => <span key={i} className="fx-ping" style={{ left: `${fx.ping![0]}%`, top: `${fx.ping![1]}%`, animationDelay: `${i * .35}s` }} />)}
    {fx.wisps && [0, 1, 2].map(i => <span key={i} className="fx-wisp" style={{ left: `${18 + i * 30}%`, animationDelay: `${-i * 2.3}s`, animationDuration: `${7 + i}s` }} />)}
    {fx.emit && parts.map((p, i) => <span key={i} className={`fx-p ${fx.emit!.dir === 'down' ? 'down' : 'up'}`}
      style={{ left: `${p.left}%`, top: `${p.top}%`, color: fx.emit!.color, fontSize: (fx.emit!.size ?? 12) * p.s * 1.5, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, '--dx': `${p.drift}px`, '--rot': `${p.rot}deg` } as any}>{fx.emit!.glyph}</span>)}
    {fx.blackout && <div className="fx-blackout" />}
    <div className="fx-shine" /><div className="fx-vignette" />
  </div>;
}
