# Deploy LokaKos

## Ringkas

- **Platform:** Cloudflare Pages (direct upload `out/` statis).
- **Nama proyek:** `lokakos` → https://lokakos.pages.dev
- **Build:** `npm ci && npm run build` (Next.js static export, `output: 'export'`).
- **Upload:** `cf_pages.py` (direct-upload API, pola repo P1 lain).

## Langkah deploy

```bash
npm ci
npm run build            # menghasilkan out/
python3 ~/workspace/github-actions/cf_pages.py deploy lokakos out/
```

Buat proyek baru (sekali saja, kalau belum ada):

```bash
python3 ~/workspace/github-actions/cf_pages.py create-project lokakos
```

Nama `lokakos` didapat bersih (tanpa sufiks, tanpa HTTP 409). Fallback yang
disiapkan tapi tidak terpakai: `loka-kos` → `cari-kos`.

## Kenapa bukan `wrangler pages deploy`

Pola P1 yang sudah terbukti di repo #19–#32: direct upload via API
(`cf_pages.py`) — tanpa wrangler, tanpa login interaktif. `out/` adalah hasil
`next build` dengan `output: 'export'`.

## Verifikasi live (wajib sebelum merge)

1. `curl` homepage → HTTP 200, berisi `Cari kos sambil lihat petanya.`
2. `curl` `/peta/` → HTTP 200, berisi `Filter properti`.
3. Buka di browser (atau headless): peta Leaflet ter-render, 8 marker karcis
   harga muncul, klik marker membuka drawer detail.
4. Filter harga `< Rp 700rb` → 3 kartu + 3 marker.
5. Deep-link `/peta?kos=prop-003` → drawer "Kos Campur Nusa Indah" terbuka.

Catatan: tile peta dimuat dari `tile.openstreetmap.org` saat runtime — kalau
jaringan pemverifikasi memblokir host itu, peta menampilkan fallback
informatif (daftar tetap jalan). Itu kondisi jaringan, bukan cacat deploy.

## About repo

Setelah live, pasang tautan di About repo (GitHub → About → Website):

```
PATCH /repos/dezzorigin/lokakos  { "homepage": "https://lokakos.pages.dev" }
```

Lalu verifikasi `homepage` terpasang lewat GET repo.
