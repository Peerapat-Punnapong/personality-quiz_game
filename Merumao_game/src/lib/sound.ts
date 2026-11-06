// MERUMAO sound: looping BGM (user's track) + tiny synthesized "cute" SFX (WebAudio, no files).
// Audio only starts after the first user gesture (browser autoplay rules).
// The toggle controls MUSIC only — button/card SFX always stay on (quietly).
import { useSyncExternalStore } from 'react';

export type Sfx = 'pop' | 'back' | 'tick' | 'chime' | 'whoosh' | 'portal' | 'bell' | 'boing' | 'fanfare' | 'sparkle';
const KEY = 'merumao.sound';
let enabled = (() => { try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; } })();
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bgm: HTMLAudioElement | null = null;
let unlocked = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach(f => f());
export const useSoundOn = () => useSyncExternalStore(cb => { subs.add(cb); return () => subs.delete(cb); }, () => enabled);

let BGM_VOL = 0.26;
const LEVELS = { normal: 0.26, quiet: 0.11 };
/** Quieter music while the player is reading / answering (intro, quiz). */
export function setMusicLevel(l: keyof typeof LEVELS) { if (BGM_VOL === LEVELS[l]) return; BGM_VOL = LEVELS[l]; if (enabled && bgm && !bgm.paused) fadeTo(BGM_VOL, 800); }
function ensureBgm() {
  if (bgm) return bgm;
  bgm = new Audio('assets/audio/bgm.mp3'); bgm.loop = true; bgm.preload = 'auto'; bgm.volume = 0;
  return bgm;
}
let fadeT: any;
function fadeTo(target: number, ms = 900) {
  const a = ensureBgm(); clearInterval(fadeT);
  const start = a.volume, t0 = performance.now();
  fadeT = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms); a.volume = Math.max(0, Math.min(1, start + (target - start) * k));
    if (k >= 1) { clearInterval(fadeT); if (target === 0) a.pause(); }
  }, 40);
}
function startBgm() { const a = ensureBgm(); if (!enabled) return; a.play().then(() => fadeTo(BGM_VOL, 1600)).catch(() => { /* blocked until gesture */ }); }
/** Lower the music (e.g. during the cinematic reveal). */
export function duck(on: boolean) { if (!enabled || !bgm || bgm.paused) return; fadeTo(on ? 0.1 : BGM_VOL, 600); }

function audio() {
  if (!ctx) {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext; if (!AC) return null;
    ctx = new AC() as AudioContext; master = ctx.createGain(); master.gain.value = 0.32; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
export function unlock() {
  if (unlocked) return; unlocked = true; audio(); startBgm();
}
export function setSound(on: boolean) {
  enabled = on; try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* ignore */ }
  if (on) { unlocked = true; audio(); startBgm(); } else if (bgm) fadeTo(0, 400);
  emit();
}

// ---------- synth helpers ----------
function tone(freq: number, t: number, dur: number, { type = 'sine' as OscillatorType, vol = .2, to = 0, attack = .005 } = {}) {
  const c = ctx!, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur * .8);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master!); o.start(t); o.stop(t + dur + .02);
}
function noise(t: number, dur: number, { from = 400, to = 2400, vol = .18, q = 1.2 } = {}) {
  const c = ctx!, len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  s.buffer = buf; f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur * .7);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master!); s.start(t); s.stop(t + dur);
}
let lastTick = 0;
const C6 = 1046.5, E6 = 1318.5, G6 = 1568, C7 = 2093, E7 = 2637;

export function play(name: Sfx) {
  if (!unlocked) return; // SFX play even when music is off
  const c = audio(); if (!c) return; const t = c.currentTime + .005;
  switch (name) {
    case 'pop': tone(520, t, .12, { to: 1150, vol: .22 }); tone(1650, t + .03, .08, { type: 'triangle', vol: .06 }); break;
    case 'back': tone(900, t, .12, { to: 420, vol: .18 }); break;
    case 'tick': { const n = performance.now(); if (n - lastTick < 90) return; lastTick = n; tone(1900, t, .05, { to: 2300, vol: .03, type: 'triangle' }); break; }
    case 'boing': tone(300, t, .28, { to: 620, vol: .16 }); tone(620, t + .1, .2, { to: 460, vol: .08 }); break;
    case 'chime': [C6, E6, G6, C7].forEach((f, i) => tone(f, t + i * .06, .42, { type: 'triangle', vol: .09 })); tone(E7, t + .26, .5, { vol: .03 }); break;
    case 'bell': tone(880, t, .7, { vol: .12 }); tone(1320, t, .5, { vol: .06, type: 'triangle' }); tone(1760, t + .02, .35, { vol: .03 }); break;
    case 'whoosh': noise(t, .9, { from: 300, to: 2600, vol: .16 }); break;
    case 'portal': tone(260, t, 1.1, { to: 1250, vol: .1, type: 'sine', attack: .2 }); [C6, G6, C7].forEach((f, i) => tone(f, t + .35 + i * .09, .5, { type: 'triangle', vol: .08 })); noise(t, 1, { from: 800, to: 6000, vol: .06, q: 2 }); break;
    case 'sparkle': [G6, C7, E7].forEach((f, i) => tone(f, t + i * .05, .3, { type: 'triangle', vol: .08 })); break;
    case 'fanfare': [523.3, 659.3, 784, 1046.5, 1318.5, 1568].forEach((f, i) => tone(f, t + i * .09, i === 5 ? 1.2 : .45, { type: i % 2 ? 'triangle' : 'sine', vol: .13 })); noise(t + .4, .8, { from: 4000, to: 10000, vol: .05 }); break;
  }
}

/** Global wiring: first gesture unlocks audio; every <button> gets a cute pop unless it opts out with data-sfx. */
export function installSoundHooks() {
  const first = () => { unlock(); };
  addEventListener('pointerdown', first, { once: true, capture: true }); addEventListener('keydown', first, { once: true, capture: true });
  addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest?.('button, a') as HTMLElement | null; if (!b) return;
    const s = b.dataset.sfx; if (s === 'none') return; play((s as Sfx) || 'pop');
  }, true);
  document.addEventListener('visibilitychange', () => { if (!bgm || !enabled || !unlocked) return; if (document.hidden) bgm.pause(); else bgm.play().catch(() => {}); });
}
