import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '..', 'screenshots', 'live');
mkdirSync(out, { recursive: true });

// Launch Chromium with a host-resolver override so it goes straight to GitHub's IP
const browser = await chromium.launch({
  args: [
    '--host-resolver-rules=MAP edwardstapleton.co.uk 185.199.108.153, MAP www.edwardstapleton.co.uk 185.199.108.153',
  ],
});

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 900 },
];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  const resp = await page.goto('http://edwardstapleton.co.uk/', { waitUntil: 'networkidle' });
  console.log(`${vp.name}: HTTP ${resp?.status()} from ${resp?.headerValue('server')}`);
  await page.screenshot({ path: resolve(out, `${vp.name}.png`), fullPage: true });
  await page.close();
}

await browser.close();
console.log(`Screenshots saved to ${out}`);
