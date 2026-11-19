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
  favoritesOnly: boolean;
  query: string;
}

export const EMPTY_FILTERS: FilterState = {
  price: null,
  facilities: [],
  type: null,
  favoritesOnly: false,
  query: '',
};

/** Nama fasilitas di data -> nilai chip filter. */
const FACILITY_VALUE: Record<string, string> = {
  WiFi: 'wifi',
  AC: 'ac',
  'Kamar Mandi Dalam': 'private_bath',
  'Parkir Motor': 'parking',
  Laundry: 'laundry',
  'Dapur Bersama': 'kitchen',
};

export function hasActiveFilters(f: FilterState): boolean {
  return (
    f.price !== null ||
    f.facilities.length > 0 ||
    f.type !== null ||
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
    if (f.price === 'under_700k' && p.priceMin >= 700_000) return false;
    if (f.price === '700k_1m' && (p.priceMin < 700_000 || p.priceMin > 1_000_000))
      return false;
    if (f.price === 'over_1m' && p.priceMin <= 1_000_000) return false;
    if (f.facilities.length > 0) {
      const mine = new Set(
        (p.facilities ?? []).map((fac) => FACILITY_VALUE[fac.name] ?? fac.name),
      );
      if (!f.facilities.every((v) => mine.has(v))) return false;
    }
    if (q) {
      const hay = `${p.name} ${p.address} ${p.description ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
