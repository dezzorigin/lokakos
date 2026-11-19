/**
 * src/lib/filter.ts
 * Filter properti — SATU sumber kebenaran untuk FilterPanel, PropertyList,
 * dan marker peta. Sebelum restructure, chip filter di FilterPanel hanya
 * mengubah state lokal dan tidak pernah memfilter apa pun (fitur mati).
 */

import type { Property } from '@/types/property';

export type PriceFilter = 'under_700k' | '700k_1m' | 'over_1m' | null;
export type GenderFilter = 'male' | 'female' | 'mixed' | null;

export interface FilterState {
  price: PriceFilter;
  /** Nilai fasilitas mengikuti `value` di FilterPanel (wifi, ac, ...). */
  facilities: string[];
  type: GenderFilter;
  /** Area persis dari sumber (lihat AREAS di kosData); null = semua area. */
  area: string | null;
  favoritesOnly: boolean;
  query: string;
}

export const EMPTY_FILTERS: FilterState = {
  price: null,
  facilities: [],
  type: null,
  area: null,
  favoritesOnly: false,
  query: '',
};

/** Nama fasilitas di data -> nilai chip filter (cocok case-insensitive;
 *  dataset memakai singkatan 'K. Mandi Dalam', bukan 'Kamar Mandi Dalam'). */
const FACILITY_VALUE: Record<string, string> = {
  wifi: 'wifi',
  ac: 'ac',
  'k. mandi dalam': 'private_bath',
  'kamar mandi dalam': 'private_bath',
  kasur: 'bed',
  'kloset duduk': 'toilet',
  'akses 24 jam': 'access24',
  'parkir motor': 'parking',
  laundry: 'laundry',
  'dapur bersama': 'kitchen',
};

function facilityValue(name: string): string {
  return FACILITY_VALUE[name.trim().toLowerCase()] ?? name.trim().toLowerCase();
}

export function hasActiveFilters(f: FilterState): boolean {
  return (
    f.price !== null ||
    f.facilities.length > 0 ||
    f.type !== null ||
    f.area !== null ||
    f.favoritesOnly ||
    f.query.trim() !== ''
  );
}

export function applyFilters(
  properties: Property[],
  f: FilterState,
  favoriteIds: Set<string>,
): Property[] {
  const q = f.query.trim().toLowerCase();
  return properties.filter((p) => {
    if (f.favoritesOnly && !favoriteIds.has(p.id)) return false;
    if (f.type && p.genderType !== f.type) return false;
    if (f.area && p.area !== f.area) return false;
    // Filter harga HANYA untuk harga BULANAN yang tercantum. Kos tanpa harga
    // atau harga tahunan tidak bisa diverifikasi masuk rentang — jadi tidak
    // tampil saat filter harga aktif (jujur, bukan ditebak ke bulanan).
    if (f.price !== null) {
      if (p.priceMin == null || p.pricePeriod !== 'monthly') return false;
      if (f.price === 'under_700k' && p.priceMin >= 700_000) return false;
      if (f.price === '700k_1m' && (p.priceMin < 700_000 || p.priceMin > 1_000_000))
        return false;
      if (f.price === 'over_1m' && p.priceMin <= 1_000_000) return false;
    }
    if (f.facilities.length > 0) {
      const mine = new Set((p.facilities ?? []).map((fac) => facilityValue(fac.name)));
      if (!f.facilities.every((v) => mine.has(v))) return false;
    }
    if (q) {
      const hay = `${p.name} ${p.address} ${p.area ?? ''} ${p.description ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
