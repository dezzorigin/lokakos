# Arsitektur LokaKos

## Ringkas

Next.js 16 (App Router) + React 19 + Tailwind v4, **static export**
(`output: 'export'`) ke Cloudflare Pages. Tanpa backend, tanpa database,
tanpa API key. Peta: Leaflet + tile standar OpenStreetMap.
Data: 208 kos nyata dari listing publik di `data/kos.json` (PR #2, opsi B),
di-load lewat `src/lib/kosData.ts`. State: React lokal +
localStorage (favorit).

## Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16.2.4, App Router | Sudah dipakai repo sejak awal; static export paling gampang di Pages |
| Bahasa | TypeScript (strict) | `tsc --noEmit` di CI |
| Peta | Leaflet 1.9 + react-leaflet 5 | Tanpa API key — lihat keputusan di bawah |
| Tile | OpenStreetMap standar (`tile.openstreetmap.org`) | Tanpa key; atribusi OSM wajib tampil |
| Gaya | Tailwind v4 + `globals.css` kustom | Token desain di `:root`; tidak ada `<style>` inline di komponen |
| Font | Fraunces + Public Sans (`next/font`) | Diunduh saat build, self-hosted — tanpa fetch runtime |
| Tes | Playwright (e2e) + skrip Node | Lihat `docs/testing.md` |
| CI | GitHub Actions (6 job) | Lihat `.github/workflows/ci.yml` |

## Keputusan penting

### 1. Mapbox dihapus, diganti Leaflet + OSM

Aplikasi awal memakai Mapbox GL + react-map-gl dengan
`NEXT_PUBLIC_MAPBOX_TOKEN`. Tidak ada token di repo (dan tidak boleh ada —
token bukan untuk di-commit), jadi di halaman live peta akan blank: produk
yang intinya peta tapi petanya tidak muncul.

Alternatif yang dipertimbangkan:

- **Minta token Mapbox Nabil** — ditolak: menambah secret + tagihan + satu
  langkah setup untuk demo; tidak sebanding.
- **Leaflet + OSM** — dipilih: gratis, tanpa key, tanpa watermark.
  (Tile CARTO Positron dicoba dulu dan ditolak: servernya kini membalas
  tile watermark "API KEY REQUIRED" tanpa key.) Kerugian: tanpa gedung 3D dan
  tanpa geocoding Mapbox (pencarian di sini memfilter data lokal, bukan
  geocoding — memang itu kebutuhan produk saat ini).

Konsekuensi: `mapbox-gl`, `react-map-gl`, `@types/mapbox-gl` dihapus dari
`package.json`; `src/lib/mapbox/` dihapus; `src/app/health/` (route handler)
dihapus karena tidak didukung static export. Detail penghapusan + file yang
dihapus dari tree ada di badan PR.

### 2. Static export, bukan server Next.js

`output: 'export'` menghasilkan `out/` statis yang di-upload langsung ke
Cloudflare Pages (direct upload, `cf_pages.py`). Tidak ada Route Handler,
tidak ada SSR dinamis. `useSearchParams` di `/` dibungkus `<Suspense>`
(syarat Next 16 untuk route prerender). `redirects` di `next.config` TIDAK
didukung static export — karena itu rute lama `/peta` redirect ke `/` lewat
komponen klien (`router.replace`), bukan lewat config.

### 3. Dua rute, satu komponen peta

- `/` — explorer penuh: panel kiri (filter + daftar) + peta + drawer detail.
  Buka situs langsung masuk daftar lengkap 208 kos.
- `/tentang` — landing: hero editorial + **peta live** (MapContainer yang sama).
  Klik karcis harga → `/?kos=<id>`.
- `/peta` — redirect klien ke `/` (deep-link `?kos=` ikut terbawa), supaya
  tautan lama tetap jalan.

`MapContainer` membungkus `MapView` (Leaflet, `dynamic ssr:false`) dan menjaga
satu API: `properties`, `selectedPropertyId`, `onPropertySelect`,
`onMarkerNavigate`.

## Struktur folder

```
src/
├── app/
│   ├── layout.tsx        # Font Fraunces + Public Sans, metadata, favicon.svg
│   ├── page.tsx          # Explorer penuh (filter + daftar 208 kos + peta + drawer)
│   ├── tentang/page.tsx  # Landing (hero + peta live + contoh 6 kos + fitur)
│   ├── peta/page.tsx     # Redirect klien /peta -> / (?kos= ikut terbawa)
│   ├── not-found.tsx
│   └── globals.css       # SELURUH design system (token + semua komponen)
├── components/
│   ├── layout/Navbar.tsx       # Brand + nav + logo GitHub + CTA Buka Daftar Kos
│   ├── layout/FilterPanel.tsx  # Chip filter (controlled)
│   ├── map/MapContainer.tsx    # Wrapper dynamic ssr:false
│   ├── map/MapView.tsx         # Leaflet: tile, marker karcis, fly-to, lokasiku
│   ├── map/MapSearchBar.tsx    # Pencarian (controlled)
│   └── property/
│       ├── PropertyCard.tsx    # Kartu kos + tombol favorit
│       ├── PropertyDetail.tsx  # Drawer detail + Simpan + Bagikan
│       └── PropertyList.tsx    # Daftar + jumlah hasil + empty state
├── hooks/useMap.ts       # viewState + selectedProperty
├── lib/
│   ├── map/config.ts     # Tile URL, center, zoom, bounds Banda Aceh
│   ├── kosData.ts        # Dataset jujur: data/kos.json -> Property[] + AREAS + statistik
│   ├── format.ts         # Format harga IDR (pendek + lengkap + periode)
│   ├── property.ts       # Status kamar (satu definisi) + label gender
│   ├── filter.ts         # FilterState + applyFilters (satu sumber kebenaran)
│   └── favorites.ts      # Favorit di localStorage
└── types/                # Property, Room, ViewState
```

## Alur state

```
KOS_PROPERTIES (208 kos nyata, data/kos.json)
      │
      ├─ FilterState { price, facilities, type, area, favoritesOnly, query }
      │     └─ applyFilters() ──> filtered (daftar + marker peta)
      │
      ├─ klik kartu / marker ──> selectProperty(p) ──> drawer detail
      │     └─ MapView flyTo(p) saat dipilih dari daftar (kalau berkoordinat)
      │
      ├─ ♥ favorit ──> useFavorites() ──> localStorage 'lokakos:favorites:v1'
      │
      └─ Bagikan ──> clipboard: {origin}/?kos=<id>
            └─ buka tautan ──> ?kos= ──> drawer langsung terbuka
```

Satu aturan: **filter adalah satu fungsi** (`applyFilters`). FilterPanel tidak
menyimpan state sendiri; daftar dan marker selalu membaca hasil yang sama.
Sebelum restructure, chip filter hanya mengubah state lokal dan tidak
memfilter apa pun.

## Alur data (baca)

```
Browser ──> out/ statis (Cloudflare Pages)
   ├─ tile: tile.openstreetmap.org (OSM)
   ├─ font: self-hosted (next/font, di-bundle saat build)
   └─ data: KOS_PROPERTIES (data/kos.json, di-bundle di JS, tanpa fetch)
```

Tidak ada request ke backend LokaKos sama sekali. Satu-satunya jaringan
runtime: tile peta (+ atribusi) dan — kalau ada — tidak ada lagi.

## Batas yang diketahui

- Dataset 208 kos dari listing publik 19 Nov 2026 — harga/kontak bisa
  berubah; drawer menampilkan sumber + tanggal ambil + tautan listing asli.
  Cara refresh: `scripts/collect/` (lihat `docs/data.md`).
- 119 dari 208 kos tanpa harga di sumber; kos tanpa koordinat tidak tampil
  di peta (tetap ada di daftar). Status kamar semua "tidak diketahui" —
  sumber tidak memberi info ketersediaan yang bisa diverifikasi.
- Pencarian memfilter nama/alamat/area data lokal — bukan geocoding.
- "Lokasiku" butuh izin geolocation browser; kalau ditolak, tombol memberi tahu.
- Tile butuh internet; kalau tile gagal total, peta menampilkan fallback
  informatif (bukan abu-abu kosong), daftar tetap jalan.
