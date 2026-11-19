# PRD — LokaKos

## 1. Informasi Proyek

| Field | Nilai |
|---|---|
| Nama Proyek | LokaKos |
| Tech Stack | Next.js 16, React 19, TypeScript, Tailwind v4, Leaflet + OpenStreetMap |
| Status | Proper (v1.1.0) — live di https://lokakos.pages.dev |
| Penanggung Jawab | Nabil Aulia Dika (dezzorigin) |
| Versi Dokumen | 2.1 (dataset jujur + `/` jadi explorer, 19 Nov 2026) |
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
  badge status di kartu (Tersedia / Hampir Penuh / Penuh / Tidak diketahui —
  listing publik tidak memberi info ketersediaan, jadi statusnya jujur
  "tidak diketahui", bukan hijau palsu).
- Filter pajangan → filter area, harga, fasilitas, tipe, dan pencarian yang
  benar-benar menyaring daftar dan peta sekaligus.
- Berbagi rekomendasi kos itu ribet → tautan deep-link per kos
  (`/?kos=…`) yang membuka langsung detailnya.

## 4. Tujuan & Sasaran

- Pengguna menemukan kos yang cocok dalam 3 langkah: lihat peta → saring →
  buka detail (tanpa akun, tanpa formulir).
- Semua fitur yang ditampilkan berfungsi di play-test (tanpa tombol mati).
- Peta jalan di halaman live tanpa API key dan tanpa secret.
- Semua kos tertelusur ke listing publik (sumber + tautan + tanggal ambil);
  field yang tidak ada di sumber ditulis tidak ada, bukan dikarang.

## 5. Ruang Lingkup

### In Scope

- Explorer penuh (`/`): panel filter + daftar 208 kos + peta Leaflet/OSM +
  drawer detail + favorit (localStorage) + bagikan (deep-link) + lokasiku.
  Buka situs langsung masuk daftar lengkap — tanpa landing yang harus
  di-scroll dulu.
- Landing (`/tentang`): hero editorial + peta live + contoh 6 kos termurah +
  cara kerja + fitur.
- Rute lama `/peta` redirect ke `/` (deep-link `?kos=` ikut terbawa).
- 208 kos nyata Banda Aceh & Aceh Besar dari listing publik (Mamikos,
  carialamat, penginapan.net, Instagram, airpaz, kost1) — dikumpulkan
  19 Nov 2026, tiap kos tertelusur ke URL sumbernya (lihat `docs/data.md`).
- CI (build, lint, static-checks, advisory-sweep OSV, Playwright e2e, smoke),
  docs lengkap, deploy Cloudflare Pages.

### Out of Scope

- Backend / database / auth (Supabase direncanakan, belum dibangun).
- Pemesanan, pembayaran, chat dengan pemilik kos.
- Geocoding / pencarian alamat global (pencarian memfilter data lokal).
- Foto kos: hanya 1 dari 208 listing yang menyertakan foto yang bisa
  di-hotlink dari sumber; tanpa placeholder palsu, tanpa download/re-host
  foto orang.

## 6. Fitur & Persyaratan Fungsional

| ID | Fitur | Kriteria terima |
|---|---|---|
| FR-1 | Peta live (Leaflet + OSM) | Marker karcis harga muncul untuk tiap kos berkoordinat; tile tanpa API key; atribusi OSM tampil |
| FR-2 | Marker harga + status | Label harga singkat; titik warna = status kamar; klik → drawer + fly-to; kos tanpa harga berkarcis '?' |
| FR-3 | Filter (area, harga, fasilitas, tipe, favorit, cari) | Daftar + marker tersaring bersamaan; jumlah hasil tampil "N dari 208"; Reset mengembalikan semua; filter harga hanya untuk harga bulanan yang tercantum |
| FR-4 | Daftar kos | 208 kartu (muat bertahap 30 + tombol "Muat lagi"); nama, alamat, tipe, fasilitas (max 3 + "+N"), harga mulai /bln atau "Harga tidak tercatat di sumber" |
| FR-5 | Drawer detail | Nama, alamat, harga min–max + periode, fasilitas, catatan kamar, nomor kontak publik (kalau ada), blok sumber (nama + tautan listing asli + tanggal ambil) |
| FR-6 | Favorit | Toggle hati di kartu/drawer; bertahan setelah reload (localStorage); chip Favoritku memfilter |
| FR-7 | Bagikan | Salin tautan `/?kos=<id>`; tautan itu membuka drawer kos yang sama |
| FR-8 | Deep-link `?kos=` | Membuka `/?kos=<id>` langsung menampilkan drawer kos itu; `/peta?kos=<id>` redirect ke `/?kos=<id>` |
| FR-9 | Lokasiku | Menerbangkan peta ke posisi pengguna; penolakan izin diberi tahu, bukan diam |
| FR-10 | Tentang | Navbar + logo GitHub ke repo; hero + peta live; statistik dari data asli; footer |
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
| Dataset jujur 208 kos + `/` jadi explorer + `/tentang` | ✅ (PR #2, 19 Nov 2026) |
| CI + docs + deploy Pages | ✅ (PR #1) |
| Backend Supabase (listing asli, auth pemilik kos) | ⏳ (rencana) |
| Foto kos + upload pemilik | ⏳ (rencana) |

## 10. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Tile OSM diblokir jaringan pengguna | Fallback informatif di peta; daftar tetap jalan |
| Harga/kontak berubah setelah tanggal ambil (19 Nov 2026) | Blok sumber di drawer: tautan listing asli + tanggal ambil; ajakan cek listing asli sebelum menghubungi |
| Data listing tanpa harga/koordinat | State jujur di UI ("tidak tercatat" / "belum terpetakan"); kos tetap tampil di daftar, tidak dipaksakan ke peta |
| Token / secret ter-commit | Sapu secret di CI (`check-links.mjs`); `.gitignore` menutup `.env*` |
| Dependensi rentan | Advisory-sweep OSV di CI (produksi saja, HIGH/CRITICAL = gagal) |

## 11. Kriteria Keberhasilan

- Build + 6 job CI hijau; Playwright e2e 11/11 lolos (desktop + mobile).
- Live di https://lokakos.pages.dev: HTTP 200 di `/`, `/tentang/`, dan
  `/peta/`; marker muncul untuk kos berkoordinat; daftar menampilkan 208 kos;
  filter + favorit + bagikan terverifikasi di play-test.
- Gate 7 sumbu anti-slop ≥ 4/5 tiap sumbu; tes siluet lolos.
- Tidak ada secret ke-commit; Mapbox bersih dari `src/`.

## 12. Lampiran

- Desain: [docs/DESIGN.md](docs/DESIGN.md)
- Arsitektur: [docs/architecture.md](docs/architecture.md)
- Data: [docs/data.md](docs/data.md)
- Deploy: [docs/deploy.md](docs/deploy.md)
- Diagram: [docs/diagrams.html](docs/diagrams.html)
- Proposal bisnis (arsip): [docs/proposals/](docs/proposals/)
