'use client';

/**
 * src/components/layout/FilterPanel.tsx
 *
 * Panel filter — CONTROLLED. State tinggal di halaman (/), chip di sini
 * hanya memanggil onChange. Filter yang sama dipakai daftar + marker peta
 * (satu sumber kebenaran: src/lib/filter.ts). Sebelum restructure, chip
 * hanya mengubah state lokal dan tidak memfilter apa pun.
 *
 * Chip fasilitas mengikuti kosakata yang BENAR-BENAR ADA di dataset
 * (WiFi, AC, K. Mandi Dalam, Kasur, Kloset Duduk, Akses 24 Jam) — bukan
 * daftar khayalan. Area berupa dropdown dari AREAS (kosData).
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
  { label: 'Kasur', value: 'bed' },
  { label: 'Kloset Duduk', value: 'toilet' },
  { label: 'Akses 24 Jam', value: 'access24' },
] as const;

const TYPE_OPTIONS = [
  { label: 'Putra', value: 'male' },
  { label: 'Putri', value: 'female' },
  { label: 'Campur', value: 'mixed' },
] as const;

export interface FilterPanelProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  /** Daftar area dari dataset (urut terbanyak) — untuk dropdown area. */
  areas: string[];
}

export default function FilterPanel({ value, onChange, areas }: FilterPanelProps) {
  const toggleFacility = (v: string) => {
    const next = value.facilities.includes(v)
      ? value.facilities.filter((x) => x !== v)
      : [...value.facilities, v];
    onChange({ ...value, facilities: next });
  };

  return (
    <div className="filter-panel" role="search" aria-label="Filter properti">
      <div className="filter-group">
        <span className="filter-group__label" id="filter-area-label">
          Area
        </span>
        <select
          id="filter-area"
          className="filter-area-select"
          aria-labelledby="filter-area-label"
          value={value.area ?? ''}
          onChange={(e) =>
            onChange({ ...value, area: e.target.value === '' ? null : e.target.value })
          }
        >
          <option value="">Semua area</option>
          {areas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>

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
        <p className="filter-group__hint">
          Filter harga hanya berlaku untuk kos ber-harga bulanan yang tercantum.
        </p>
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
