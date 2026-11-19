'use client';

/**
 * src/app/peta/page.tsx — Aplikasi peta penuh LokaKos.
 *
 * Layout split (warisan PLANNER.md): panel kiri (FilterPanel + PropertyList)
 * + peta kanan (MapContainer Leaflet) + drawer detail.
 * Deep-link: /peta?kos=<id> langsung membuka detail kos itu.
 *
 * Catatan Next.js 16: useSearchParams hanya boleh dipakai di dalam
 * <Suspense> pada route yang di-prerender — lihat docs Next
 * (node_modules/next/dist/docs/.../use-search-params.md). Supaya seluruh
 * halaman tidak ikut tertunda client-render, pembaca param dipisah ke
 * komponen kecil <DeepLinkOpener> di dalam <Suspense>; FilterPanel, daftar,
 * dan peta tetap ter-render di HTML statis.
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import FilterPanel from '@/components/layout/FilterPanel';
import PropertyList from '@/components/property/PropertyList';
import PropertyDetail from '@/components/property/PropertyDetail';
import MapSearchBar from '@/components/map/MapSearchBar';
import MapContainer from '@/components/map/MapContainer';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import { applyFilters, EMPTY_FILTERS, type FilterState } from '@/lib/filter';
import { useFavorites } from '@/lib/favorites';
import { useMap } from '@/hooks/useMap';

/** Pembaca ?kos= — satu-satunya komponen yang memakai useSearchParams. */
function DeepLinkOpener({ onOpen }: { onOpen: (id: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const id = searchParams.get('kos');
    if (id) onOpen(id);
  }, [searchParams, onOpen]);
  return null;
}

function PetaContent() {
  const { selectedProperty, selectProperty } = useMap();
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const { favorites, toggle, isFavorite } = useFavorites();

  const filtered = useMemo(
    () => applyFilters(MOCK_PROPERTIES, filters, favorites),
    [filters, favorites],
  );

  // Deep-link ?kos=<id> -> buka detail kos itu.
  const openById = useCallback(
    (id: string) => {
      const found = MOCK_PROPERTIES.find((p) => p.id === id);
      if (found) selectProperty(found);
    },
    [selectProperty],
  );

  // Kos terpilih ikut terfilter keluar -> tutup drawer-nya.
  useEffect(() => {
    if (selectedProperty && !filtered.some((p) => p.id === selectedProperty.id)) {
      selectProperty(null);
    }
  }, [filtered, selectedProperty, selectProperty]);

  return (
    <div className="page-layout">
      <Suspense fallback={null}>
        <DeepLinkOpener onOpen={openById} />
      </Suspense>
      <Navbar compact />
      <div className="page-content">
        <aside
          className={`left-panel${isLeftPanelOpen ? '' : ' left-panel--collapsed'}`}
          aria-label="Panel properti"
        >
          <FilterPanel value={filters} onChange={setFilters} />
          <PropertyList
            properties={filtered}
            totalCount={MOCK_PROPERTIES.length}
            selectedPropertyId={selectedProperty?.id ?? null}
            isLoading={false}
            isFavorite={isFavorite}
            onFavoriteToggle={(p) => toggle(p.id)}
            onPropertySelect={selectProperty}
          />
        </aside>

        <button
          id="toggle-left-panel-btn"
          type="button"
          className="left-panel-toggle"
          onClick={() => setIsLeftPanelOpen((v) => !v)}
          aria-label={isLeftPanelOpen ? 'Sembunyikan panel' : 'Tampilkan panel'}
          title={isLeftPanelOpen ? 'Sembunyikan panel' : 'Tampilkan panel'}
          style={{ left: isLeftPanelOpen ? '360px' : '8px' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            style={{
              transform: isLeftPanelOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 200ms ease',
            }}
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <main className="map-area" role="main" aria-label="Peta properti kos">
          <div className="map-searchbar-wrap">
            <MapSearchBar
              value={filters.query}
              onChange={(q) => setFilters((f) => ({ ...f, query: q }))}
            />
          </div>

          <MapContainer
            properties={filtered}
            selectedPropertyId={selectedProperty?.id ?? null}
            onPropertySelect={selectProperty}
          />

          <div className="map-legend" aria-label="Keterangan marker">
            <span className="map-legend__title">Status Kamar</span>
            <div className="map-legend__items">
              <span className="map-legend__item">
                <span className="map-legend__dot" style={{ background: '#236147' }} />
                Tersedia
              </span>
              <span className="map-legend__item">
                <span className="map-legend__dot" style={{ background: '#E9B44C' }} />
                Hampir Penuh
              </span>
              <span className="map-legend__item">
                <span className="map-legend__dot" style={{ background: '#9A3B20' }} />
                Penuh
              </span>
            </div>
          </div>

          {selectedProperty && (
            <PropertyDetail
              property={selectedProperty}
              isFavorite={isFavorite(selectedProperty.id)}
              onFavoriteToggle={(p) => toggle(p.id)}
              onClose={() => selectProperty(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function PetaPage() {
  return <PetaContent />;
}
