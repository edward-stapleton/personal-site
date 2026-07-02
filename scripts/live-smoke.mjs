import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'screenshots', 'live');
mkdirSync(outDir, { recursive: true });

// Resolve domain straight to GitHub Pages IP — bypasses any local DNS cache
const ip = '185.199.108.153';

const browser = await chromium.launch({
  args: [
    `--host-resolver-rules=MAP edwardstapleton.co.uk ${ip}, MAP www.edwardstapleton.co.uk ${ip}`,
  ],
});

function log(m, t = 'info') {
  console.log(`  ${{ info: '·', ok: '✓', err: '✗', warn: '!' }[t] ?? '·'} ${m}`);
}

const expectedHeadings = [
  /Venture builder\. Product operator\. Founder\./i,
  /based in London/i,
  /every stage/i,
  /just say hello/i,
];
const expectedAnchors = ['#about', '#career', '#contact'];
const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'desktop', width: 1280, height: 900 },
];

async function probeHome() {
  console.log('\nHome — http://edwardstapleton.co.uk/\n');
  const context = await browser.newContext();
  const page = await context.newPage();

  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  const consoleIssues = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning')
      consoleIssues.push({ type: m.type(), text: m.text() });
  });
  page.on('pageerror', (e) => consoleIssues.push({ type: 'pageerror', text: e.message }));

  const resp = await page.goto('http://edwardstapleton.co.uk/', { waitUntil: 'networkidle' });
  log(`HTTP ${resp?.status()} from ${await resp?.headerValue('server')}`, resp?.ok() ? 'ok' : 'err');
  log(`<title> ${await page.title()}`);

  console.log('\n  Content');
  const body = await page.locator('body').innerText();
  for (const r of expectedHeadings) log(`${r}`, r.test(body) ? 'ok' : 'err');

  console.log('\n  Anchors');
  for (const a of expectedAnchors) {
    const exists = (await page.locator(a).count()) > 0;
    log(`section ${a}`, exists ? 'ok' : 'err');
  }

  console.log('\n  Fonts (should be self-hosted; nothing from Google Fonts)');
  const googleFontReqs = requests.filter((u) => /fonts\.(g|googleapis)/.test(u));
  log(
    `${googleFontReqs.length} requests to fonts.google* — ${googleFontReqs.length === 0 ? 'clean' : googleFontReqs.join(', ')}`,
    googleFontReqs.length === 0 ? 'ok' : 'warn',
  );
  const woffReqs = requests.filter((u) => u.endsWith('.woff2'));
  log(`${woffReqs.length} woff2 files loaded from same origin`, woffReqs.length > 0 ? 'ok' : 'warn');

  console.log('\n  Console');
  if (consoleIssues.length === 0) log('clean', 'ok');
  else for (const i of consoleIssues) log(`${i.type}: ${i.text}`, 'warn');

  console.log('\n  Screenshots');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(200);
    const p = resolve(outDir, `home-${vp.name}.png`);
    await page.screenshot({ path: p, fullPage: true });
    log(`${vp.name.padEnd(7)} ${vp.width}×${vp.height}  →  ${p.replace(root + '/', '')}`, 'ok');
  }

  await context.close();
}

async function probe404() {
  console.log('\n404 — http://edwardstapleton.co.uk/no-such-page\n');
  const context = await browser.newContext();
  const page = await context.newPage();
  const resp = await page.goto('http://edwardstapleton.co.uk/no-such-page', { waitUntil: 'networkidle' });
  log(`HTTP ${resp?.status()}`, resp?.status() === 404 ? 'ok' : 'err');
  const body = await page.locator('body').innerText();
  log(`Has "404 —— Not found" eyebrow`, /404\s+——\s+Not found/i.test(body) ? 'ok' : 'err');
  log(`Has italic-serif clause`, /but plenty over there/i.test(body) ? 'ok' : 'err');
  const p = resolve(outDir, '404-desktop.png');
  await page.screenshot({ path: p, fullPage: true });
  log(`screenshot → ${p.replace(root + '/', '')}`, 'ok');
  await context.close();
}

async function probeOg() {
  console.log('\nOG image — http://edwardstapleton.co.uk/og-image.png\n');
  const context = await browser.newContext();
  const page = await context.newPage();
  const resp = await page.goto('http://edwardstapleton.co.uk/og-image.png');
  const ct = await resp?.headerValue('content-type');
  const cl = await resp?.headerValue('content-length');
  log(`HTTP ${resp?.status()}`, resp?.ok() ? 'ok' : 'err');
  log(`Content-Type: ${ct}`, ct?.startsWith('image/png') ? 'ok' : 'warn');
  log(`Size: ${cl} bytes`);
  await context.close();
}

await probeHome();
await probe404();
await probeOg();
await browser.close();

console.log(`\nDone. Screenshots: ${outDir}\n`);
