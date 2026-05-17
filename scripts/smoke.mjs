import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = resolve(root, 'screenshots');
mkdirSync(outDir, { recursive: true });

const url = process.env.SITE_URL ?? 'http://localhost:4321/';

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'wide', width: 1680, height: 1000 },
];

const expectedHeadings = [
  /Venture builder\. Product operator\. Founder\./i,
  /based in London/i,
  /every stage/i,
  /just say hello/i,
];

const expectedAnchors = ['#about', '#career', '#contact'];

function log(msg, tone = 'info') {
  const tag = { info: '·', ok: '✓', warn: '!', err: '✗' }[tone] ?? '·';
  console.log(`  ${tag} ${msg}`);
}

async function run() {
  console.log(`\nSmoke test → ${url}\n`);
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleIssues = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      consoleIssues.push({ type: m.type(), text: m.text() });
    }
  });
  page.on('pageerror', (e) => {
    consoleIssues.push({ type: 'pageerror', text: e.message });
  });

  console.log('Load');
  const resp = await page.goto(url, { waitUntil: 'networkidle' });
  log(`HTTP ${resp?.status() ?? '??'}`, resp?.ok() ? 'ok' : 'err');

  await page.addStyleTag({
    content: 'astro-dev-toolbar, astro-dev-overlay { display: none !important; }',
  });

  const title = await page.title();
  log(`<title> ${title}`, 'info');

  console.log('\nContent checks');
  const bodyText = await page.locator('body').innerText();
  for (const r of expectedHeadings) {
    const hit = r.test(bodyText);
    log(`${r}`, hit ? 'ok' : 'err');
  }

  console.log('\nAnchor scroll checks');
  for (const a of expectedAnchors) {
    const target = a.slice(1);
    const exists = (await page.locator(`#${target}`).count()) > 0;
    log(`section ${a}`, exists ? 'ok' : 'err');
  }

  console.log('\nScreenshots');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(300);
    const path = resolve(outDir, `${vp.name}-${vp.width}x${vp.height}.png`);
    await page.screenshot({ path, fullPage: true });
    log(`${vp.name.padEnd(7)} ${vp.width}×${vp.height}  →  ${path.replace(root + '/', '')}`, 'ok');
  }

  console.log('\nConsole / page errors');
  if (consoleIssues.length === 0) {
    log('clean', 'ok');
  } else {
    for (const i of consoleIssues) log(`${i.type}: ${i.text}`, 'warn');
  }

  await browser.close();

  console.log(`\nScreenshots saved to ${outDir}\n`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
