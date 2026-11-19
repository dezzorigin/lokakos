# Data LokaKos

## Status: dataset jujur (PR #2, opsi B)

Sejak PR #2, data BUKAN contoh lagi: **208 kos nyata Banda Aceh & Aceh Besar**
dari listing publik, dikumpulkan **19 Nov 2026**. Setiap kos tertelusur ke
URL sumbernya (`source_url`). Field yang tidak ada di sumber = `null` dan
ditampilkan apa adanya di UI ("tidak tercatat" / "belum terpetakan") — bukan
diisi karangan.

> **Harga/kontak bisa berubah** setelah tanggal ambil. Drawer detail tiap kos
> menampilkan nama sumber, tautan listing asli, dan tanggal ambil — cek
> listing aslinya sebelum menghubungi.

## Angka (dihitung dari `data/kos.json`, 19 Nov 2026)

| Ukuran | Jumlah |
|---|---|
| Total kos unik | 208 |
| Dengan harga | 89 (87 bulanan, 2 tahunan) |
| Dengan nomor kontak publik | 81 |
| Dengan koordinat (marker peta) | 150 (149 level area + 1 level tempat) |
| Tanpa koordinat (hanya di daftar) | 58 |
| Dengan foto (hotlink sumber) | 6 |
| Dengan alamat jalan | 112 |

Per sumber: carialamat 98, Mamikos 91, penginapan.net 12, Instagram 5,
airpaz 1, kost1 1.

Per tipe: putri 142, putra 21, campur 12, tidak diketahui 33.

## Sumber & cara kumpul

Dibaca halaman publik **satu per satu lewat browser** (bukan scrape massal):
halaman pencarian Mamikos per kategori/area, direktori carialamat per
kecamatan, tabel penginapan.net, postingan Instagram, dan halaman detail
Mamikos untuk foto. File mentah + skrip ada di `scripts/collect/`:

- `raw-batch-01.json` … `raw-batch-11.json` — entri mentah per batch
  (batch 11 = 5 foto dari halaman detail Mamikos).
- `merge.py` — gabung + dedupe (nama ternormalisasi + alias, lalu
  phone+alamat) → `data/kos.json`. Skalar: batch belakangan menang kalau
  non-null. Fasilitas: union. Alamat: pilih yang lebih panjang. Hasil merge
  HARUS 0 WARN dan 208 kos.
- `geocode.py` — geocode `data/kos.json`: plus code sumber di-decode
  (matematika murni, tanpa API), lalu alamat jalan → Nominatim
  (OpenStreetMap, 1 request/detik, User-Agent `lokakos-dataset/1.0`).
  Hasil di luar bbox Banda Aceh (lat 5.40–5.70, lon 95.20–95.45) ditolak.
  Hasil 19 Nov 2026: 150/208 berkoordinat — 149 level `area` (fallback nama
  area; semua kos satu area berbagi titik centroid yang sama — itulah kenapa
  marker bisa bertumpuk), 1 level `place` (Cahaya kos putri, koordinat publik
  dari gites.fr + plus code terverifikasi), 0 level `street` (alamat jalan
  tidak resolve ke titik jalan di Nominatim), 58 gagal (tetap null, jujur).
  Plus code carialamat sebagian besar TIDAK resolve ke Banda Aceh (decode
  jatuh di laut barat Sumatra) — hanya yang terverifikasi in-bbox yang
  dipertahankan; sisanya dihapus dari dataset, bukan dipaksakan.

### Yang TIDAK dilakukan (batas keras)

- **Tanpa Google Maps** — ToS Maps melarang export/extract konten Maps
  untuk database listing pengganti.
- **Tanpa scrape massal** — tidak ada crawl agresif ke Mamikos/platform lain.
  Kalau satu sumber membatasi/memblokir, berhenti di sumber itu.
- **Tanpa Places API sebagai direktori permanen** — menyimpan hasil Places
  di `data/kos.json` statis melanggar aturan caching-nya.
- **Tanpa fabrikasi** — tidak ada harga, koordinat, atau ketersediaan karangan.
- **Tanpa nomor relay platform** — nomor relay Mamikos `0856-4140-5202`
  muncul di banyak listing dan TIDAK PERNAH dipakai sebagai kontak pemilik.
- **Tanpa download/re-host foto** — foto hanya hotlink URL sumber.

## Skema

Lihat `src/types/property.ts` + `src/lib/kosData.ts` (loader: mentah →
`Property[]` + `AREAS` + `DATASET_STATS`):

```ts
Property {
  id: string;            // 'k001' .. 'k208' (urut nama saat merge)
  name: string;
  description?: string;  // catatan harga dari sumber (mis. "(nego)")
  address: string;       // apa adanya dari sumber; bisa nama area saja
  area?: string | null;  // mis. 'Kopelma Darussalam'
  latitude: number | null;  // null = tidak diketahui (tidak di peta)
  longitude: number | null;
  priceMin: number | null;  // null = tidak tercantum di sumber
  priceMax?: number | null;
  pricePeriod: 'monthly' | 'yearly';  // yearly: Cempaka (4–7,5jt/thn),
                                      // SB House (10jt/thn, nego)
  genderType: 'male' | 'female' | 'mixed' | 'unknown';
  thumbnailUrl?: string; // hotlink foto sumber (hanya 6 kos)
  facilities?: Facility[];  // WiFi, AC, K. Mandi Dalam, Kasur,
                            // Kloset Duduk, Akses 24 Jam, ...
  roomsNote?: string | null; // catatan kamar/tipe dari sumber
  contactPhone?: string | null; // nomor publik dari listing sumber
  source: string;        // 'mamikos' | 'carialamat' | ...
  sourceUrl: string;     // URL listing sumber — wajib ada
  collectedAt: string;   // '2026-11-19'
  coordinateAccuracy?: 'place' | 'street' | 'area' | null;
  plusCode?: string | null;
  status: 'unknown';     // sumber tidak memberi info ketersediaan
  isPublished: boolean;
}
```

Status keseluruhan properti dihitung di `src/lib/property.ts`
(`getOverallStatus`): dari kamar-kamarnya kalau ada, kalau tidak dari field
`status` — dataset jujur: semua `'unknown'` (abu-abu "Status tidak
diketahui", bukan hijau "Tersedia" yang mengada-ada). Satu definisi dipakai
kartu, drawer, dan marker — tidak ada duplikasi logika.

## Filter

`src/lib/filter.ts` — `applyFilters(properties, filters, favorites)`:

| Filter | Aturan |
|---|---|
| Area | `area` persis sama dengan pilihan (dropdown dari `AREAS`) |
| Harga `< Rp 700rb` | harga BULANAN yang tercantum `< 700.000` |
| Harga `Rp 700rb – 1jt` | harga bulanan `700.000 ≤ priceMin ≤ 1.000.000` |
| Harga `> Rp 1jt` | harga bulanan `> 1.000.000` |
| Fasilitas | properti harus punya **semua** fasilitas yang dipilih |
| Tipe kos | `genderType` sama dengan yang dipilih |
| Favoritku | hanya id yang ada di `localStorage` |
| Pencarian | nama / alamat / area / deskripsi mengandung kata kunci (case-insensitive) |

**Filter harga hanya berlaku untuk harga bulanan yang tercantum.** Kos tanpa
harga atau harga tahunan tidak bisa diverifikasi masuk rentang — jadi tidak
tampil saat filter harga aktif. Harga tahunan TIDAK dibagi 12 jadi bulanan:
itu karangan.

Hasil filter dipakai daftar **dan** marker peta secara bersamaan. Daftar
memuat bertahap: 30 kartu dulu, tombol "Muat lagi" +30.

## Favorit

- Kunci localStorage: `lokakos:favorites:v1` (array id string, JSON).
- Tanpa akun, tanpa backend. Tersimpan per perangkat + per browser.
- `src/lib/favorites.ts` (`useFavorites`) — baca saat mount, tulis saat
  toggle, sinkron antar-tab lewat event `storage`.

## Statistik hero (/tentang)

Angka di landing dihitung dari data, bukan ditulis tangan:

- jumlah kos = `DATASET_STATS.total` (208)
- harga mulai = harga bulanan terendah (Rp500.000)
- kos dengan kontak publik = `DATASET_STATS.withPhone` (81)

Kalau data berubah, angka ikut berubah.

## Cara update dataset

1. Tambah batch baru `scripts/collect/raw-batch-NN.json` (format sama:
   `entries` + `updates`; nama harus cocok persis dengan nama di dataset
   untuk `updates`).
2. `python3 scripts/collect/merge.py` — harus 0 WARN; cek angka akhir.
   Merge **mempertahankan** hasil geocode yang sudah ada di `data/kos.json`
   (lat/lon/accuracy/plus_code) — jangan hapus file itu sebelum merge.
3. Kalau ada entri baru tanpa koordinat:
   `python3 scripts/collect/geocode.py` (butuh forwarder 127.0.0.1:18081
   untuk Nominatim; ~1–2 detik per request, sabar).
4. `npm run build && npm test` — e2e menghitung harapannya dari
   `data/kos.json`, jadi angka ikut berubah otomatis; perbarui angka di
   `docs/data.md` (bagian atas) + README kalau jumlah total berubah.
