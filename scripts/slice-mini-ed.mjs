// Slices the Mini-Ed pose sheet (transparent background, five figures in a
// row) into a sprite strip of equal cells, feet on the bottom edge, centred.
// Order: walk-down A, walk-down B, walk-up A, walk-up B, sit.
// The site serves a WebP copy: node scripts/to-webp.mjs 2000 0.92 public/mini-ed.png
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2] ?? 'src/assets/mini-ed/poses.webp';
const out = process.argv[3] ?? 'public/mini-ed.webp';
const CELL_H = 256;

const b64 = readFileSync(src).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
const result = await page.evaluate(
  async ({ b64, CELL_H }) => {
    const img = new Image();
    img.src = `data:image/webp;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    const { data } = x.getImageData(0, 0, c.width, c.height);
    const solid = (px, py) => data[(py * c.width + px) * 4 + 3] > 40;

    // Figures are separated by fully transparent columns.
    const cols = [];
    for (let px = 0; px < c.width; px++) {
      let any = false;
      for (let py = 0; py < c.height && !any; py += 2) any = solid(px, py);
      cols.push(any);
    }
    const runs = [];
    let start = -1;
    cols.forEach((on, px) => {
      if (on && start < 0) start = px;
      if (!on && start >= 0) {
        if (px - start > 40) runs.push([start, px]);
        start = -1;
      }
    });
    const boxes = runs.map(([x0, x1]) => {
      let y0 = c.height, y1 = 0;
      for (let px = x0; px < x1; px++)
        for (let py = 0; py < c.height; py++)
          if (solid(px, py)) { y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
      return { x0, x1, y0, y1: y1 + 1 };
    });

    // One scale for every frame, from the tallest (standing) figure.
    const tallest = Math.max(...boxes.map((b) => b.y1 - b.y0));
    const k = (CELL_H * 0.98) / tallest;
    const cellW = Math.ceil(Math.max(...boxes.map((b) => b.x1 - b.x0)) * k) + 4;
    const o = document.createElement('canvas');
    o.width = cellW * boxes.length;
    o.height = CELL_H;
    const ox = o.getContext('2d');
    ox.imageSmoothingQuality = 'high';
    boxes.forEach((b, i) => {
      const w = (b.x1 - b.x0) * k;
      const h = (b.y1 - b.y0) * k;
      ox.drawImage(img, b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, i * cellW + (cellW - w) / 2, CELL_H - h, w, h);
    });
    return { boxes, cellW, png: o.toDataURL('image/png') };
  },
  { b64, CELL_H },
);
await browser.close();
writeFileSync(out, Buffer.from(result.png.split(',')[1], 'base64'));
console.log(JSON.stringify({ frames: result.boxes.length, cellW: result.cellW, cellH: CELL_H, boxes: result.boxes }));
