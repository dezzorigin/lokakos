'use client';

/**
 * src/components/property/PropertyList.tsx
 *
 * Panel list properti — sisi kiri halaman utama.
 * Berisi header dengan jumlah hasil, scrollable list PropertyCard,
 * dan skeleton loader saat isLoading=true.
 *
 * ATURAN WAJIB (PLANNER.md §6): harus 'use client'.
 */

import type { Property } from '@/types/property';
import PropertyCard, { PropertyCardSkeleton } from './PropertyCard';

// ─── Props ────────────────────────────────────────────────────────────────────
export interface PropertyListProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  isLoading?: boolean;
  onPropertySelect?: (property: Property) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PropertyList({
  properties,
  selectedPropertyId,
  isLoading = false,
  onPropertySelect,
}: PropertyListProps) {
  return (
    <>
      <aside
        className="property-list"
        role="complementary"
        aria-label="Daftar properti kos"
      >
        {/* Header */}
        <div className="property-list__header">
          <h2 className="property-list__title">
            {isLoading ? (
              <span className="property-list__title-skeleton" />
            ) : (
              <>
                <span className="property-list__count">{properties.length}</span>
                {' '}Kos Ditemukan
              </>
            )}
          </h2>
          <p className="property-list__subtitle">Area Darussalam, Banda Aceh</p>
        </div>

        {/* Divider */}
        <div className="property-list__divider" />

        {/* List */}
        <div className="property-list__scroll">
          {isLoading ? (
            // Skeleton: tampilkan 4 placeholder
            <>
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </>
          ) : properties.length === 0 ? (
            // Empty state
            <div className="property-list__empty">
              <span className="property-list__empty-icon">🔍</span>
              <p className="property-list__empty-title">Tidak ada properti</p>
              <p className="property-list__empty-sub">
                Coba geser peta atau ubah filter pencarian.
              </p>
            </div>
          ) : (
            // Render cards
            properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isSelected={selectedPropertyId === property.id}
                onClick={onPropertySelect}
              />
            ))
          )}
        </div>

        {/* Footer attribution */}
        <div className="property-list__footer">
          <span className="property-list__footer-text">© LokaKos 2026</span>
        </div>
      </aside>

      <style>{`
        /* ── Property List Panel ── */
        .property-list {
          width: 320px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          overflow: hidden;
          z-index: 10;
        }

        /* ── Header ── */
        .property-list__header {
          padding: 16px 16px 12px;
          flex-shrink: 0;
          background: #ffffff;
        }

        .property-list__title {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 4px;
          min-height: 22px;
        }

        .property-list__title-skeleton {
          display: inline-block;
          width: 130px;
          height: 16px;
          border-radius: 4px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 800px 100%;
          animation: skeleton-shimmer 1.4s ease-in-out infinite;
        }

        .property-list__count {
          color: #6366f1;
          font-weight: 800;
        }

        .property-list__subtitle {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .property-list__divider {
          height: 1px;
          background: #e2e8f0;
          flex-shrink: 0;
        }

        /* ── Scrollable List ── */
        .property-list__scroll {
          flex: 1;
          overflow-y: auto;
          padding: 12px 12px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .property-list__scroll::-webkit-scrollbar {
          width: 4px;
        }

        .property-list__scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        /* ── Empty State ── */
        .property-list__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          gap: 8px;
        }

        .property-list__empty-icon {
          font-size: 36px;
          opacity: 0.5;
        }

        .property-list__empty-title {
          font-size: 14px;
          font-weight: 700;
          color: #475569;
        }

        .property-list__empty-sub {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.6;
        }

        /* ── Footer ── */
        .property-list__footer {
          padding: 10px 16px;
          border-top: 1px solid #e2e8f0;
          flex-shrink: 0;
          background: #ffffff;
        }

        .property-list__footer-text {
          font-size: 10px;
          color: #cbd5e1;
          font-weight: 500;
        }

        /* ── Responsive: sembunyikan di mobile (peta fullscreen) ── */
        @media (max-width: 768px) {
          .property-list {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
