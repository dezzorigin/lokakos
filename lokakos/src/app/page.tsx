'use client';

/**
 * src/app/page.tsx
 *
 * Halaman utama LokaKos — layout split: PropertyList (kiri) + Peta (kanan).
 *
 * Catatan penting (lihat PLANNER.md §6 "Penting: Next.js Rules"):
 *  - 'use client' diperlukan agar dynamic() dengan ssr:false bisa digunakan
 *    di dalam component ini (next.js mensyaratkan ssr:false hanya di Client Component).
 *  - MapContainer di-import dengan dynamic() + ssr:false untuk menghindari
 *    error SSR karena Mapbox GL membutuhkan window/document.
 *
 * State Flow:
 *  useMap hook → selectedProperty + viewState
 *    → PropertyMarker.onClick → selectProperty → tampil PropertyDetail
 *    → PropertyDetail.onClose → selectProperty(null) → drawer menghilang
 */

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MOCK_PROPERTIES } from '@/lib/mockData';

// Custom hook — state management peta
import { useMap } from '@/hooks/useMap';

// Komponen yang sudah diekstrak ke file masing-masing
import Navbar from '@/components/layout/Navbar';
import FilterPanel from '@/components/layout/FilterPanel';
import PropertyList from '@/components/property/PropertyList';
import PropertyDetail from '@/components/property/PropertyDetail';
import MapSearchBar from '@/components/map/MapSearchBar';

// Dynamic import MapContainer — ssr: false karena Mapbox butuh window
const MapContainer = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => <MapLoadingFallback />,
});

// ─── Loading fallback ─────────────────────────────────────────────────────────
function MapLoadingFallback() {
  return (
    <div className="map-loading">
      <div className="map-loading__spinner" />
      <p className="map-loading__text">Memuat peta…</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { viewState, setViewState, selectedProperty, selectProperty } = useMap();
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

  return (
    <>
      <div className="page-layout">
        {/* Navbar — full width di atas */}
        <Navbar />

        {/* Content area: panel kiri + peta kanan */}
        <div className="page-content">

          {/* Panel kiri: FilterPanel + PropertyList */}
          <aside
            className={`left-panel${isLeftPanelOpen ? '' : ' left-panel--collapsed'}`}
            aria-label="Panel properti"
          >
            <FilterPanel />
            <PropertyList
              properties={MOCK_PROPERTIES}
              selectedPropertyId={selectedProperty?.id ?? null}
              isLoading={false}
              onPropertySelect={selectProperty}
            />
          </aside>

          {/* Tombol toggle panel kiri */}
          <button
            id="toggle-left-panel-btn"
            className="left-panel-toggle"
            onClick={() => setIsLeftPanelOpen((v) => !v)}
            aria-label={isLeftPanelOpen ? 'Sembunyikan panel' : 'Tampilkan panel'}
            title={isLeftPanelOpen ? 'Sembunyikan panel' : 'Tampilkan panel'}
            style={{ left: isLeftPanelOpen ? '352px' : '8px' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transform: isLeftPanelOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.3s ease',
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

          {/* Area peta — kanan, mengisi sisa ruang */}
          <main className="map-area" role="main" aria-label="Peta properti kos">
            {/* Search Bar mengambang — atas tengah peta */}
            <MapSearchBar />

            <MapContainer
              onPropertySelect={selectProperty}
              selectedPropertyId={selectedProperty?.id ?? null}
              viewState={viewState}
              onViewStateChange={setViewState}
            />

            {/* Legend status marker */}
            <div className="map-legend" aria-label="Keterangan marker">
              <span className="map-legend__title">Status Kamar</span>
              <div className="map-legend__items">
                <span className="map-legend__item">
                  <span className="map-legend__dot" style={{ background: '#10b981' }} />
                  Tersedia
                </span>
                <span className="map-legend__item">
                  <span className="map-legend__dot" style={{ background: '#fbbf24' }} />
                  Hampir Penuh
                </span>
                <span className="map-legend__item">
                  <span className="map-legend__dot" style={{ background: '#f43f5e' }} />
                  Penuh
                </span>
              </div>
            </div>

            {/* Detail drawer — slide-in dari kanan saat properti dipilih */}
            {selectedProperty && (
              <PropertyDetail
                property={selectedProperty}
                onClose={() => selectProperty(null)}
              />
            )}
          </main>
        </div>
      </div>

      <style>{`
        /* ── Reset & Base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f8fafc;
          color: #0f172a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow: hidden;
        }

        /* ── Page Layout: kolom utama (navbar + content) ── */
        .page-layout {
          display: flex;
          flex-direction: column;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
        }

        /* ── Content Area: row (panel kiri + peta kanan) ── */
        .page-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* ── Left Panel: FilterPanel di atas + PropertyList scrollable ── */
        .left-panel {
          display: flex;
          flex-direction: column;
          width: 360px;
          flex-shrink: 0;
          background: #f8fafc;
          border-right: 1px solid #e2e8f0;
          overflow: hidden;
          transition: width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      opacity 0.3s ease;
        }

        .left-panel--collapsed {
          width: 0;
          opacity: 0;
          border-right: none;
          pointer-events: none;
        }

        /* ── Panel Toggle Button ── */
        .left-panel-toggle {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 28px;
          height: 56px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0 10px 10px 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          box-shadow: 2px 0 8px rgba(15, 23, 42, 0.08);
          transition: left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      background 150ms ease,
                      color 150ms ease;
          padding: 0;
          font-family: inherit;
        }

        .left-panel-toggle:hover {
          background: #f0f9ff;
          color: #6366f1;
          border-color: #c7d2fe;
        }

        /* ── Map Area ── */
        .map-area {
          flex: 1;
          position: relative;
          overflow: hidden;
        }

        /* ── Map Loading Fallback ── */
        .map-loading {
          width: 100%;
          height: 100%;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .map-loading__spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #6366f1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .map-loading__text {
          color: #64748b;
          font-size: 14px;
        }

        /* ── Map Legend ── */
        .map-legend {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 10px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 10;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }

        .map-legend__title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
        }

        .map-legend__items {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .map-legend__item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #475569;
        }

        .map-legend__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .left-panel {
            display: none; /* Di mobile: list tersembunyi, peta fullscreen */
          }
          .left-panel-toggle {
            display: none; /* Di mobile: sembunyikan toggle */
          }
        }
      `}</style>
    </>
  );
}
