/**
 * src/lib/mapbox/config.ts
 * Konstanta konfigurasi Mapbox untuk LokaKos.
 * Semua nilai terpusat di sini agar mudah diubah.
 */

/** Token Mapbox dari environment variable (wajib ada di .env.local) */
export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

/** Style peta default — streets-v12 sesuai design language LokaKos (Light Mode) */
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';

/**
 * Koordinat default: Universitas Syiah Kuala (Darussalam), Banda Aceh.
 * Ini adalah titik tengah peta saat pertama kali dibuka.
 */
export const DEFAULT_CENTER: [number, number] = [95.3685, 5.5690]; // [longitude, latitude]

/** Zoom level default — cukup untuk melihat area kampus & sekitarnya */
export const DEFAULT_ZOOM = 15;

/** Zoom minimum & maksimum yang diizinkan */
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 20;

/** Batas wilayah (bounds) untuk Banda Aceh — mencegah pengguna keluar terlalu jauh */
export const BANDA_ACEH_BOUNDS: [[number, number], [number, number]] = [
  [95.2800, 5.4800], // Southwest corner [lng, lat]
  [95.4500, 5.6500], // Northeast corner [lng, lat]
];
