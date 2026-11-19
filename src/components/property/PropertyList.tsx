'use client';

/**
 * src/components/property/PropertyList.tsx
 *
 * Panel daftar properti — sisi kiri /peta. Menampilkan jumlah hasil
 * (yang terfilter, bukan total mentah), label "data contoh" yang jujur,
 * dan empty state saat filter tidak menemukan apa pun.
 */

import type { Property } from '@/types/property';
import PropertyCard, { PropertyCardSkeleton } from './PropertyCard';

export interface PropertyListProps {
  properties: Property[];
  totalCount: number;
  selectedPropertyId?: string | null;
  isLoading?: boolean;
  isFavorite?: (id: string) => boolean;
  onFavoriteToggle?: (property: Property) => void;
  onPropertySelect?: (property: Property) => void;
}

export default function PropertyList({
  properties,
  totalCount,
  selectedPropertyId,
  isLoading = false,
  isFavorite,
  onFavoriteToggle,
  onPropertySelect,
}: PropertyListProps) {
  return (
    <div className="property-list">
      <div className="property-list__header">
        <h2 className="property-list__title">
          {isLoading ? (
            'Memuat…'
          ) : (
            <>
              <span className="num">{properties.length}</span> dari{' '}
              <span className="num">{totalCount}</span> Kos Ditemukan
            </>
          )}
        </h2>
        <p className="property-list__subtitle">Area Darussalam, Banda Aceh</p>
        <span className="property-list__sample">Data contoh — bukan listing sungguhan</span>
      </div>

      <div className="property-list__scroll">
        {isLoading ? (
          <>
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </>
        ) : properties.length === 0 ? (
          <div className="property-list__empty">
            <p className="property-list__empty-title">Tidak ada kos yang cocok</p>
            <p className="property-list__empty-sub">
              Coba longgarkan filter atau hapus kata pencarian.
            </p>
          </div>
        ) : (
          properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              isSelected={selectedPropertyId === property.id}
              isFavorite={isFavorite?.(property.id) ?? false}
              onFavoriteToggle={onFavoriteToggle}
              onClick={onPropertySelect}
            />
          ))
        )}
      </div>

      <div className="property-list__footer">
        <span>© LokaKos 2026 · Peta © OpenStreetMap contributors</span>
      </div>
    </div>
  );
}
