/* Reproduce the actual local lab and save screenshots plus a silent reference video. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const base = new URL(process.env.SQLI_LAB_URL || 'http://127.0.0.1:5000');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) {
  throw new Error('Evidence capture must target your local lab.');
}
const directory = path.resolve(__dirname, '..', 'evidence');
const payload = "admin' -- ";
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  await fs.mkdir(path.join(directory, 'raw'), { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.SQLI_BROWSER_CHANNEL || undefined,
  });
  const context = await browser.newContext({
    viewport: { width: 1365, height: 1000 },
    recordVideo: { dir: path.join(directory, 'raw'), size: { width: 1365, height: 1000 } },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const video = page.video();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  async function go(route) {
    const response = await page.goto(new URL(route, base).href);
    assert(response && response.ok(), `Could not open ${route}`);
  }
  async function login(username, password) {
    await page.getByLabel('Username', { exact: true }).fill(username);
    await page.locator('#password').fill(password);
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole('button', { name: 'Test login' }).click(),
    ]);
  }
  async function capture(name) {
    await page.screenshot({ path: path.join(directory, name), fullPage: true });
    console.log(`Captured ${name}`);
  }
  async function expectResult(text) {
    assert((await page.getByTestId('result').innerText()).includes(text), text);
  }

  try {
    await go('/');
    await pause(2200);
    await page.getByRole('link', { name: /Vulnerable login/ }).click();
    await pause(1500);
    await login('admin', 'wrong-password');
    await expectResult('Login rejected');
    await capture('01-normal-rejected.png');
    await pause(3500);
    await login(payload, 'wrong-password');
    await expectResult('Authenticated as admin');
    assert.equal(await page.locator('#username').inputValue(), payload);
    assert((await page.getByTestId('query').innerText()).includes("username = 'admin' -- "));
    await capture('02-bypass-success.png');
    await pause(6000);
    await page.getByRole('link', { name: 'Open account dashboard' }).click();
    assert.equal(await page.getByRole('heading', { name: 'Welcome, admin.' }).count(), 1);
    await capture('03-protected-dashboard.png');
    await pause(3500);
    await go('/login/parameterized');
    await login(payload, 'wrong-password');
    await expectResult('Login rejected');
    assert.equal(await page.locator('#username').inputValue(), payload);
    assert((await page.getByTestId('query').innerText()).includes('username = ? AND password = ?'));
    await capture('04-same-payload-blocked.png');
    await pause(6500);
    await go('/dashboard/parameterized');
    assert(new URL(page.url()).pathname === '/login/parameterized', 'Blocked attempt must not authenticate');
    await login('admin', 'AdminDemo42!');
    await expectResult('Login successful');
    await capture('05-valid-login-after-fix.png');
    await pause(3500);
    await page.getByRole('link', { name: 'Open account dashboard' }).click();
    assert.equal(await page.getByRole('heading', { name: 'Welcome, admin.' }).count(), 1);
    await page.getByRole('button', { name: /Log out/ }).click();
    await go('/dashboard/parameterized');
    assert(new URL(page.url()).pathname === '/login/parameterized', 'Logout must clear authentication');

    // Capture the final blocked state on a phone-sized viewport.
    await page.setViewportSize({ width: 390, height: 844 });
    await login(payload, 'wrong-password');
    await expectResult('Login rejected');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Horizontal overflow');
    await capture('06-mobile.png');
    assert.deepEqual(errors, [], 'Browser errors');
    console.log('Browser checks passed: exploit, fix, normal login, protected dashboard, logout, mobile layout.');
  } finally {
    await context.close();
    await video.saveAs(path.join(directory, 'walkthrough.webm'));
    await video.delete();
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });

