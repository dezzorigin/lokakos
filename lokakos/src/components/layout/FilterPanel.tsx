'use client';

/**
 * src/components/layout/FilterPanel.tsx
 *
 * Panel filter properti — tampilan statis untuk Phase 1.
 * Menampilkan chip filter: Harga, Fasilitas, dan Tipe Kos.
 *
 * Di Phase 5, chip ini akan terhubung ke filterStore (Zustand)
 * dan memicu query ulang ke Supabase.
 *
 * ATURAN WAJIB (PLANNER.md §6): harus 'use client' karena menggunakan state.
 */

import { useState } from 'react';

// ─── Filter Config ────────────────────────────────────────────────────────────
const PRICE_OPTIONS = [
  { label: '< Rp 700rb', value: 'under_700k' },
  { label: 'Rp 700rb – 1jt', value: '700k_1m' },
  { label: '> Rp 1jt', value: 'over_1m' },
];

const FACILITY_OPTIONS = [
  { label: 'WiFi', value: 'wifi' },
  { label: 'AC', value: 'ac' },
  { label: 'KM Dalam', value: 'private_bath' },
  { label: 'Parkir', value: 'parking' },
  { label: 'Laundry', value: 'laundry' },
  { label: 'Dapur', value: 'kitchen' },
];

const TYPE_OPTIONS = [
  { label: '♂ Putra', value: 'male' },
  { label: '♀ Putri', value: 'female' },
  { label: '⚥ Campur', value: 'mixed' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function FilterPanel() {
  // Phase 1: state lokal (belum terhubung ke filterStore)
  const [activePrice, setActivePrice] = useState<string | null>(null);
  const [activeFacilities, setActiveFacilities] = useState<Set<string>>(new Set());
  const [activeType, setActiveType] = useState<string | null>(null);

  const toggleFacility = (value: string) => {
    setActiveFacilities((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  const hasActiveFilters =
    activePrice !== null || activeFacilities.size > 0 || activeType !== null;

  const resetFilters = () => {
    setActivePrice(null);
    setActiveFacilities(new Set());
    setActiveType(null);
  };

  return (
    <div className="filter-panel" role="search" aria-label="Filter properti">
      {/* ── Harga ── */}
      <div className="filter-group">
        <span className="filter-group__label">Harga</span>
        <div className="filter-group__chips">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`filter-price-${opt.value}`}
              className={`filter-chip ${activePrice === opt.value ? 'filter-chip--active' : ''}`}
              onClick={() => setActivePrice(activePrice === opt.value ? null : opt.value)}
              aria-pressed={activePrice === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Fasilitas ── */}
      <div className="filter-group">
        <span className="filter-group__label">Fasilitas</span>
        <div className="filter-group__chips">
          {FACILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`filter-facility-${opt.value}`}
              className={`filter-chip ${activeFacilities.has(opt.value) ? 'filter-chip--active' : ''}`}
              onClick={() => toggleFacility(opt.value)}
              aria-pressed={activeFacilities.has(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tipe Kos ── */}
      <div className="filter-group">
        <span className="filter-group__label">Tipe Kos</span>
        <div className="filter-group__chips">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              id={`filter-type-${opt.value}`}
              className={`filter-chip ${activeType === opt.value ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveType(activeType === opt.value ? null : opt.value)}
              aria-pressed={activeType === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Reset ── */}
      {hasActiveFilters && (
        <button
          id="filter-reset-btn"
          className="filter-reset-btn"
          onClick={resetFilters}
          aria-label="Reset semua filter"
        >
          ✕ Reset Filter
        </button>
      )}

      <style>{`
        /* ── Filter Panel ── */
        .filter-panel {
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── Filter Group ── */
        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-group__label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          white-space: nowrap;
          min-width: 48px;
          flex-shrink: 0;
        }

        .filter-group__chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        /* ── Filter Chip ── */
        .filter-chip {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          color: #475569;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          cursor: pointer;
          transition: all 150ms ease;
          font-family: inherit;
          white-space: nowrap;
          line-height: 1.5;
        }

        .filter-chip:hover {
          border-color: #6366f1;
          color: #6366f1;
          background: #eef2ff;
        }

        .filter-chip--active {
          background: #6366f1;
          border-color: #6366f1;
          color: #ffffff;
          font-weight: 600;
        }

        .filter-chip--active:hover {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #ffffff;
        }

        /* ── Reset Button ── */
        .filter-reset-btn {
          align-self: flex-start;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          color: #f43f5e;
          background: #fff1f2;
          border: 1.5px solid #fecdd3;
          cursor: pointer;
          transition: all 150ms ease;
          font-family: inherit;
          margin-top: -2px;
        }

        .filter-reset-btn:hover {
          background: #ffe4e6;
          border-color: #f43f5e;
        }
      `}</style>
    </div>
  );
}
