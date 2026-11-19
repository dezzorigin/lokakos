import { expect, test } from '@playwright/test';

// Play-test end-to-end LokaKos terhadap server lokal (BASE_URL).
// Tile peta boleh lambat/gagal di sandbox — yang diuji adalah DOM aplikasi
// (marker karcis, daftar, filter, drawer, favorit, bagikan), bukan piksel tile.

test.describe('landing', () => {
  test('hero + peta live + daftar 8 kos', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Cari kos sambil lihat petanya.' })).toBeVisible();
    // Navbar: logo GitHub kanan menaut ke repo.
    const gh = page.getByRole('link', { name: /GitHub/ }).first();
    await expect(gh).toHaveAttribute('href', 'https://github.com/dezzorigin/lokakos');
    // Peta Leaflet ter-render + 8 marker karcis harga.
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.locator('.price-ticket')).toHaveCount(8);
    // Daftar kos: 8 kartu, angka hero dari data asli.
    await expect(page.locator('#daftar .property-card')).toHaveCount(8);
    await expect(page.getByText('8', { exact: true }).first()).toBeVisible();
    // Klik kartu -> pindah ke /peta?kos=...
    await page.locator('#daftar .property-card').first().click();
    await expect(page).toHaveURL(/\/peta\/?\?kos=prop-/);
  });

  test('mobile 390px: tanpa overflow horizontal', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.leaflet-container')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

test.describe('peta', () => {
  test('deep-link ?kos= membuka drawer detail', async ({ page }) => {
    await page.goto('/peta/?kos=prop-003');
    await expect(page.locator('.detail-panel')).toBeVisible();
    await expect(page.locator('.detail-panel__name')).toContainText('Kos Campur Nusa Indah');
    await expect(page.locator('#share-property-btn')).toBeVisible();
    await expect(page.locator('#save-property-btn')).toBeVisible();
    // Tutup drawer.
    await page.locator('#close-detail-panel-btn').click();
    await expect(page.locator('.detail-panel')).toHaveCount(0);
  });

  test('filter harga + tipe menyaring daftar dan marker', async ({ page }) => {
    await page.goto('/peta');
    await expect(page.locator('.property-card')).toHaveCount(8);
    await page.locator('#filter-price-under_700k').click();
    // priceMin < 700rb: prop-002 (600rb), prop-004 (650rb), prop-007 (550rb).
    await expect(page.locator('.property-card')).toHaveCount(3);
    await expect(page.locator('.price-ticket')).toHaveCount(3);
    await expect(page.locator('.property-list__title')).toContainText('3 dari 8');
    // Tambah filter tipe Putri -> tinggal prop-004.
    await page.locator('#filter-type-female').click();
    await expect(page.locator('.property-card')).toHaveCount(1);
    await expect(page.locator('.property-card__name').first()).toContainText('Al-Ikhlas');
    // Reset -> kembali 8.
    await page.locator('#filter-reset-btn').click();
    await expect(page.locator('.property-card')).toHaveCount(8);
  });

  test('pencarian nama memfilter daftar', async ({ page }) => {
    await page.goto('/peta');
    await page.locator('#map-search-input').fill('Kopelma');
    await expect(page.locator('.property-card')).toHaveCount(1);
    await expect(page.locator('.property-card__name').first()).toContainText('Grand Kopelma');
    await page.locator('#map-search-clear-btn').click();
    await expect(page.locator('.property-card')).toHaveCount(8);
  });

  test('klik marker membuka detail; favorit bertahan setelah reload', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/peta');
    await page.locator('.price-ticket').first().click();
    await expect(page.locator('.detail-panel')).toBeVisible();
    // Simpan dari drawer, lalu reload: chip Favoritku hanya menampilkan yang disimpan.
    await page.locator('#save-property-btn').click();
    await expect(page.locator('#save-property-btn')).toContainText('Tersimpan');
    await page.reload();
    await page.locator('#filter-favorites').click();
    await expect(page.locator('.property-card')).toHaveCount(1);
    // Bagikan: clipboard berisi tautan deep-link kos itu.
    await page.locator('.property-card').first().click();
    await page.locator('#share-property-btn').click();
    await expect(page.locator('.detail-panel__copied')).toBeVisible();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toMatch(/\/peta\?kos=prop-/);
  });

  test('filter tanpa hasil menampilkan empty state', async ({ page }) => {
    await page.goto('/peta');
    await page.locator('#map-search-input').fill('nama yang tidak ada');
    await expect(page.locator('.property-list__empty-title')).toBeVisible();
    await expect(page.locator('.property-card')).toHaveCount(0);
  });
});
