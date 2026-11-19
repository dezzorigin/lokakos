/**
 * src/lib/map/config.ts
 * Konstanta konfigurasi peta LokaKos — Leaflet + OpenStreetMap.
 *
 * Keputusan restructure (#33): Mapbox dihapus total. Mapbox butuh token
 * dari environment variable dan tidak ada token di repo (juga tidak boleh
 * ada — token bukan untuk di-commit). Tanpa token, peta live blank.
 * Leaflet + tile standar OpenStreetMap (tile.openstreetmap.org) gratis
 * dan tanpa API key, jadi produk benar-benar jalan di Cloudflare Pages.
 * Atribusi OSM wajib tampil (lihat MapView).
 *
 * CATATAN: tile CARTO Positron (basemaps.cartocdn.com) DICOBA DULU dan
 * DITOLAK — servernya kini mengembalikan tile watermark "API KEY REQUIRED"
 * untuk semua request tanpa key. Jangan kembali ke CARTO tanpa key.
 */

/** Tile layer terang gaya "kertas peta" — cocok dengan palet DESIGN.md */
export const TILE_URL =
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Koordinat default: Universitas Syiah Kuala (Darussalam), Banda Aceh.
 * Titik tengah peta saat pertama kali dibuka.
 */
export const DEFAULT_CENTER: [number, number] = [5.569, 95.3685]; // [lat, lng]

/** Zoom level default — cukup untuk melihat area kampus & sekitarnya */
export const DEFAULT_ZOOM = 15;

/** Zoom minimum & maksimum yang diizinkan */
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 19;

/** Batas wilayah (bounds) untuk Banda Aceh — mencegah pengguna keluar terlalu jauh */
export const BANDA_ACEH_BOUNDS: [[number, number], [number, number]] = [
  [5.48, 95.28], // Southwest [lat, lng]
  [5.65, 95.45], // Northeast [lat, lng]
];
