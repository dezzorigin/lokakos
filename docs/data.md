# Data LokaKos

## Status: data contoh

Semua kos di aplikasi ini adalah **data contoh untuk demo** — nama, alamat,
harga, dan ketersediaan kamar bukan listing sungguhan. UI melabelinya di tiga
tempat: badge di header daftar (`Data contoh — bukan listing sungguhan`),
catatan di drawer detail, dan catatan di footer landing. Jangan pernah
menampilkan data ini sebagai listing asli.

## Skema

Lihat `src/types/property.ts`:

```ts
Property {
  id: string;            // 'prop-001' .. 'prop-008'
  name: string;
  description?: string;
  address: string;       // Jl. ... , Darussalam, Banda Aceh
  latitude: number;      // ~5.566 – 5.574
  longitude: number;     // ~95.364 – 95.374
  priceMin: number;      // IDR / bulan
  priceMax?: number;
  genderType: 'male' | 'female' | 'mixed';
  facilities?: Facility[];  // WiFi, AC, Kamar Mandi Dalam, Parkir Motor,
                            // Laundry, Dapur Bersama, Ruang Belajar
  rooms?: Room[];        // tiap kamar: harga, totalUnits, availableUnits, status
  isPublished: boolean;
}
Room { status: 'available' | 'almost_full' | 'full' }
```

Status keseluruhan properti dihitung di `src/lib/property.ts`
(`getOverallStatus`): `full` kalau semua kamar penuh, `almost_full` kalau ada
satu kamar hampir penuh, selain itu `available`. Satu definisi dipakai kartu,
drawer, dan marker — tidak ada duplikasi logika.

## 8 kos contoh

| ID | Nama | Tipe | Harga mulai | Kamar tersedia |
|---|---|---|---|---|
| prop-001 | Kos Putri Darussalam Indah | Putri | Rp800.000 | 4 dari 12 |
| prop-002 | Kos Putra Grand Kopelma | Putra | Rp600.000 | 4 dari 16 |
| prop-003 | Kos Campur Nusa Indah | Campur | Rp700.000 | 7 dari 18 |
| prop-004 | Kos Putri Al-Ikhlas | Putri | Rp650.000 | 2 dari 8 |
| prop-005 | Kos Putra Darussalam Residence | Putra | Rp750.000 | 5 dari 10 |
| prop-006 | Kos Putri Meurah Silu | Putri | Rp900.000 | 6 dari 14 |
| prop-007 | Kos Campur Lamgugob Homey | Campur | Rp550.000 | 6 dari 13 |
| prop-008 | Kos Putri Krueng Raya | Putri | Rp1.000.000 | 4 dari 6 |

prop-001–004 adalah data asli repo sebelum restructure (tidak diubah isinya);
prop-005–008 ditambahkan saat rebuild supaya filter dan peta punya cukup isi
untuk diuji (mis. filter `< Rp 700rb` → 3 hasil, bukan 1).

Semua koordinat di area Darussalam / Kopelma, Banda Aceh (sekitar Unsyiah),
dan semua harga dalam rupiah per bulan.

## Filter

`src/lib/filter.ts` — `applyFilters(properties, filters, favorites)`:

| Filter | Aturan |
|---|---|
| Harga `< Rp 700rb` | `priceMin < 700.000` |
| Harga `Rp 700rb – 1jt` | `700.000 ≤ priceMin ≤ 1.000.000` |
| Harga `> Rp 1jt` | `priceMin > 1.000.000` |
| Fasilitas | properti harus punya **semua** fasilitas yang dipilih |
| Tipe kos | `genderType` sama dengan yang dipilih |
| Favoritku | hanya id yang ada di `localStorage` |
| Pencarian | nama / alamat / deskripsi mengandung kata kunci (case-insensitive) |

Hasil filter dipakai daftar **dan** marker peta secara bersamaan.

## Favorit

- Kunci localStorage: `lokakos:favorites:v1` (array id string, JSON).
- Tanpa akun, tanpa backend. Tersimpan per perangkat + per browser.
- `src/lib/favorites.ts` (`useFavorites`) — baca saat mount, tulis saat
  toggle, sinkron antar-tab lewat event `storage`.

## Statistik hero

Angka di landing dihitung dari data, bukan ditulis tangan:

- jumlah kos = `MOCK_PROPERTIES.length` (8)
- harga mulai = `min(priceMin)` (Rp550.000)
- kamar tersedia = jumlah `availableUnits` semua kamar (38)

Kalau data berubah, angka ikut berubah.
