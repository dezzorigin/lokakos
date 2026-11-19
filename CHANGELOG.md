# Changelog

Semua perubahan penting di proyek ini dicatat di file ini.
Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
