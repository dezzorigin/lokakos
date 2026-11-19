'use client';

/**
 * src/components/property/PropertyList.tsx
 *
 * Panel daftar properti — sisi kiri /. Menampilkan jumlah hasil
 * (yang terfilter, bukan total mentah), label sumber data yang jujur,
 * dan empty state saat filter tidak menemukan apa pun.
 *
 * 208 entri tidak di-render sekaligus: tampil 30 dulu, tombol "Muat lebih
 * banyak" menambah 30. Reset ke 30 setiap kali hasil filter berubah.
 */

import { useState } from 'react';
import type { Property } from '@/types/property';
import PropertyCard, { PropertyCardSkeleton } from './PropertyCard';
import { DATASET_META } from '@/lib/kosData';

const PAGE_SIZE = 30;

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevProperties, setPrevProperties] = useState(properties);

  // Hasil filter berubah (referensi array baru dari useMemo di halaman) ->
  // kembali ke halaman pertama. Pola "adjusting state during render" dari
  // React docs — bukan setState di dalam effect.
  if (prevProperties !== properties) {
    setPrevProperties(properties);
    setVisibleCount(PAGE_SIZE);
  }

  const visible = properties.slice(0, visibleCount);
  const remaining = properties.length - visible.length;

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
        <p className="property-list__subtitle">Banda Aceh &amp; Aceh Besar</p>
        <span className="property-list__sample">
          Data listing publik · diperbarui {DATASET_META.collected_at}
        </span>
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
          <>
            {visible.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isSelected={selectedPropertyId === property.id}
                isFavorite={isFavorite?.(property.id) ?? false}
                onFavoriteToggle={onFavoriteToggle}
                onClick={onPropertySelect}
              />
            ))}
            {remaining > 0 && (
              <button
                id="load-more-btn"
                type="button"
                className="property-list__load-more"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                Muat {Math.min(PAGE_SIZE, remaining)} kos lagi ({remaining} tersisa)
              </button>
            )}
          </>
        )}
      </div>

      <div className="property-list__footer">
        <span>© LokaKos 2026 · Peta © OpenStreetMap contributors</span>
      </div>
    </div>
  );
}
