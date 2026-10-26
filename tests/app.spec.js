const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const URL = pathToFileURL(path.join(__dirname, 'index.html')).href;

async function open(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL);
  return errors;
}

async function walk(page) {
  const total = await page.evaluate(() => state.steps.length);
  for (let i = 1; i < total; i++) await page.locator('#next').click();
  return total;
}

test('app loads and dropdowns are not empty', async ({ page }) => {
  const errors = await open(page);
  await expect(page.locator('#topo option')).toHaveCount(3);
  expect(await page.locator('#dst option').count()).toBeGreaterThan(0);

  for (const key of ['LAN', 'DUAL', 'INTERNET']) {
    await page.locator('#topo').selectOption(key);
    expect(await page.locator('#dst option').count()).toBeGreaterThan(0);
    for (const d of await page.locator('#dst option').evaluateAll(o => o.map(x => x.value))) {
      await page.locator('#dst').selectOption(d);
      await walk(page);
    }
  }

  await page.locator('#model').selectOption('TCPIP');
  await expect(page.locator('#layers .layer')).toHaveCount(4);
  await page.locator('#model').selectOption('OSI');
  await expect(page.locator('#layers .layer')).toHaveCount(7);
  expect(errors).toEqual([]);
});

test('full walk ends at layer 7 of the destination with the message', async ({ page }) => {
  const errors = await open(page);
  await page.locator('#msg').fill('Buenas');
  await walk(page);
  await expect(page.locator('#view')).toContainText('Buenas');
  await expect(page.locator('#expl')).toContainText('OSI 7');
  expect(errors).toEqual([]);
});

test('loss only offers existing segments and triggers retransmission', async ({ page }) => {
  const errors = await open(page);
  await page.locator('#msg').fill('Mensaje largo de prueba');
  await page.locator('#lossSeg').selectOption('2');
  await walk(page);
  expect(await page.evaluate(() => state.steps.some(s => s.k === 'retx'))).toBe(true);
  await page.locator('#msg').fill('Hi');
  await expect(page.locator('#lossSeg option')).toHaveCount(2);
  expect(await page.locator('#lossSeg').inputValue()).toBe('0');
  expect(errors).toEqual([]);
});

test('flood step appears when enabled and all MACs are defined', async ({ page }) => {
  const errors = await open(page);
  await page.locator('#flood').check();
  expect(await page.evaluate(() => state.steps.some(s => s.k === 'flood'))).toBe(true);
  expect(await page.evaluate(() => state.steps.every(s => s.mac.every(Boolean)))).toBe(true);
  expect(errors).toEqual([]);
});
