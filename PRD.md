# PRD — LokaKos

## 1. Informasi Proyek

| Field | Nilai |
|---|---|
| Nama Proyek | LokaKos |
| Tech Stack | Next.js 16, React 19, TypeScript, Tailwind v4, Leaflet + OpenStreetMap |
| Status | Proper (v1.0.0) — live di https://lokakos.pages.dev |
| Penanggung Jawab | Nabil Aulia Dika (dezzorigin) |
| Versi Dokumen | 2.0 (rewrite saat restructure + rebuild, 19 Nov 2026) |
| Dokumen sebelumnya | v1.0 (template generik, tidak menggambarkan produk) |

## 2. Latar Belakang

Mahasiswa baru Unsyiah dan perantau yang cari kos di Darussalam / Kopelma
biasanya mulai dari grup chat dan daftar panjang tanpa lokasi yang jelas.
Jarak ke kampus adalah faktor pertama — tapi di daftar vertikal, jarak hanya
jadi teks alamat. LokaKos membalik urutannya: **peta dulu, daftar kemudian**.
Pengguna melihat dulu di mana kosnya, berapa harganya, dan apakah kamarnya
masih ada, sebelum membaca deskripsi apa pun.

## 3. Masalah yang Diselesaikan

- Cari kos dari jauh tanpa gambaran lokasi → peta sebagai UI utama, harga
  langsung di marker.
- Daftar vertikal menyembunyikan status kamar → titik warna di marker +
  badge status di kartu (Tersedia / Hampir Penuh / Penuh).
- Filter pajangan → filter harga, fasilitas, tipe, dan pencarian yang
  benar-benar menyaring daftar dan peta sekaligus.
- Berbagi rekomendasi kos itu ribet → tautan deep-link per kos
  (`/peta?kos=…`) yang membuka langsung detailnya.

## 4. Tujuan & Sasaran

- Pengguna menemukan kos yang cocok dalam 3 langkah: lihat peta → saring →
  buka detail (tanpa akun, tanpa formulir).
- Semua fitur yang ditampilkan berfungsi di play-test (tanpa tombol mati).
- Peta jalan di halaman live tanpa API key dan tanpa secret.
- Semua data contoh dilabeli jujur sebagai contoh.

## 5. Ruang Lingkup

### In Scope

- Landing (`/`): hero editorial + peta live + daftar kos + cara kerja + fitur.
- Aplikasi peta (`/peta`): panel filter + daftar + peta Leaflet/OSM + drawer
  detail + favorit (localStorage) + bagikan (deep-link) + lokasiku.
- 8 kos contoh di Darussalam / Kopelma (data demo, berlabel contoh).
- CI (build, lint, static-checks, advisory-sweep OSV, Playwright e2e, smoke),
  docs lengkap, deploy Cloudflare Pages.

### Out of Scope

- Backend / database / auth (Supabase direncanakan, belum dibangun).
- Pemesanan, pembayaran, chat dengan pemilik kos.
- Geocoding / pencarian alamat global (pencarian memfilter data lokal).
- Foto kos asli (data contoh tidak punya foto; tidak ada placeholder palsu).

## 6. Fitur & Persyaratan Fungsional

| ID | Fitur | Kriteria terima |
|---|---|---|
| FR-1 | Peta live (Leaflet + OSM) | 8 marker karcis harga muncul; tile tanpa API key; atribusi OSM tampil |
| FR-2 | Marker harga + status | Label harga singkat; titik warna = status kamar; klik → drawer + fly-to |
| FR-3 | Filter (harga, fasilitas, tipe, favorit, cari) | Daftar + marker tersaring bersamaan; jumlah hasil tampil "N dari 8"; Reset mengembalikan semua |
| FR-4 | Daftar kos | 8 kartu; nama, alamat, tipe, fasilitas (max 3 + "+N"), harga mulai /bln |
| FR-5 | Drawer detail | Nama, alamat, harga min–max, deskripsi, fasilitas, tipe kamar + sisa kamar |
| FR-6 | Favorit | Toggle hati di kartu/drawer; bertahan setelah reload (localStorage); chip Favoritku memfilter |
| FR-7 | Bagikan | Salin tautan `/peta?kos=<id>`; tautan itu membuka drawer kos yang sama |
| FR-8 | Deep-link `?kos=` | Membuka `/peta?kos=<id>` langsung menampilkan drawer kos itu |
| FR-9 | Lokasiku | Menerbangkan peta ke posisi pengguna; penolakan izin diberi tahu, bukan diam |
| FR-10 | Landing | Navbar + logo GitHub ke repo; hero + peta live; statistik dari data asli; footer |
| FR-11 | Responsif | Mobile 390px: tanpa overflow horizontal, target sentuh ≥ 44px, panel jadi sheet bawah |

## 7. Persyaratan Non-Fungsional

- **Performa:** situs statis (`out/`); font self-hosted; tanpa request backend.
- **Keamanan:** tanpa secret ke-commit; tanpa API key; `.env.example` hanya
  mendokumentasikan bahwa tidak ada key yang dibutuhkan.
- **Aksesibilitas:** kontras AA; focus-visible; aria-label di tombol ikon;
  `prefers-reduced-motion` dihormati.
- **Kualitas UI:** standar anti-slop P1 — referensi dulu (Marren & Co,
  Framer), kontrak di `docs/DESIGN.md`, gate 7 sumbu sebelum merge.
- **Portabilitas:** Node ≥ 22; jalan di Linux/macOS/Windows.

## 8. Arsitektur & Tech Stack

Next.js 16 App Router, static export (`output: 'export'`) → Cloudflare Pages.
Leaflet + react-leaflet, tile standar OpenStreetMap. State lokal
React + localStorage. Detail: [docs/architecture.md](docs/architecture.md).

## 9. Milestone / Roadmap

| Fase | Status |
|---|---|
| Scaffolding Next.js + Mapbox (awal) | ✅ (arsip di `docs/PLANNER.md`) |
| Restructure subfolder `lokakos/` → root | ✅ (PR #1, 19 Nov 2026) |
| Ganti Mapbox → Leaflet + OSM | ✅ (PR #1) |
| Landing + `/peta` + filter/favorit/bagikan | ✅ (PR #1) |
| CI + docs + deploy Pages | ✅ (PR #1) |
| Backend Supabase (listing asli, auth pemilik kos) | ⏳ (rencana) |
| Foto kos + upload pemilik | ⏳ (rencana) |

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Tile OSM diblokir jaringan pengguna | Fallback informatif di peta; daftar tetap jalan |
| Data contoh dikira listing asli | Label "data contoh" di daftar, drawer, dan footer |
| Token / secret ter-commit | Sapu secret di CI (`check-links.mjs`); `.gitignore` menutup `.env*` |
| Dependensi rentan | Advisory-sweep OSV di CI (produksi saja, HIGH/CRITICAL = gagal) |

## 11. Kriteria Keberhasilan

- Build + 6 job CI hijau; Playwright e2e 7/7 lolos (desktop + mobile).
- Live di https://lokakos.pages.dev: HTTP 200 di `/` dan `/peta/`, 8 marker
  muncul, filter + favorit + bagikan terverifikasi di play-test.
- Gate 7 sumbu anti-slop ≥ 4/5 tiap sumbu; tes siluet lolos.
- Tidak ada secret ke-commit; Mapbox bersih dari `src/`.

## 12. Lampiran

- Desain: [docs/DESIGN.md](docs/DESIGN.md)
- Arsitektur: [docs/architecture.md](docs/architecture.md)
- Data: [docs/data.md](docs/data.md)
- Deploy: [docs/deploy.md](docs/deploy.md)
- Diagram: [docs/diagrams.html](docs/diagrams.html)
- Proposal bisnis (arsip): [docs/proposals/](docs/proposals/)
