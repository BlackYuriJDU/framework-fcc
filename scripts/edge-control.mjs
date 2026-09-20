import { chromium } from 'playwright';

const [command, ...args] = process.argv.slice(2);

async function start() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: false,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null, // Use window size
  });

  const page = await context.newPage();

  if (command === 'navigate') {
    await page.goto(args[0] || 'https://seudominio.com', { waitUntil: 'networkidle' });
    console.log(`Navegado para: ${page.url()}`);
  } else if (command === 'click') {
    const selector = args[0];
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.click(selector);
    console.log(`Clicou em: ${selector}`);
  } else if (command === 'type') {
    const [selector, ...textParts] = args;
    const text = textParts.join(' ');
    await page.waitForSelector(selector, { timeout: 10000 });
    await page.fill(selector, text);
    console.log(`Preencheu ${selector} com: ${text}`);
  } else if (command === 'screenshot') {
    await page.screenshot({ path: args[0] || '/tmp/edge-screenshot.png', fullPage: true });
    console.log(`Screenshot salvo em: ${args[0] || '/tmp/edge-screenshot.png'}`);
  } else if (command === 'wait') {
    await page.waitForTimeout(parseInt(args[0]) || 2000);
    console.log(`Esperou ${parseInt(args[0]) || 2000}ms`);
  } else if (command === 'evaluate') {
    const result = await page.evaluate((fn) => eval(fn), args.join(' '));
    console.log(`Result:`, result);
  } else {
    // Default: just open page
    await page.goto('https://seudominio.com', { waitUntil: 'networkidle' });
    console.log(`Edge aberto em: ${page.url()}`);
    // Keep alive for 5min
    await page.waitForTimeout(300000);
  }

  if (command !== 'start') {
    await browser.close();
  }
}

start().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
