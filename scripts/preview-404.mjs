import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '..', 'screenshots');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Astro dev server serves 404 at /404 in dev mode
const resp = await page.goto('http://localhost:4321/this-does-not-exist', { waitUntil: 'networkidle' });
console.log(`Status: ${resp?.status()}`);
await page.addStyleTag({ content: 'astro-dev-toolbar { display: none !important; }' });
await page.screenshot({ path: resolve(out, '404-desktop.png'), fullPage: true });

await page.setViewportSize({ width: 375, height: 812 });
await page.waitForTimeout(200);
await page.screenshot({ path: resolve(out, '404-mobile.png'), fullPage: true });

await browser.close();
console.log('done');
