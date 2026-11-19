# Changelog

Semua perubahan penting di proyek ini dicatat di file ini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.1.0] - 2026-11-19

### Added
- **Dataset jujur (opsi B):** 208 kos nyata Banda Aceh & Aceh Besar dari
  listing publik (Mamikos 91, carialamat 98, penginapan.net 12, Instagram 5,
  airpaz 1, kost1 1) — `data/kos.json` + mentah & skrip di `scripts/collect/`
  (`raw-batch-01`–`11.json`, `merge.py`, `geocode.py`). Tiap kos tertelusur
  ke URL sumbernya.
- Geocode 150/208 kos via plus code + Nominatim (149 level area, 1 level
  tempat); 58 tanpa koordinat tetap tampil di daftar, tidak di peta.
- 6 foto hotlink dari halaman detail sumber (bukan download/re-host).
- Drawer detail: blok sumber (nama + tautan listing asli + tanggal ambil),
  tombol Hubungi `tel:` (hanya kalau sumber mencantumkan nomor publik),
  label akurasi koordinat, foto sumber kalau ada.
- Filter area (dropdown 67 area dari dataset) + chip fasilitas sesuai
  kosakata dataset (WiFi, AC, KM Dalam, Kasur, Kloset Duduk, Akses 24 Jam).
- Halaman `/tentang` (landing lama pindah): hero + peta live + 6 kos termurah.
- Rute lama `/peta` redirect klien ke `/` (deep-link `?kos=` ikut terbawa).

### Changed
- **`/` sekarang explorer penuh** (filter + daftar 208 kos + peta + drawer)
  — tanpa landing yang harus di-scroll dulu. Daftar memuat bertahap 30 +
  tombol "Muat lagi".
- `src/lib/mockData.ts` (8 kos contoh) dihapus — diganti `src/lib/kosData.ts`
  + `src/lib/format.ts`. Semua referensi "data contoh" di PRD/docs/kode
  diperbarui ke dataset jujur.
- Deep-link + bagikan pindah dari `/peta?kos=` ke `/?kos=`.
- Status kamar semua kos nyata = "Tidak diketahui" (abu-abu) — sumber tidak
  memberi info ketersediaan yang bisa diverifikasi.
- Filter harga hanya untuk harga bulanan yang tercantum (kos tanpa harga /
  harga tahunan tidak tampil saat filter harga aktif).
- e2e menghitung harapan dari `data/kos.json` (tetap benar sesudah refresh
  dataset); smoke + screenshot + docs deploy/testing diperbarui ke rute baru.

### Fixed
- `merge.py`: hapus 3 `updates` basi batch-02 (target sudah jadi entri
  batch-07) — merge kini 0 WARN. Merge mempertahankan hasil geocode yang
  sudah ada (lat/lon/accuracy/plus_code tidak terhapus merge ulang).
- `geocode.py`: decode Open Location Code diperbaiki (pasangan pertama sel
  20°); plus code sumber yang tidak resolve ke Banda Aceh dihapus dari
  dataset, bukan dipaksakan.
- `PropertyList`: reset pagination pakai pola "adjusting state during render"
  (bukan setState di effect — ESLint `react-hooks/set-state-in-effect`).

## [1.0.0] - 2026-11-19

### Added
- Landing (`/`) ala SaaS: hero editorial + peta live + daftar 8 kos + cara
  kerja + fitur + footer; navbar dengan logo GitHub ke repo.
- Aplikasi peta penuh (`/peta`): panel filter + daftar + peta + drawer detail.
- Filter nyata (harga, fasilitas, tipe kos, favorit, pencarian) — menyaring
  daftar dan marker peta sekaligus.
- Favorit kos (localStorage, tanpa akun) + bagikan tautan deep-link
  (`/peta?kos=<id>`).
- Tombol "Lokasiku" (geolocation) di peta.
- 4 kos contoh baru (prop-005–prop-008), total 8 kos di Darussalam / Kopelma.
- CI 6 job (build, lint, static-checks, advisory-sweep OSV, Playwright e2e,
  smoke) + skrip `scripts/` (check-links, check-static, screenshot,
  make-video, smoke, advisory-sweep).
- Docs lengkap: DESIGN.md (kontrak arah desain), architecture.md, data.md,
  deploy.md, testing.md, diagrams.html (HTML+SVG).
- Screenshot desktop + mobile + video demo (`docs/demo/demo.mp4`).
- Deploy live Cloudflare Pages: https://lokakos.pages.dev.

### Changed
- **Restructure:** isi subfolder `lokakos/` dipindah ke root repo (package.json,
  src/, public, config naik ke root; subfolder lama dihapus dari tree).
- **Peta diganti total:** Mapbox GL + react-map-gl → Leaflet + tile standar
  OpenStreetMap (tanpa API key). Alasan: tidak ada token Mapbox di
  repo dan tanpa token peta live blank. Tile CARTO Positron sempat dicoba dan
  ditolak — servernya mengembalikan watermark "API KEY REQUIRED" tanpa key.
- Semua gaya komponen dipusatkan di `src/app/globals.css` (sebelumnya ±1500
  baris `<style>` tersebar di tiap komponen).
- Font Inter → Fraunces + Public Sans (kontrak desain).
- "Hubungi Pemilik" dihapus — data contoh tidak punya nomor pemilik; diganti
  Simpan + Bagikan yang benar-benar jalan.
- Tombol Masuk / Daftar dihapus — tidak ada auth; diganti navigasi + CTA
  Buka Peta.
- `next.config.ts`: `output: 'export'` untuk Cloudflare Pages.

### Fixed
- Kontrol zoom Leaflet (z-index 1000) menutupi tombol tutup drawer, tombol
  Lokasiku, dan ujung search bar di mobile — z-index drawer/search/locate
  dinaikkan di atas kontrol Leaflet, tombol Lokasiku dipindah ke bawah
  kontrol zoom (ditemukan saat play-test e2e).
- Kartu kos di panel daftar mengecil terpotong (flex-shrink di kolom scroll
  flex) — kartu tidak lagi menyusut (ditemukan saat review screenshot).
- Kontras teks di bawah AA: angka langkah (`#C98F1F`, 2.62), teks badge status
  (Tersedia 4.26, Hampir Penuh 4.42, Penuh 3.81), tombol Reset Filter (3.81) —
  semua diganti varian teks gelap yang dihitung lolos AA (5.51–6.23).

### Removed
- `lokakos/app_backup_root/` (duplikat usang `src/app`).
- `src/app/health/` (route handler tidak didukung static export).
- `src/components/map/PropertyMarker.tsx` (khusus Mapbox).
- `src/lib/mapbox/` (config token Mapbox).
- SVG boilerplate create-next-app di `public/` (file.svg, globe.svg,
  next.svg, vercel.svg, window.svg).
- `lokakos/README.md` boilerplate create-next-app (README root ditulis ulang).

### Moved
- Folder `file /` (proposal bisnis docx + pdf, nama ber-spasi) → rapi ke
  `docs/proposals/` dengan nama file bersih.
- `lokakos/PLANNER.md` → `docs/PLANNER.md` (arsip; Mapbox + dark mode di
  dalamnya sudah tidak berlaku).
- `lokakos/AGENTS.md`, `lokakos/CLAUDE.md` → root.

### Fixed
- Filter chip yang sebelumnya hanya mengubah state lokal dan tidak memfilter
  apa pun.
- Search bar yang sebelumnya tidak dipasangkan (`onSearch` tidak pernah
  dikirim dari halaman).
- Konflik file saat restructure: README root (template repo) dipertahankan
  dan ditulis ulang; README subfolder (boilerplate create-next-app) dihapus;
  `.gitignore` root diganti versi Next.js dari subfolder (lebih lengkap).

## [0.1.0] - 2026-11-05

### Added
- Scaffolding awal Next.js (Mapbox, 4 kos contoh, panel + drawer statis).
