'use client';

/**
 * src/components/map/MapContainer.tsx
 *
 * Wrapper MapView — satu-satunya pintu masuk peta.
 * Leaflet butuh `window`, jadi MapView di-import dengan dynamic({ ssr: false }).
 * File ini menjaga API lama (properties + selectedPropertyId + onPropertySelect)
 * supaya halaman /peta tidak perlu tahu soal Leaflet.
 */

import dynamic from 'next/dynamic';
import type { Property } from '@/types/property';
import type { MapViewProps } from './MapView';

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <div className="map-loading__spinner" />
      <p className="map-loading__text">Memuat peta…</p>
    </div>
  ),
});

export interface MapContainerProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (property: Property | null) => void;
  onMarkerNavigate?: MapViewProps['onMarkerNavigate'];
  interactive?: boolean;
}

export default function MapContainer({
  properties,
  selectedPropertyId = null,
  onPropertySelect,
  onMarkerNavigate,
  interactive = true,
}: MapContainerProps) {
  return (
    <MapView
      properties={properties}
      selectedPropertyId={selectedPropertyId}
      onPropertySelect={onPropertySelect}
      onMarkerNavigate={onMarkerNavigate}
      interactive={interactive}
    />
  );
}
