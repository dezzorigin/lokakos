// Screenshot dokumentasi: adegan tentang + explorer / (desktop + mobile) ke
// docs/screenshots/*.png — dipakai README + video demo.
// Prasyarat: puppeteer-core, Chromium di cache
// (~/.cache/ms-playwright/chromium-1234), forwarder 127.0.0.1:18081 hidup,
// dan server di PORT (default 8331 — `npm run dev` atau `serve out/`).
// JANGAN `npx playwright install chromium` di VM ini (menghapus cache
// browser tooling video-demo).
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'docs', 'screenshots');
const PORT = process.env.PORT || '8331';
const BASE = `http://127.0.0.1:${PORT}`;

const require = createRequire(import.meta.url);
let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch {
  try {
    puppeteer = require('/home/hatch/workspace/absensirapat-audit/diag/node_modules/puppeteer-core');
  } catch {
    console.error('puppeteer-core tidak ditemukan. Pasang dulu: npm i -D puppeteer-core.');
    process.exit(1);
  }
}

mkdirSync(OUT, { recursive: true });

const exe =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  join(process.env.HOME, '.cache/ms-playwright/chromium-1234/chrome-linux/chrome');
const browser = await puppeteer.launch({
  executablePath: exe,
  headless: 'new',
  // --ignore-certificate-errors: KHUSUS sandbox VM ini — egress proxy
  // melakukan TLS interception dengan CA yang tidak dikenal Chromium,
  // sehingga tile.openstreetmap.org gagal validasi sertifikat (padahal
  // curl dengan CA sistem lolos). Di browser pengguna biasa sertifikat
  // OSM valid dan flag ini tidak berpengaruh pada produk.
  args: ['--proxy-server=http://127.0.0.1:18081', '--ignore-certificate-errors', '--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900 },
});

const waitMap = async (page) => {
  await page.waitForSelector('.leaflet-container', { timeout: 30000 });
  await page.waitForSelector('.price-ticket', { timeout: 30000 });
  // Beri tile sempat masuk (boleh gagal — marker + UI tetap teruji).
  await new Promise((r) => setTimeout(r, 4000));
};

const shots = [
  {
    file: '01-landing-desktop.png',
    url: `${BASE}/tentang`,
    viewport: { width: 1440, height: 900 },
    setup: waitMap,
  },
  {
    file: '02-peta-desktop.png',
    url: `${BASE}/`,
    viewport: { width: 1440, height: 900 },
    setup: waitMap,
  },
  {
    file: '03-peta-detail-desktop.png',
    // k132 Kost Nafa 14 — satu-satunya kos berfoto di dataset (PR #2).
    url: `${BASE}/?kos=k132`,
    viewport: { width: 1440, height: 900 },
    setup: async (page) => {
      await waitMap(page);
      await page.waitForSelector('.detail-panel', { timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1500));
    },
  },
  {
    file: '04-landing-mobile.png',
    url: `${BASE}/tentang`,
    viewport: { width: 390, height: 844, isMobile: true },
    setup: waitMap,
  },
  {
    file: '05-peta-mobile.png',
    // k012 CENDANA KOS — harga + nomor kontak (PR #2).
    url: `${BASE}/?kos=k012`,
    viewport: { width: 390, height: 844, isMobile: true },
    setup: async (page) => {
      await waitMap(page);
      await page.waitForSelector('.detail-panel', { timeout: 15000 });
      await new Promise((r) => setTimeout(r, 1500));
    },
  },
];

for (const shot of shots) {
  const page = await browser.newPage();
  await page.setViewport(shot.viewport);
  await page.goto(shot.url, { waitUntil: 'networkidle2', timeout: 60000 });
  await shot.setup(page);
  await page.screenshot({ path: join(OUT, shot.file) });
  console.log(`shot: ${shot.file}`);
  await page.close();
}

await browser.close();
console.log(`selesai: ${shots.length} screenshot di docs/screenshots/`);
