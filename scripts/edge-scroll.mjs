import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: '/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: false,
  args: ['--start-maximized'],
});

const page = await browser.newPage();
await page.goto('https://zapmenu.org', { waitUntil: 'networkidle' });
console.log(`URL: ${page.url()}`);

// Rola a página lentamente para dar visibilidade
await page.evaluate(() => {
  window.scrollTo({ top: 600, behavior: 'smooth' });
});
await new Promise(r => setTimeout(r, 1500));

await page.evaluate(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

console.log('Rolagem feita. Edge controlado pelo Playwright.');
// Mantém aberto
await new Promise(() => {});
