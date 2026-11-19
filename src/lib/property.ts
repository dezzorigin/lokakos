/**
 * src/lib/property.ts
 * Logika domain properti yang dipakai bersama Card, Detail, dan MapView.
 * Dipusatkan di sini supaya status "Tersedia / Hampir Penuh / Penuh" punya
 * satu definisi di seluruh aplikasi (sebelumnya terduplikasi per komponen).
 */

import type { Property, RoomStatus } from '@/types/property';

export const STATUS_CONFIG: Record<
  RoomStatus,
  { label: string; color: string; bg: string }
> = {
  // Warna TEKS digelapkan dari warna tema supaya kontras lolos WCAG AA
  // (dihitung: Tersedia 6.23, Hampir Penuh 5.51, Penuh 5.85 di atas bg-nya).
  // Titik/dot marker memakai warna yang sama — konsisten di seluruh UI.
  available: { label: 'Tersedia', color: '#236147', bg: '#E3F0E8' },
  almost_full: { label: 'Hampir Penuh', color: '#7A5E10', bg: '#FBF3D9' },
  full: { label: 'Penuh', color: '#9A3B20', bg: '#F9E8E2' },
  // Dataset jujur: sumber listing tidak memberi info ketersediaan yang bisa
  // diverifikasi, jadi semua kos nyata berstatus 'unknown' — abu-abu netral,
  // bukan hijau 'Tersedia' yang mengada-ada.
  unknown: { label: 'Status tidak diketahui', color: '#55584F', bg: '#EFEDE6' },
};

export const GENDER_LABELS: Record<string, { label: string; mark: string }> = {
  male: { label: 'Putra', mark: '♂' },
  female: { label: 'Putri', mark: '♀' },
  mixed: { label: 'Campur', mark: '⚥' },
  unknown: { label: 'Tipe tidak tercatat', mark: '?' },
};

/** Label akurasi koordinat untuk drawer detail. */
export const ACCURACY_LABELS: Record<string, string> = {
  place: 'Lokasi dari kode lokasi sumber (plus code)',
  street: 'Lokasi perkiraan dari alamat jalan',
  area: 'Lokasi perkiraan area (bukan titik persis)',
};

/** Status keseluruhan properti: dari kamar-kamarnya kalau ada, kalau tidak
 *  dari field status (dataset jujur: 'unknown' — sumber tidak memberi info
 *  ketersediaan). */
export function getOverallStatus(property: Property): RoomStatus {
  if (!property.rooms || property.rooms.length === 0) return property.status;
  const allFull = property.rooms.every((r) => r.status === 'full');
  const anyAlmostFull = property.rooms.some((r) => r.status === 'almost_full');
  if (allFull) return 'full';
  if (anyAlmostFull) return 'almost_full';
  return 'available';
}

/** Jumlah kamar yang masih tersedia di properti ini. */
export function availableUnits(property: Property): number {
  return (property.rooms ?? []).reduce((n, r) => n + r.availableUnits, 0);
}

/** Jumlah seluruh kamar di properti ini. */
export function totalUnits(property: Property): number {
  return (property.rooms ?? []).reduce((n, r) => n + r.totalUnits, 0);
}
