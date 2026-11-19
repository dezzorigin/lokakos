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
  available: { label: 'Tersedia', color: '#2E7D5B', bg: '#E3F0E8' },
  almost_full: { label: 'Hampir Penuh', color: '#8A6D1B', bg: '#FBF3D9' },
  full: { label: 'Penuh', color: '#C0563B', bg: '#F9E8E2' },
};

export const GENDER_LABELS: Record<string, { label: string; mark: string }> = {
  male: { label: 'Putra', mark: '♂' },
  female: { label: 'Putri', mark: '♀' },
  mixed: { label: 'Campur', mark: '⚥' },
};

/** Status keseluruhan properti dari kamar-kamarnya. */
export function getOverallStatus(property: Property): RoomStatus {
  if (!property.rooms || property.rooms.length === 0) return 'available';
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
