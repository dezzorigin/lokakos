'use client';

/**
 * src/components/property/PropertyCard.tsx
 *
 * Card properti untuk ditampilkan di panel list kiri.
 * Fitur:
 *  - Skeleton loader saat data belum tersedia (prop: isLoading)
 *  - Badge status kamar (tersedia / hampir penuh / penuh)
 *  - Badge gender (putra / putri / campur)
 *  - Chip fasilitas (max 3, sisanya "+N")
 *  - Harga mulai dari
 *  - Animasi hover premium
 */

import type { Property, RoomStatus } from '@/types/property';
import { formatPrice } from '@/lib/mockData';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<RoomStatus, { label: string; color: string; bg: string }> = {
  available: { label: 'Tersedia', color: '#059669', bg: '#d1fae5' },
  almost_full: { label: 'Hampir Penuh', color: '#b45309', bg: '#fef3c7' },
  full: { label: 'Penuh', color: '#be123c', bg: '#ffe4e6' },
};

const GENDER_LABELS: Record<string, { label: string; emoji: string }> = {
  male: { label: 'Putra', emoji: '♂' },
  female: { label: 'Putri', emoji: '♀' },
  mixed: { label: 'Campur', emoji: '⚥' },
};

function getOverallStatus(property: Property): RoomStatus {
  if (!property.rooms?.length) return 'available';
  const allFull = property.rooms.every((r) => r.status === 'full');
  const anyAlmostFull = property.rooms.some((r) => r.status === 'almost_full');
  if (allFull) return 'full';
  if (anyAlmostFull) return 'almost_full';
  return 'available';
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function PropertyCardSkeleton() {
  return (
    <>
      <div className="property-card property-card--skeleton" aria-hidden="true">
        <div className="property-card__image-area skeleton-pulse" />
        <div className="property-card__body">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--sub" />
          <div className="skeleton-chips">
            <div className="skeleton-chip" />
            <div className="skeleton-chip" />
          </div>
          <div className="skeleton-line skeleton-line--price" />
        </div>
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }

        .skeleton-pulse {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 800px 100%;
          animation: skeleton-shimmer 1.4s ease-in-out infinite;
          border-radius: 6px;
        }

        .property-card--skeleton .property-card__image-area {
          height: 120px;
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .skeleton-line {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 800px 100%;
          animation: skeleton-shimmer 1.4s ease-in-out infinite;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        .skeleton-line--title  { height: 16px; width: 75%; }
        .skeleton-line--sub    { height: 12px; width: 55%; }
        .skeleton-line--price  { height: 18px; width: 40%; margin-top: 4px; }

        .skeleton-chips {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .skeleton-chip {
          height: 20px;
          width: 60px;
          border-radius: 999px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 800px 100%;
          animation: skeleton-shimmer 1.4s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onClick?: (property: Property) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PropertyCard({ property, isSelected = false, onClick }: PropertyCardProps) {
  const status = getOverallStatus(property);
  const statusCfg = STATUS_CONFIG[status];
  const genderCfg = GENDER_LABELS[property.genderType];

  // Max 3 fasilitas yang ditampilkan, sisanya "+N"
  const MAX_FACILITIES = 3;
  const visibleFacilities = property.facilities?.slice(0, MAX_FACILITIES) ?? [];
  const hiddenCount = (property.facilities?.length ?? 0) - MAX_FACILITIES;

  return (
    <>
      <article
        className={`property-card ${isSelected ? 'property-card--selected' : ''}`}
        onClick={() => onClick?.(property)}
        role="button"
        tabIndex={0}
        aria-label={`Properti: ${property.name}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(property); }}
      >
        {/* Thumbnail / placeholder */}
        <div className="property-card__image-area">
          {property.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={property.thumbnailUrl}
              alt={property.name}
              className="property-card__image"
            />
          ) : (
            <div className="property-card__image-placeholder">
              <span className="property-card__image-placeholder-icon">🏠</span>
            </div>
          )}

          {/* Status badge — di atas gambar */}
          <span
            className="property-card__status-badge"
            style={{ color: statusCfg.color, background: statusCfg.bg }}
          >
            <span
              className="property-card__status-dot"
              style={{ background: statusCfg.color }}
            />
            {statusCfg.label}
          </span>
        </div>

        {/* Body */}
        <div className="property-card__body">
          {/* Name */}
          <h3 className="property-card__name">{property.name}</h3>

          {/* Address */}
          <p className="property-card__address">{property.address}</p>

          {/* Gender + Facility chips */}
          <div className="property-card__chips">
            <span className="property-card__gender-chip">
              {genderCfg.emoji} {genderCfg.label}
            </span>
            {visibleFacilities.map((f) => (
              <span key={f.id} className="property-card__facility-chip">
                {f.name}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="property-card__facility-chip property-card__facility-chip--more">
                +{hiddenCount}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="property-card__price-row">
            <span className="property-card__price-label">Mulai</span>
            <span className="property-card__price">{formatPrice(property.priceMin)}</span>
            <span className="property-card__price-unit">/bln</span>
          </div>
        </div>
      </article>

      <style>{`
        /* ── Property Card ── */
        .property-card {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
          outline: none;
        }

        .property-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
          border-color: #a5b4fc;
        }

        .property-card:focus-visible {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        }

        .property-card--selected {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.25), 0 8px 24px rgba(15, 23, 42, 0.12);
        }

        /* ── Image Area ── */
        .property-card__image-area {
          position: relative;
          height: 120px;
          overflow: hidden;
        }

        .property-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .property-card__image-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .property-card__image-placeholder-icon {
          font-size: 36px;
          opacity: 0.7;
        }

        .property-card__status-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .property-card__status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Body ── */
        .property-card__body {
          padding: 12px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .property-card__name {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.35;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .property-card__address {
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Chips ── */
        .property-card__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 3px;
        }

        .property-card__gender-chip,
        .property-card__facility-chip {
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        .property-card__gender-chip {
          background: #ede9fe;
          color: #6d28d9;
          border: 1px solid #ddd6fe;
        }

        .property-card__facility-chip {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .property-card__facility-chip--more {
          background: #f8fafc;
          color: #94a3b8;
          border-color: #e2e8f0;
          font-weight: 700;
        }

        /* ── Price Row ── */
        .property-card__price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-top: 4px;
        }

        .property-card__price-label {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 500;
        }

        .property-card__price {
          font-size: 15px;
          font-weight: 800;
          color: #6366f1;
          letter-spacing: -0.02em;
        }

        .property-card__price-unit {
          font-size: 10px;
          color: #94a3b8;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}
