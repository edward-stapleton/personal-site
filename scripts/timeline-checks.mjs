// Shared checks for the paged isometric timeline, used by smoke.mjs (local)
// and live-smoke.mjs (production).

export const expectedHeadings = [
  /Ed Stapleton/,
  /Zeti/,
  /Shandy Shack/,
  /Accenture/,
  /The Hut Group/,
  /LoungeUp & Divino Villas/,
  /Durham University/,
  /Where next\?/,
];

export const expectedAnchors = [
  '#today',
  '#zeti',
  '#shandy-shack',
  '#accenture',
  '#the-hut-group',
  '#year-abroad',
  '#durham',
  '#where-next',
];

const trackX = (page) =>
  page.$eval('.tl__track', (el) => new DOMMatrix(getComputedStyle(el).transform).m41);

/** Paging behaviour: one step = one page, camera moves, deep links, hotspots. */
export async function checkTimeline(page, log) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(1600);
  const x0 = await trackX(page);

  await page.evaluate(() => {
    const stop = document.querySelector('.tl__stop');
    window.scrollTo({ top: stop.offsetHeight, behavior: 'instant' });
  });
  await page.waitForTimeout(3000);
  const x1 = await trackX(page);
  log(`camera pans after one page (${Math.round(x0)} → ${Math.round(x1)}px)`, x1 < x0 ? 'ok' : 'err');

  const walker = await page.$eval('.walker', (el) => el.dataset.state);
  log(`walker is seated at rest (${walker})`, walker === 'sit' ? 'ok' : 'err');

  // One stop per world at every size, so a single step lands on the next world.
  const hash = await page.evaluate(() => location.hash);
  log(`one step lands on the next world (${hash})`, hash === '#zeti' ? 'ok' : 'err');

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(3000);
  const x2 = await trackX(page);
  log(`ArrowRight steps forward (${Math.round(x1)} → ${Math.round(x2)}px)`, x2 < x1 ? 'ok' : 'err');

  await page.click('.rail__item[data-go="durham"]');
  await page.waitForTimeout(3000);
  const railHash = await page.evaluate(() => location.hash);
  log(`rail jump to Durham (${railHash})`, railHash === '#durham' ? 'ok' : 'err');

  const hotspot = page.locator('#durham .hotspot').first();
  await hotspot.click();
  const open = await page.$eval('dialog.panel', (d) => d.open);
  log('hotspot opens the panel', open ? 'ok' : 'err');
  await page.keyboard.press('Escape');
}
