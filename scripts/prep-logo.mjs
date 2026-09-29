// Prepares a raster logo for the sign panels: optional crop, white background
// knocked out to transparency (for JPGs), transparent margins trimmed.
// --knockout: dark ink on white (every pixel's coverage comes from its darkness).
// --flood: full-colour badge on white (only the white joined to the edges goes).
// Usage: node scripts/prep-logo.mjs <in> <out.png> [--knockout|--flood] [--crop=x,y,w,h]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const [src, out, ...flags] = process.argv.slice(2);
const knockout = flags.includes('--knockout');
const flood = flags.includes('--flood');
const crop = flags.find((f) => f.startsWith('--crop='))?.slice(7).split(',').map(Number);
const ext = src.split('.').pop().toLowerCase();
const mime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext];
const data = `data:${mime};base64,${readFileSync(src).toString('base64')}`;

const browser = await chromium.launch();
const page = await browser.newPage();
const result = await page.evaluate(
  async ({ data, knockout, flood, crop }) => {
    const img = new Image();
    img.src = data;
    await img.decode();
    const [cx, cy, cw, ch] = crop ?? [0, 0, img.width, img.height];
    const c = document.createElement('canvas');
    c.width = cw;
    c.height = ch;
    const x = c.getContext('2d');
    x.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);
    const id = x.getImageData(0, 0, cw, ch);
    const d = id.data;
    if (knockout) {
      // Dark ink on white: coverage comes from how far each pixel is from white.
      for (let i = 0; i < d.length; i += 4) {
        const a = 255 - Math.min(d[i], d[i + 1], d[i + 2]);
        const k = a ? 255 / a : 0;
        d[i] = Math.max(0, 255 - (255 - d[i]) * k);
        d[i + 1] = Math.max(0, 255 - (255 - d[i + 1]) * k);
        d[i + 2] = Math.max(0, 255 - (255 - d[i + 2]) * k);
        d[i + 3] = a < 12 ? 0 : a;
      }
      x.putImageData(id, 0, 0);
    }
    if (flood) {
      const white = (p) => d[p * 4] > 232 && d[p * 4 + 1] > 232 && d[p * 4 + 2] > 232;
      const seen = new Uint8Array(cw * ch);
      const stack = [];
      for (let X = 0; X < cw; X++) stack.push(X, (ch - 1) * cw + X);
      for (let y = 0; y < ch; y++) stack.push(y * cw, y * cw + cw - 1);
      while (stack.length) {
        const p = stack.pop();
        if (seen[p] || !white(p)) continue;
        seen[p] = 1;
        d[p * 4 + 3] = 0;
        const X = p % cw, y = (p - X) / cw;
        if (X > 0) stack.push(p - 1);
        if (X < cw - 1) stack.push(p + 1);
        if (y > 0) stack.push(p - cw);
        if (y < ch - 1) stack.push(p + cw);
      }
      x.putImageData(id, 0, 0);
    }
    let x0 = cw, y0 = ch, x1 = -1, y1 = -1;
    for (let y = 0; y < ch; y++)
      for (let X = 0; X < cw; X++)
        if (d[(y * cw + X) * 4 + 3] > 16) {
          if (X < x0) x0 = X; if (X > x1) x1 = X; if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
    const pad = 2;
    x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
    x1 = Math.min(cw - 1, x1 + pad); y1 = Math.min(ch - 1, y1 + pad);
    const o = document.createElement('canvas');
    o.width = x1 - x0 + 1;
    o.height = y1 - y0 + 1;
    o.getContext('2d').drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    return { w: o.width, h: o.height, png: o.toDataURL('image/png') };
  },
  { data, knockout, flood, crop },
);
await browser.close();
writeFileSync(out, Buffer.from(result.png.split(',')[1], 'base64'));
console.log(`${out} ${result.w}x${result.h} ratio ${(result.w / result.h).toFixed(2)}`);
