# Testing LokaKos

## Otomatis

| Perintah | Isi |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (termasuk `no-html-link-for-pages`) |
| `npm run validate` | `check-links.mjs` + `check-static.mjs` (tautan lokal, file wajib, sapu secret, gate P0, Mapbox bersih) |
| `npm run sweep` | Advisory-sweep OSV batch (produksi saja; HIGH/CRITICAL = gagal) |
| `npm test` | Playwright e2e (`e2e/smoke.spec.ts`, desktop + mobile) |
| `npm run smoke` | Smoke folder `out/` statis (explorer + tentang + redirect /peta + favicon) |

CI (`.github/workflows/ci.yml`, 6 job): build, lint, static-checks,
advisory-sweep, playwright-e2e, smoke. Semua harus hijau sebelum merge.

## Menjalankan e2e lokal

```bash
npm run dev            # terminal 1, port 8331
BASE_URL=http://127.0.0.1:8331 \
PLAYWRIGHT_PROXY=http://127.0.0.1:18081 \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=$HOME/.cache/ms-playwright/chromium-1234/chrome-linux/chrome \
npx playwright test --project=desktop
```

- `PLAYWRIGHT_PROXY` — tile peta + font lewat forwarder (egress VM
  proxy-only). Di CI tidak di-set (runner punya internet langsung).
- **JANGAN** `npx playwright install chromium` di VM ini — perintah itu
  menghapus isi `~/.cache/ms-playwright/` (chromium-1234 milik tooling
  video-demo). Pakai Chromium yang sudah ada di cache.
- e2e menguji DOM aplikasi (marker, daftar, filter, drawer, favorit,
  bagikan), bukan piksel tile — tile boleh lambat.

## Skenario e2e (`e2e/smoke.spec.ts`)

Harapan jumlah DIHITUNG dari `data/kos.json` di dalam file tes (bukan angka
tulis tangan) — tetap benar sesudah geocode / refresh dataset.

1. Beranda `/` = explorer: peta Leaflet + marker karcis (kos berkoordinat) +
   judul "208 dari 208" + 30 kartu dulu (muat bertahap); tombol Muat lagi →
   60 kartu; label provenance "diperbarui 2026-11-19".
2. `/?kos=<id>` → drawer detail dengan blok sumber (nama + tautan listing
   asli + tanggal ambil); kos bertelepon menampilkan tombol Hubungi `tel:`;
   kos tanpa harga menampilkan "Tidak tercatat di sumber".
3. Filter `< Rp 700rb` → 13 kartu + judul "13 dari 208"; tambah tipe Putri →
   irisan; Reset → 30 kartu pertama dari 208.
4. Filter area "Kopelma Darussalam" → 7 kartu; filter fasilitas WiFi → 59
   hasil (30 kartu di halaman pertama).
5. Cari "Kopelma" → hasil dari `data/kos.json`; hapus pencarian → 30 lagi.
6. Klik kartu → drawer; Simpan → "Tersimpan"; reload → chip Favoritku
   menampilkan 1 kartu; Bagikan → clipboard berisi `/?kos=k…`.
7. Pencarian tanpa hasil → empty state, 0 kartu.
8. `/peta/` redirect ke `/`; `/peta?kos=<id>` redirect ke `/?kos=<id>` +
   drawer terbuka.
9. `/tentang`: hero + peta live + 6 kartu contoh termurah; klik kartu →
   `/?kos=…` + drawer.
10. Mobile 390px tanpa overflow horizontal.

## Play-test manual (checklist sebelum merge)

- [ ] Beranda `/` desktop: panel filter + daftar 208 kos (30 dulu) + peta +
      marker karcis + legenda status; klik kartu/marker → drawer.
- [ ] `/tentang` desktop: hero, peta + karcis, contoh 6 kos termurah,
      stepper, fitur, footer.
- [ ] `/tentang` mobile 390px: tidak ada scroll horizontal, tombol ≥ 44px.
- [ ] `/`: panel kiri bisa di-collapse; search memfilter; filter area /
      harga / fasilitas / tipe memfilter daftar + marker bersamaan.
- [ ] Klik marker → drawer + peta fly-to (kos berkoordinat); klik kartu →
      sama; klik peta kosong → drawer tertutup (deselect).
- [ ] Drawer: blok sumber (tautan listing asli) + tanggal ambil; Hubungi
      `tel:` muncul hanya kalau sumber mencantumkan nomor.
- [ ] Simpan favorit → hati merah; reload → favorit tetap; chip Favoritku
      memfilter.
- [ ] Bagikan → "Tautan disalin"; buka tautan di tab baru → drawer kos itu terbuka.
- [ ] `/peta/` redirect ke `/`; `/peta?kos=<id>` → `/?kos=<id>` + drawer.
- [ ] "Lokasiku" → minta izin geolocation; kalau ditolak, tombol memberi tahu.
- [ ] Matikan internet tile (atau blokir tile.openstreetmap.org) → fallback
      informatif muncul, daftar tetap jalan.

## Screenshot + video demo

```bash
npm run screenshots   # docs/screenshots/*.png (butuh server di :8331 + forwarder)
npm run make-video    # docs/demo/demo.mp4 (ffmpeg zoompan, 5 dtk per adegan)
```

Screenshot diambil ulang setelah perubahan landing/peta apa pun.
