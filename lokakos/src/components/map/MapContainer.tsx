'use client';

/**
 * src/components/map/MapContainer.tsx
 *
 * Komponen wrapper utama Mapbox GL via react-map-gl.
 *
 * ATURAN WAJIB (lihat PLANNER.md §6):
 *  - Harus 'use client' — Mapbox memerlukan window/document.
 *  - Harus di-import dengan dynamic({ ssr: false }) dari page.tsx.
 *  - Style: mapbox://styles/mapbox/streets-v12
 */

import { useCallback, useRef, useState } from 'react';
import Map, {
  NavigationControl,
  GeolocateControl,
  type MapRef,
  type MapEvent,
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

import {
  MAPBOX_TOKEN,
  MAPBOX_STYLE,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
} from '@/lib/mapbox/config';
import { MOCK_PROPERTIES } from '@/lib/mockData';
import type { Property } from '@/types/property';
import type { ViewState } from '@/types/map';
import PropertyMarker from '@/components/map/PropertyMarker';

// ─── Main Component ──────────────────────────────────────────────────────────
// PropertyMarker diimpor dari file terpisah: src/components/map/PropertyMarker.tsx

// ─── Main Component ──────────────────────────────────────────────────────────

export interface MapContainerProps {
  /** Callback saat marker diklik — properti yang dipilih */
  onPropertySelect?: (property: Property | null) => void;
  /** ID properti yang sedang dipilih (dari parent) */
  selectedPropertyId?: string | null;
  /** ViewState dikontrol dari luar (via useMap hook) — opsional */
  viewState?: ViewState;
  /** Callback untuk update viewState dari luar */
  onViewStateChange?: (vs: ViewState) => void;
}

export default function MapContainer({
  onPropertySelect,
  selectedPropertyId,
  viewState: externalViewState,
  onViewStateChange,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);

  // Gunakan internal state sebagai fallback jika tidak dikontrol dari luar
  const [internalViewState, setInternalViewState] = useState<ViewState>({
    longitude: DEFAULT_CENTER[0],
    latitude: DEFAULT_CENTER[1],
    zoom: DEFAULT_ZOOM,
    bearing: 0,
    pitch: 45,
  });

  const viewState = externalViewState ?? internalViewState;
  const handleViewStateChange = (vs: ViewState) => {
    if (onViewStateChange) {
      onViewStateChange(vs);
    } else {
      setInternalViewState(vs);
    }
  };

  const handleMarkerClick = useCallback(
    (property: Property) => {
      // Fly to marker dengan animasi smooth
      mapRef.current?.flyTo({
        center: [property.longitude, property.latitude],
        zoom: Math.max(viewState.zoom, 16),
        duration: 800,
        essential: true,
      });
      onPropertySelect?.(property);
    },
    [onPropertySelect, viewState.zoom],
  );

  // Klik area kosong di peta → deselect properti
  const handleMapClick = useCallback(() => {
    onPropertySelect?.(null);
  }, [onPropertySelect]);

  // Handler onLoad — tambahkan layer 3D buildings
  const handleMapLoad = useCallback((evt: MapEvent) => {
    const map = evt.target;

    // Pastikan style sudah sepenuhnya dimuat
    if (!map.isStyleLoaded()) return;

    // Cari layer pertama dengan tipe 'symbol' (label) sebagai insertion point
    // agar gedung 3D tampil di bawah label teks
    const layers = map.getStyle()?.layers ?? [];
    let firstSymbolId: string | undefined;
    for (const layer of layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id;
        break;
      }
    }

    // Tambahkan layer fill-extrusion untuk gedung 3D
    if (!map.getLayer('3d-buildings')) {
      map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'height'],
              0,   '#e2e8f0',
              10,  '#cbd5e1',
              30,  '#94a3b8',
              100, '#64748b',
            ],
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,   0,
              14.5, ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,   0,
              14.5, ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.85,
          },
        },
        firstSymbolId,
      );
    }
  }, []);

  return (
    <div className="map-wrapper">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => handleViewStateChange(evt.viewState)}
        onLoad={handleMapLoad}
        mapStyle={MAPBOX_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        onClick={handleMapClick}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        {/* Kontrol navigasi (zoom +/-) — pojok kanan atas */}
        <NavigationControl position="top-right" showCompass={false} />

        {/* Tombol geolocation — pojok kanan atas di bawah NavigationControl */}
        <GeolocateControl
          position="top-right"
          trackUserLocation
          showUserHeading
        />

        {/* Marker properti dari mock data */}
        {MOCK_PROPERTIES.map((property) => (
          <PropertyMarker
            key={property.id}
            property={property}
            isSelected={selectedPropertyId === property.id}
            onClick={handleMarkerClick}
          />
        ))}
      </Map>

      <style>{`
        .map-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        /* Mapbox attribution — sembunyikan */
        .mapboxgl-ctrl-attrib-button { display: none; }
        .mapboxgl-ctrl-attrib { display: none; }

        /* Kontrol Mapbox — Light Mode */
        .mapboxgl-ctrl-group {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12) !important;
        }

        .mapboxgl-ctrl-group button {
          background: transparent !important;
          color: #64748b !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }

        .mapboxgl-ctrl-group button:last-child {
          border-bottom: none !important;
        }

        .mapboxgl-ctrl-group button:hover {
          background: #f8fafc !important;
          color: #0f172a !important;
        }

        .mapboxgl-ctrl-group button .mapboxgl-ctrl-icon {
          filter: none;
        }

        .mapboxgl-ctrl-geolocate-active .mapboxgl-ctrl-icon {
          filter: invert(35%) sepia(90%) saturate(600%) hue-rotate(225deg) !important;
        }
      `}</style>
    </div>
  );
}
