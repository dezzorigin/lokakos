# Testing LokaKos

## Otomatis

| Perintah | Isi |
|---|---|
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (termasuk `no-html-link-for-pages`) |
| `npm run validate` | `check-links.mjs` + `check-static.mjs` (tautan lokal, file wajib, sapu secret, gate P0, Mapbox bersih) |
| `npm run sweep` | Advisory-sweep OSV batch (produksi saja; HIGH/CRITICAL = gagal) |
| `npm test` | Playwright e2e (`e2e/smoke.spec.ts`, desktop + mobile) |
| `npm run smoke` | Smoke folder `out/` statis (landing + peta + favicon) |

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

1. Landing: hero + peta Leaflet + 8 marker karcis + 8 kartu; klik kartu →
   `/peta?kos=…`; mobile 390px tanpa overflow horizontal.
2. `/peta?kos=prop-003` → drawer "Kos Campur Nusa Indah" terbuka; tutup
   drawer berfungsi.
3. Filter `< Rp 700rb` → 3 kartu + 3 marker + judul "3 dari 8"; tambah
   tipe Putri → 1 kartu; Reset → 8 lagi.
4. Cari "Kopelma" → 1 kartu; hapus pencarian → 8 lagi.
5. Klik marker → drawer; Simpan → "Tersimpan"; reload → chip Favoritku
   menampilkan 1 kartu; Bagikan → clipboard berisi `/peta?kos=prop-…`.
6. Pencarian tanpa hasil → empty state, 0 kartu.

## Play-test manual (checklist sebelum merge)

- [ ] Landing desktop: hero, peta + 8 karcis, daftar 8 kartu, stepper, fitur, footer.
- [ ] Landing mobile 390px: tidak ada scroll horizontal, tombol ≥ 44px.
- [ ] `/peta`: panel kiri bisa di-collapse; search memfilter; filter harga /
      fasilitas / tipe memfilter daftar + marker bersamaan.
- [ ] Klik marker → drawer + peta fly-to; klik kartu → sama; klik peta kosong
      → drawer tertutup (deselect).
- [ ] Simpan favorit → hati merah; reload → favorit tetap; chip Favoritku
      memfilter.
- [ ] Bagikan → "Tautan disalin"; buka tautan di tab baru → drawer kos itu terbuka.
- [ ] "Lokasiku" → minta izin geolocation; kalau ditolak, tombol memberi tahu.
- [ ] Matikan internet tile (atau blokir tile.openstreetmap.org) → fallback
      informatif muncul, daftar tetap jalan.

## Screenshot + video demo

```bash
npm run screenshots   # docs/screenshots/*.png (butuh server di :8331 + forwarder)
npm run make-video    # docs/demo/demo.mp4 (ffmpeg zoompan, 5 dtk per adegan)
```

Screenshot diambil ulang setelah perubahan landing/peta apa pun.
