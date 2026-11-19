# DESIGN.md — Kontrak Arah Desain LokaKos

> Ditulis SEBELUM coding (standar anti-slop P1 §4). Referensi dipilih dulu,
> palet dikunci dulu, baru bangun.

## 1. Produk & pengguna

LokaKos — marketplace kos-kosan **map-first** untuk Banda Aceh (sekitar
Unsyiah: Darussalam / Kopelma, Lamnyong, Peunayong, Ulee Kareng, dan
sekitarnya). Pengguna: mahasiswa baru & perantau yang cari kos dari jauh —
mereka butuh **lihat lokasi dulu, harga dulu, status kamar dulu**, bukan baca
brosur. Peta adalah produknya; daftar kos adalah pendampingnya.

Sejak PR #2, beranda (`/`) LANGSUNG membuka explorer penuh: daftar 208 kos
nyata + peta. Landing (hero editorial + peta hidup) pindah ke `/tentang`.
Rute lama `/peta` redirect ke `/`.

## 2. Referensi (2–3 kandidat, 1 pemenang)

| # | Referensi | URL | Kenapa cocok |
|---|---|---|---|
| 1 — **PEMENANG** | **Marren & Co** (template Framer, real estate boutique) | https://www.framer.com/marketplace/templates/marren-co/ | Editorial ink-and-paper, layout **split peta + daftar** (Grid / Map / Split view), filter harga + status + teks. Struktur inilah yang di-clone: hero editorial, daftar berdampingan peta, kartu dossier. |
| 2 | **Garelli Estates** (template Framer, estate agency) | https://www.framer.com/marketplace/templates/garelli-estates/ | Peta live di halaman utama **berbasis OpenStreetMap tanpa API key** — membenarkan keputusan teknis LokaKos pindah dari Mapbox (butuh token) ke Leaflet + OSM. |
| 3 | **Bird** (aplikasi sewa flat, Red Dot Award) | https://www.red-dot.org/project/bird-76996 | Map-first ekstrem: hanya 3 elemen — peta, galeri, apartemen. Pengingat agar LokaKos tidak menumpuk chrome di atas peta. |

**Yang di-clone plek-ketiplek dari Marren & Co:** struktur split (daftar kiri,
peta kanan), hero editorial serif, kartu listing sebagai "dossier" (nama besar,
alamat kecil, harga tabular), filter sebagai chip baris. **Yang diubah:**
isinya kos Banda Aceh (bukan rumah mewah pesisir), palet hijau-tinta + kunyit
(bukan ink-hitam netral), marker harga berbentuk karcis (bukan pin bulat),
bahasa Indonesia, data contoh berlabel jujur.

## 3. Palet (6 warna bernama — tiap warna punya tugas)

| Nama | Hex | Peran |
|---|---|---|
| Kertas Peta | `#FAF6EE` | Background utama — kertas peta tua, bukan putih klinik |
| Tinta Darussalam | `#1E3A34` | Teks utama, navbar, marker terpilih — hijau-tinta hutan |
| Daun Kopelma | `#2E7D5B` | CTA utama + status "Tersedia" |
| Kunyit | `#E9B44C` | Aksen: marker harga (karcis), sorot, hover aktif — varian teks `#7A5E10` untuk teks kecil (AA 5.67; `#C98F1F` hanya 2.62, dekorasi saja) |
| Bata | `#C0563B` | **Hanya semantik status** "Penuh" + bahaya — bukan warna tema; varian teks `#9A3B20` (AA 5.85) |
| Abu Jalan | `#6E7268` | Teks sekunder, label, garis halus |

Catatan anti-klise: Bata bukan pasangan tema Kertas (krim + terracotta sebagai
pasangan tema = default orde-kedua yang dilarang). Identitas tema ini adalah
**hijau-tinta + kunyit di atas kertas**; Bata muncul hanya sebagai arti status,
sama seperti Daun untuk "Tersedia".

## 4. Tipografi (maks 2 keluarga)

- **Display: Fraunces** (serif editorial, optical-size) — headline, nama kos,
  angka harga besar. Kontras tinggi, rasa "papan pengumuman" bukan "dashboard SaaS".
- **Body: Public Sans** — teks UI, alamat, label, tombol.
- Angka harga pakai `font-variant-numeric: tabular-nums` agar kolom harga sejajar.
- Body ≤ 75ch. Satu ukuran headline hero, tidak ada kata yang di-italic /
  diwarnai / digradient di tengah headline.

## 5. Layout (satu kalimat) + detail khas

**Satu kalimat:** "Di `/`, daftar kos menempel di kiri seperti papan
pengumuman di atas peta OSM; di `/tentang`, hero editorial di kiri, peta
hidup di kanan."

**Detail khas (signature):** marker harga berbentuk **karcis kos** — pil
kuning kunyit bertepi putus-putus dengan satu lubang perforasi — dan kartu kos
bertepi robek (garis putus-putus di sisi kiri, seperti sobekan papan pengumuman).
Sekali lihat thumbnail, ketahuan ini produk peta kos, bukan SaaS generik.

**Geometri:** radius kartu 10px (bukan 16px membulat di mana-mana), pil 999px
hanya untuk chip/marker, bayangan tipis satu tingkat (`0 1px 2px` + `0 8px 24px`
untuk drawer), grid 8pt, padding kartu ≥ 16px.

## 6. Beda dari repo sebelumnya (#32 synalum-ai-mentor) — 5/5 sumbu

| Sumbu | #32 synalum-ai-mentor | #33 lokakos |
|---|---|---|
| Palet | Papan Putih / Tinta / Merah Pena / Kuning Sorot / Hijau Papan / Abu Garis | Kertas Peta / Tinta Darussalam / Daun Kopelma / Kunyit / Bata / Abu Jalan |
| Tipografi | Archivo + Instrument Sans + JetBrains Mono | Fraunces + Public Sans |
| Layout | Dokumen statis satu kolom | Split hero + peta hidup; app `/peta` panel kiri + peta |
| Radius/spacing | Kartu dokumentasi rapat | Kartu 10px + pil karcis + tepi robek |
| Detail khas | Anotasi pena merah + "Catatan mentor" | Karcis harga kunyit + tepi robek papan pengumuman |

## 7. Larangan P0 — checklist sebelum merge

- [ ] Tanpa gradient ungu/biru, tanpa headline gradient (`bg-clip-text`)
- [ ] Tanpa Inter / Roboto / system font untuk semuanya (Fraunces + Public Sans)
- [ ] Tanpa hero tengah + 3 kartu identik (hero asimetris kiri-kanan; "cara kerja" berupa stepper bernomor, bukan 3 kartu)
- [ ] Tanpa emoji mentah sebagai ikon fungsi (SVG 1.5–2px; ♂/♀/⚥ hanya sebagai penanda teks tipe kos, bukan ikon fungsi)
- [ ] Tanpa statistik vanity palsu — semua angka dihitung dari `KOS_PROPERTIES`
      (208 kos, harga min bulanan, jumlah kos bertelepon) dan berlabel sumber +
      tanggal ambil ("data listing publik, diperbarui 2026-11-19")
- [ ] Tanpa tema Tailwind mentah, tanpa `rounded-2xl shadow-lg` di semua permukaan
- [ ] Tanpa footer 4 kolom default (footer satu baris + satu baris link)
- [ ] Tanpa copy generik ("Elevate your workflow" dkk) — copy Bahasa Indonesia spesifik kos
- [ ] Tanpa tombol/link mati: Masuk/Daftar dihapus (tidak ada auth); CTA yang ada = Buka Daftar Kos,
      Simpan (favorit, localStorage), Bagikan (salin tautan `?kos=`), Hubungi (tel:, hanya muncul
      kalau sumber mencantumkan nomor publik — nomor relay platform tidak dipakai)
- [ ] Mobile 390px: tanpa overflow horizontal, target sentuh ≥ 44px, panel kiri jadi sheet bawah
- [ ] Kontras teks lolos AA (dihitung dengan script, bukan kira-kira — semua
      pasangan teks/latar ≥ 4.5:1; warna status memakai varian teks gelap,
      bukan warna tema mentah)
