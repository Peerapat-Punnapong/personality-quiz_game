// Draws a 1080×1920 "story" card of the player's ghost on a <canvas> → PNG Blob.
import type { Ghost } from '../data/ghosts';

const W = 1080, H = 1920;
const load = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src;
});

// Thai has no spaces between words → split with Intl.Segmenter, fall back to characters.
function words(text: string): string[] {
  const Seg = (Intl as any).Segmenter;
  if (Seg) return [...new Seg('th', { granularity: 'word' }).segment(text)].map((s: any) => s.segment);
  return [...text];
}
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const lines: string[] = []; let line = '';
  for (const w of words(text)) {
    if (ctx.measureText(line + w).width > maxW && line) { lines.push(line.trim()); line = w; } else line += w;
  }
  if (line.trim()) lines.push(line.trim());
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/.{2}$/, '') + '…'; }
  return lines;
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
/** Centre text by measuring it ourselves. iOS Safari ignores textAlign='center' for Thai text on canvas,
 *  so we always draw left-aligned from (cx - width/2). Shrinks the font to fit maxW if needed. */
function centerText(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, maxW = W - 200) {
  ctx.textAlign = 'left'; ctx.direction = 'ltr';
  let w = ctx.measureText(text).width;
  if (w > maxW) { const m = ctx.font.match(/(\d+(?:\.\d+)?)px/); if (m) { const px = parseFloat(m[1]) * maxW / w; ctx.font = ctx.font.replace(m[0], `${px.toFixed(1)}px`); w = ctx.measureText(text).width; } }
  ctx.fillText(text, cx - w / 2, y);
  return w;
}
/** draw an image with object-fit: cover (never stretched) */
function cover(ctx: CanvasRenderingContext2D, im: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / im.width, h / im.height), sw = w / s, sh = h / s;
  ctx.drawImage(im, (im.width - sw) / 2, (im.height - sh) / 2, sw, sh, x, y, w, h);
}

export async function makeResultImage(g: Ghost, siteUrl: string): Promise<Blob> {
  await Promise.all(['600 48px Mali', 'italic 500 34px Mali', '500 52px Kanit', '400 26px Kanit', '600 28px Mali'].map(f => document.fonts?.load(f).catch(() => {})));
  const [bg, logo, char] = await Promise.all([load('assets/bg/result-blur.webp'), load('assets/brand/logo.webp'), load(`assets/ghosts/${g.id}.webp`)]);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;

  // background + dark gradient
  cover(ctx, bg, 0, 0, W, H);
  const gr = ctx.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, 'rgba(20,8,34,.55)'); gr.addColorStop(.5, 'rgba(20,8,34,.25)'); gr.addColorStop(1, 'rgba(20,8,34,.85)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);

  // orange frame
  ctx.strokeStyle = '#ff6a1f'; ctx.lineWidth = 8; roundRect(ctx, 40, 40, W - 80, H - 80, 36); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,197,77,.5)'; ctx.lineWidth = 2; roundRect(ctx, 56, 56, W - 112, H - 112, 28); ctx.stroke();

  // logo + title
  const lw = 380, lh = lw * logo.height / logo.width; ctx.drawImage(logo, (W - lw) / 2, 100, lw, lh);
  ctx.fillStyle = '#fff'; ctx.font = '600 48px Mali, Kanit, sans-serif';
  ctx.shadowColor = 'rgba(176,124,255,.8)'; ctx.shadowBlur = 20;
  centerText(ctx, 'คืนนี้ฉันเป็นผี.....', W / 2, 140 + lh + 36);
  ctx.shadowBlur = 0;

  // aura + character
  const cy = 860, size = 700;
  const aura = ctx.createRadialGradient(W / 2, cy, 40, W / 2, cy, 420);
  aura.addColorStop(0, g.aura + 'cc'); aura.addColorStop(1, g.aura + '00');
  ctx.fillStyle = aura; ctx.fillRect(0, cy - 450, W, 900);
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 16;
  ctx.drawImage(char, (W - size) / 2, cy - size / 2, size, size);
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // name plate
  ctx.font = '500 52px Kanit, sans-serif';
  const nw = Math.min(W - 200, ctx.measureText(g.name).width + 100);
  ctx.fillStyle = 'rgba(40,22,54,.88)'; roundRect(ctx, (W - nw) / 2, 1256, nw, 100, 28); ctx.fill();
  ctx.strokeStyle = '#ff8c2e'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#fff'; centerText(ctx, g.name, W / 2, 1324, nw - 60);

  // MBTI
  ctx.font = '500 32px Kanit, sans-serif'; ctx.fillStyle = '#ffc54d';
  centerText(ctx, `${g.mbti} — ${g.mbtiEn}`, W / 2, 1414);

  // quote
  ctx.font = 'italic 500 34px Mali, Kanit, sans-serif'; ctx.fillStyle = '#f4ecff';
  wrap(ctx, `“${g.quote}”`, W - 240, 3).forEach((l, i) => centerText(ctx, l, W / 2, 1490 + i * 52));

  // chips
  ctx.font = '600 28px Mali, Kanit, sans-serif';
  const pads = g.chips.map(t => ctx.measureText(t).width + 56), total = pads.reduce((a, b) => a + b, 0) + 20 * 2;
  let x = (W - total) / 2;
  g.chips.forEach((t, i) => {
    ctx.fillStyle = 'rgba(70,24,66,.85)'; roundRect(ctx, x, 1680, pads[i], 62, 31); ctx.fill();
    ctx.strokeStyle = '#e04f9e'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#fff'; centerText(ctx, t, x + pads[i] / 2, 1721); x += pads[i] + 20;
  });

  // footer
  ctx.font = '400 26px Kanit, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.8)';
  centerText(ctx, `มาเปิดไพ่ดูว่าคุณเป็นผีอะไร · ${siteUrl}`, W / 2, 1830, W - 220);

  return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('toBlob failed')), 'image/png'));
}
