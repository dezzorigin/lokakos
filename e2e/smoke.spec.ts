import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Play-test end-to-end LokaKos terhadap server lokal (BASE_URL).
// Tile peta boleh lambat/gagal di sandbox — yang diuji adalah DOM aplikasi
// (marker karcis, daftar, filter, drawer, favorit, bagikan), bukan piksel tile.
// Harapan jumlah DIHITUNG dari data/kos.json (dataset jujur PR #2) supaya
// tetap benar sesudah geocode / refresh dataset — bukan angka tulis tangan.

// ---------------------------------------------------------------------------
const DATA = JSON.parse(
  readFileSync(join(__dirname, '..', 'data', 'kos.json'), 'utf-8'),
) as {
  meta: { collected_at: string };
  count: number;
  kos: Array<{
    id: string;
    name: string;
    address: string | null;
    area: string | null;
    facilities: string[] | null;
    gender: 'male' | 'female' | 'mixed' | null;
    phone: string | null;
    photo_url: string | null;
    price_min: number | null;
    price_period: 'monthly' | 'yearly';
    price_note: string | null;
    source: string;
    source_url: string;
    lat: number | null;
    lon: number | null;
  }>;
};
const KOS = DATA.kos;
const TOTAL = KOS.length;
const GEOCODED = KOS.filter((k) => k.lat != null).length;
const matchQuery = (k: (typeof KOS)[number], q: string) =>
  `${k.name} ${k.address ?? ''} ${k.area ?? ''} ${k.price_note ?? ''}`
    .toLowerCase()
    .includes(q.toLowerCase());
const UNDER_700 = KOS.filter(
  (k) => k.price_min != null && k.price_period === 'monthly' && k.price_min < 700_000,
);
const WIFI = KOS.filter((k) => (k.facilities ?? []).includes('WiFi'));
const KOPELMA = KOS.filter((k) => matchQuery(k, 'kopelma'));
const KOPELMA_AREA = KOS.filter((k) => k.area === 'Kopelma Darussalam');
// Satu kos ber-harga + berkoordinat + bertelepon untuk uji drawer penuh.
const FULL = KOS.find(
  (k) => k.price_min != null && k.price_period === 'monthly' && k.lat != null && k.phone,
)!;
const NO_PRICE = KOS.find((k) => k.price_min == null)!;

test.describe('beranda explorer (/)', () => {
  test('daftar lengkap + peta + muat bertahap', async ({ page }) => {
    await page.goto('/');
    // Navbar: logo GitHub kanan menaut ke repo.
    const gh = page.getByRole('link', { name: /GitHub/ }).first();
    await expect(gh).toHaveAttribute('href', 'https://github.com/dezzorigin/lokakos');
    // Peta Leaflet ter-render + marker = kos berkoordinat.
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.locator('.price-ticket')).toHaveCount(GEOCODED);
    // Daftar: 30 kartu dulu (muat bertahap), judul "N dari TOTAL".
    await expect(page.locator('.property-list__title')).toContainText(`${TOTAL} dari ${TOTAL}`);
    await expect(page.locator('.property-card')).toHaveCount(30);
    await expect(page.locator('#load-more-btn')).toBeVisible();
    // Muat lagi -> 60 kartu.
    await page.locator('#load-more-btn').click();
    await expect(page.locator('.property-card')).toHaveCount(60);
    // Label provenance jujur.
    await expect(page.locator('.property-list__sample')).toContainText(
      `diperbarui ${DATA.meta.collected_at}`,
    );
  });

  test('deep-link ?kos= membuka drawer detail dengan sumber', async ({ page }) => {
    await page.goto(`/?kos=${FULL.id}`);
    await expect(page.locator('.detail-panel')).toBeVisible();
    await expect(page.locator('.detail-panel__name')).toContainText(FULL.name);
    await expect(page.locator('.detail-panel__source-link')).toHaveAttribute(
      'href',
      FULL.source_url,
    );
    await expect(page.locator('.detail-panel__source')).toContainText(FULL.source);
    await expect(page.locator('.detail-panel__source')).toContainText(DATA.meta.collected_at);
    // Kos bertelepon: tombol Hubungi tel: + tombol Bagikan.
    await expect(page.locator('#call-property-btn')).toHaveAttribute(
      'href',
      new RegExp(`tel:.*${FULL.phone!.replace(/[^0-9]/g, '').slice(-9)}`),
    );
    await expect(page.locator('#share-property-btn')).toBeVisible();
    await expect(page.locator('#save-property-btn')).toBeVisible();
    // Tutup drawer.
    await page.locator('#close-detail-panel-btn').click();
    await expect(page.locator('.detail-panel')).toHaveCount(0);
  });

  test('kos tanpa harga menampilkan state jujur', async ({ page }) => {
    await page.goto(`/?kos=${NO_PRICE.id}`);
    await expect(page.locator('.detail-panel__name')).toContainText(NO_PRICE.name);
    await expect(page.locator('.detail-panel__price--none')).toContainText(
      'Tidak tercatat di sumber',
    );
  });

  test('filter harga + tipe menyaring daftar dan marker', async ({ page }) => {
    await page.goto('/');
    await page.locator('#filter-price-under_700k').click();
    await expect(page.locator('.property-list__title')).toContainText(
      `${UNDER_700.length} dari ${TOTAL}`,
    );
    await expect(page.locator('.property-card')).toHaveCount(UNDER_700.length);
    // Tambah filter tipe Putri -> irisan harga & tipe.
    await page.locator('#filter-type-female').click();
    const both = UNDER_700.filter((k) => k.gender === 'female');
    await expect(page.locator('.property-card')).toHaveCount(both.length);
    await expect(page.locator('.property-list__title')).toContainText(
      `${both.length} dari ${TOTAL}`,
    );
    // Reset -> kembali 30 kartu pertama dari TOTAL.
    await page.locator('#filter-reset-btn').click();
    await expect(page.locator('.property-card')).toHaveCount(30);
    await expect(page.locator('.property-list__title')).toContainText(`${TOTAL} dari ${TOTAL}`);
  });

  test('filter area + fasilitas menyaring daftar', async ({ page }) => {
    await page.goto('/');
    await page.locator('#filter-area').selectOption('Kopelma Darussalam');
    await expect(page.locator('.property-list__title')).toContainText(
      `${KOPELMA_AREA.length} dari ${TOTAL}`,
    );
    await expect(page.locator('.property-card')).toHaveCount(KOPELMA_AREA.length);
    await page.locator('#filter-reset-btn').click();
    await page.locator('#filter-facility-wifi').click();
    await expect(page.locator('.property-list__title')).toContainText(
      `${WIFI.length} dari ${TOTAL}`,
    );
    // 59 hasil -> halaman pertama 30 kartu.
    await expect(page.locator('.property-card')).toHaveCount(30);
  });

  test('pencarian nama memfilter daftar', async ({ page }) => {
    await page.goto('/');
    await page.locator('#map-search-input').fill('Kopelma');
    await expect(page.locator('.property-list__title')).toContainText(
      `${KOPELMA.length} dari ${TOTAL}`,
    );
    await expect(page.locator('.property-card')).toHaveCount(Math.min(30, KOPELMA.length));
    await page.locator('#map-search-clear-btn').click();
    await expect(page.locator('.property-card')).toHaveCount(30);
  });

  test('klik kartu membuka detail; favorit bertahan setelah reload', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.locator('.property-card').first().click();
    await expect(page.locator('.detail-panel')).toBeVisible();
    // Simpan dari drawer, lalu reload: chip Favoritku hanya menampilkan yang disimpan.
    await page.locator('#save-property-btn').click();
    await expect(page.locator('#save-property-btn')).toContainText('Tersimpan');
    await page.reload();
    await page.locator('#filter-favorites').click();
    await expect(page.locator('.property-card')).toHaveCount(1);
    // Bagikan: clipboard berisi tautan deep-link kos itu (rute baru /?kos=).
    await page.locator('.property-card').first().click();
    await page.locator('#share-property-btn').click();
    await expect(page.locator('.detail-panel__copied')).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toMatch(/\/\?kos=k\d+/);
  });

  test('filter tanpa hasil menampilkan empty state', async ({ page }) => {
    await page.goto('/');
    await page.locator('#map-search-input').fill('nama yang tidak ada');
    await expect(page.locator('.property-list__empty-title')).toBeVisible();
    await expect(page.locator('.property-card')).toHaveCount(0);
  });

  test('mobile 390px: tanpa overflow horizontal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.leaflet-container')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe('rute lama /peta', () => {
  test('/peta redirect ke / dan deep-link ikut terbawa', async ({ page }) => {
    await page.goto('/peta/');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.property-list__title')).toContainText(`${TOTAL} dari ${TOTAL}`);

    await page.goto(`/peta/?kos=${FULL.id}`);
    await expect(page).toHaveURL(new RegExp(`\\/\\?kos=${FULL.id}`));
    await expect(page.locator('.detail-panel__name')).toContainText(FULL.name);
  });
});

test.describe('tentang', () => {
  test('hero + peta live + contoh 6 kos termurah', async ({ page }) => {
    await page.goto('/tentang');
    await expect(
      page.getByRole('heading', { name: 'Cari kos sambil lihat petanya.' }),
    ).toBeVisible();
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.locator('.price-ticket')).toHaveCount(GEOCODED);
    // Statistik dihitung dari dataset.
    await expect(page.locator('.hero__stat-num').nth(0)).toHaveText(String(TOTAL));
    await expect(page.locator('#daftar .property-card')).toHaveCount(6);
    // Klik kartu contoh -> buka kos itu di explorer /.
    await page.locator('#daftar .property-card').first().click();
    await expect(page).toHaveURL(/\/\?kos=k\d+/);
    await expect(page.locator('.detail-panel')).toBeVisible();
  });
});
