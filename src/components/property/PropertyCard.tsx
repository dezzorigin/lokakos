'use client';

/**
 * src/components/property/PropertyCard.tsx
 *
 * Kartu properti di daftar. Tepi kiri putus-putus kunyit = "sobekan papan
 * pengumuman" (detail khas, lihat docs/DESIGN.md). Kos tanpa harga di sumber
 * menampilkan "Harga tidak tercatat di sumber" — bukan harga karangan.
 * Tombol hati = favorit (localStorage), stopPropagation supaya tidak ikut
 * membuka detail.
 */

import type { Property } from '@/types/property';
import { formatPrice, pricePeriodLabel } from '@/lib/format';
import { GENDER_LABELS, getOverallStatus, STATUS_CONFIG } from '@/lib/property';

export interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (property: Property) => void;
  onClick?: (property: Property) => void;
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path
        d="M12 20.5C7 16.5 3 13.3 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4 2.5 0 4.7 1.9 4.7 4.8 0 4-4 7.2-9 11.2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PropertyCard({
  property,
  isSelected = false,
  isFavorite = false,
  onFavoriteToggle,
  onClick,
}: PropertyCardProps) {
  const status = getOverallStatus(property);
  const statusCfg = STATUS_CONFIG[status];
  const genderCfg = GENDER_LABELS[property.genderType];

  const MAX_FACILITIES = 3;
  const visibleFacilities = property.facilities?.slice(0, MAX_FACILITIES) ?? [];
  const hiddenCount = (property.facilities?.length ?? 0) - MAX_FACILITIES;

  return (
    <article
      className={`property-card ${isSelected ? 'property-card--selected' : ''}`}
      onClick={() => onClick?.(property)}
      role="button"
      tabIndex={0}
      aria-label={`Properti: ${property.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(property);
        }
      }}
    >
      <div className="property-card__top">
        <span
          className="property-card__status"
          style={{ color: statusCfg.color, background: statusCfg.bg }}
        >
          <span className="property-card__status-dot" style={{ background: statusCfg.color }} />
          {statusCfg.label}
        </span>
        <button
          type="button"
          className={`property-card__fav ${isFavorite ? 'property-card__fav--active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(property);
          }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Hapus ${property.name} dari favorit` : `Simpan ${property.name} ke favorit`}
        >
          <HeartIcon filled={isFavorite} />
        </button>
      </div>
      <div className="property-card__body">
        <h3 className="property-card__name">{property.name}</h3>
        <p className="property-card__address">{property.address}</p>
        <div className="property-card__chips">
          <span className="property-card__chip">
            {genderCfg.mark} {genderCfg.label}
          </span>
          {visibleFacilities.map((f) => (
            <span key={f.id} className="property-card__chip">
              {f.name}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="property-card__chip">+{hiddenCount}</span>
          )}
        </div>
        <div className="property-card__price-row">
          {property.priceMin != null ? (
            <>
              <span className="property-card__price-label">Mulai</span>
              <span className="property-card__price num">{formatPrice(property.priceMin)}</span>
              <span className="property-card__price-unit">
                {pricePeriodLabel(property.pricePeriod)}
              </span>
            </>
          ) : (
            <span className="property-card__price-label property-card__price-label--none">
              Harga tidak tercatat di sumber
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return <div className="property-card__skeleton" aria-hidden="true" />;
}
