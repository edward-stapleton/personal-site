// Renders a world's 03-LAYOUT guide and 04-REFERENCES sheet.
// Usage: node sheets.mjs <world-config.json>
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const cfgPath = resolve(process.argv[2]);
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const out = resolve(dirname(cfgPath), cfg.out);

const mime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
const dataUri = (f) => `data:${mime[f.split('.').pop().toLowerCase()]};base64,${readFileSync(f).toString('base64')}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const plots = cfg.plots
  .map(
    (p) => `<div class="plot" style="left:${p.x}px;top:${p.y}px;background:${p.color}">
      <b>${esc(p.title)}</b>${p.sub ? `<span>${esc(p.sub)}</span>` : ''}</div>`,
  )
  .join('');
const notes = (cfg.notes || [])
  .map((n) => `<div class="note" style="left:${n.x}px;top:${n.y}px">${esc(n.text)}</div>`)
  .join('');

const layout = `<!doctype html><html><head><style>
body{margin:0;width:1672px;height:941px;background:#efe6da;font-family:Helvetica,Arial,sans-serif;position:relative;overflow:hidden}
h1{position:absolute;top:18px;width:100%;text-align:center;margin:0;color:#b3302a;font-size:28px}
svg{position:absolute;inset:0}
.plot{position:absolute;transform:translate(-50%,-50%);border:1.5px solid #555;border-radius:10px;padding:6px 12px;text-align:center;color:#222;white-space:nowrap}
.plot b{display:block;font-size:18px}.plot span{display:block;font-size:14px}
.note{position:absolute;transform:translate(-50%,-50%);font-size:14px;color:#444}
.foot{position:absolute;bottom:18px;width:100%;text-align:center;font-size:14px;color:#444}
</style></head><body>
<h1>LAYOUT GUIDE ONLY: copy the positions, not these colours, boxes or words</h1>
<svg width="1672" height="941">
<polygon points="83,462 83,500 869,884 869,846" fill="#8a6a4b"/>
<polygon points="869,846 869,884 1589,500 1589,462" fill="#6e5238"/>
<polygon points="83,462 836,112 1589,462 869,846" fill="#c9d1b3" stroke="#555" stroke-width="1"/>
<polyline points="40,450 936,678 1630,450" fill="none" stroke="#e8dcc4" stroke-width="30" stroke-linejoin="miter"/>
</svg>
${plots}${notes}
<div class="foot">Path: a wide V entering at the left corner at 50% height, lowest at ~72%, leaving at the right corner at 50%</div>
</body></html>`;

const refs = (cfg.refs || [])
  .map(
    (r) => `<figure><figcaption>${esc(r.letter)}&nbsp; ${esc(r.caption)}</figcaption>
      <img src="${dataUri(resolve(dirname(cfgPath), r.src))}"></figure>`,
  )
  .join('');
const sheet = `<!doctype html><html><head><style>
body{margin:0;width:1920px;height:1200px;background:#fff;font-family:Helvetica,Arial,sans-serif;display:grid;grid-template-columns:repeat(${cfg.refCols || 3},1fr);gap:24px;padding:10px;box-sizing:border-box;align-content:start}
figure{margin:0}figcaption{color:#a8322a;font-weight:bold;font-size:32px;margin-bottom:8px}
img{width:100%;max-height:${cfg.refImgH || 520}px;object-fit:contain;object-position:left top;display:block}
</style></head><body>${refs}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
await page.setContent(layout);
await page.screenshot({ path: resolve(out, '03-LAYOUT-guide-positions-only.png') });
if (cfg.refs?.length) {
  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.setContent(sheet, { waitUntil: 'load' });
  await page.screenshot({ path: resolve(out, cfg.refFile), type: 'jpeg', quality: 88 });
}
await browser.close();
console.log('done', out);
