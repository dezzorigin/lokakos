'use client';

/**
 * src/components/layout/FilterPanel.tsx
 *
 * Panel filter — CONTROLLED. State tinggal di halaman (/peta), chip di sini
 * hanya memanggil onChange. Filter yang sama dipakai daftar + marker peta
 * (satu sumber kebenaran: src/lib/filter.ts). Sebelum restructure, chip
 * hanya mengubah state lokal dan tidak memfilter apa pun.
 */

import { EMPTY_FILTERS, hasActiveFilters, type FilterState } from '@/lib/filter';

const PRICE_OPTIONS = [
  { label: '< Rp 700rb', value: 'under_700k' },
  { label: 'Rp 700rb – 1jt', value: '700k_1m' },
  { label: '> Rp 1jt', value: 'over_1m' },
] as const;

const FACILITY_OPTIONS = [
  { label: 'WiFi', value: 'wifi' },
  { label: 'AC', value: 'ac' },
  { label: 'KM Dalam', value: 'private_bath' },
  { label: 'Parkir', value: 'parking' },
  { label: 'Laundry', value: 'laundry' },
  { label: 'Dapur', value: 'kitchen' },
] as const;

const TYPE_OPTIONS = [
  { label: 'Putra', value: 'male' },
  { label: 'Putri', value: 'female' },
  { label: 'Campur', value: 'mixed' },
] as const;

export interface FilterPanelProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
}

export default function FilterPanel({ value, onChange }: FilterPanelProps) {
  const toggleFacility = (v: string) => {
    const next = value.facilities.includes(v)
      ? value.facilities.filter((x) => x !== v)
      : [...value.facilities, v];
    onChange({ ...value, facilities: next });
  };

  return (
    <div className="filter-panel" role="search" aria-label="Filter properti">
      <div className="filter-group">
        <span className="filter-group__label" id="filter-harga-label">
          Harga
        </span>
        <div className="filter-group__chips" role="group" aria-labelledby="filter-harga-label">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`filter-price-${opt.value}`}
              type="button"
              className={`filter-chip ${value.price === opt.value ? 'filter-chip--active' : ''}`}
              onClick={() =>
                onChange({ ...value, price: value.price === opt.value ? null : opt.value })
              }
              aria-pressed={value.price === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label" id="filter-fasilitas-label">
          Fasilitas
        </span>
        <div className="filter-group__chips" role="group" aria-labelledby="filter-fasilitas-label">
          {FACILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`filter-facility-${opt.value}`}
              type="button"
              className={`filter-chip ${value.facilities.includes(opt.value) ? 'filter-chip--active' : ''}`}
              onClick={() => toggleFacility(opt.value)}
              aria-pressed={value.facilities.includes(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label" id="filter-tipe-label">
          Tipe Kos
        </span>
        <div className="filter-group__chips" role="group" aria-labelledby="filter-tipe-label">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`filter-type-${opt.value}`}
              type="button"
              className={`filter-chip ${value.type === opt.value ? 'filter-chip--active' : ''}`}
              onClick={() => onChange({ ...value, type: value.type === opt.value ? null : opt.value })}
              aria-pressed={value.type === opt.value}
            >
              {opt.label}
            </button>
          ))}
          <button
            id="filter-favorites"
            type="button"
            className={`filter-chip ${value.favoritesOnly ? 'filter-chip--active' : ''}`}
            onClick={() => onChange({ ...value, favoritesOnly: !value.favoritesOnly })}
            aria-pressed={value.favoritesOnly}
          >
            ♥ Favoritku
          </button>
        </div>
      </div>

      {hasActiveFilters(value) && (
        <button
          id="filter-reset-btn"
          type="button"
          className="filter-reset-btn"
          onClick={() => onChange(EMPTY_FILTERS)}
          aria-label="Reset semua filter"
        >
          ✕ Reset Filter
        </button>
      )}
    </div>
  );
}
