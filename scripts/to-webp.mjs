// Converts transparent PNGs to WebP, scaled down to a maximum width.
// Usage: node scripts/to-webp.mjs <maxWidth> <quality 0-1> <in.png> [...]
// Writes <name>.webp next to each input.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const [maxW, quality, ...files] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
for (const f of files) {
  const data = `data:image/png;base64,${readFileSync(f).toString('base64')}`;
  const out = await page.evaluate(
    async ({ data, maxW, quality }) => {
      const img = new Image();
      img.src = data;
      await img.decode();
      const k = Math.min(1, maxW / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      const x = c.getContext('2d');
      x.imageSmoothingQuality = 'high';
      x.drawImage(img, 0, 0, c.width, c.height);
      return { w: c.width, h: c.height, url: c.toDataURL('image/webp', quality) };
    },
    { data, maxW: Number(maxW), quality: Number(quality) },
  );
  const dest = f.replace(/\.png$/, '.webp');
  const buf = Buffer.from(out.url.split(',')[1], 'base64');
  writeFileSync(dest, buf);
  console.log(`${dest} ${out.w}x${out.h} ${(buf.length / 1024).toFixed(1)}KB (was ${(readFileSync(f).length / 1024).toFixed(0)}KB)`);
}
await browser.close();
