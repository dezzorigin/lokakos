'use client';

/**
 * src/components/map/MapView.tsx
 *
 * Peta LokaKos — Leaflet + tile standar OpenStreetMap.
 * TANPA API key: keputusan restructure #33 (Mapbox butuh token, tidak ada
 * token di repo, dan tanpa token peta live blank). Atribusi OSM tampil
 * di pojok peta (syarat lisensi ODbL).
 *
 * Marker = "karcis harga" (lihat docs/DESIGN.md): pil kunyit berisi harga
 * singkat + titik status. Klik marker -> onPropertySelect. Klik peta kosong
 * -> deselect. `flyToSelected` menggerakkan peta saat properti dipilih
 * dari daftar.
 *
 * Leaflet butuh `window`, jadi komponen ini SELALU di-import dengan
 * dynamic({ ssr: false }) — lihat MapContainer.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer as LeafletMap, Marker, TileLayer, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import {
  BANDA_ACEH_BOUNDS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_ATTRIBUTION,
  TILE_URL,
} from '@/lib/map/config';
import { formatPriceShort } from '@/lib/mockData';
import { getOverallStatus, STATUS_CONFIG } from '@/lib/property';
import type { Property } from '@/types/property';

export interface MapViewProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (property: Property | null) => void;
  /** Peta preview di landing: klik marker menavigasi, bukan membuka drawer. */
  onMarkerNavigate?: (property: Property) => void;
  interactive?: boolean;
}

// ─── Ikon karcis harga ────────────────────────────────────────────────────────
function ticketIcon(property: Property, isSelected: boolean): L.DivIcon {
  const status = getOverallStatus(property);
  const color = STATUS_CONFIG[status].color;
  const label = formatPriceShort(property.priceMin);
  return L.divIcon({
    className: 'price-ticket-wrap',
    html:
      `<span class="price-ticket${isSelected ? ' price-ticket--selected' : ''}" ` +
      `title="${property.name.replace(/"/g, '&quot;')}">` +
      `<span class="price-ticket__hole" aria-hidden="true"></span>` +
      `<span>${label}</span>` +
      `<span class="price-ticket__dot" style="background:${color}" aria-hidden="true"></span>` +
      `</span>`,
    iconSize: undefined,
    iconAnchor: [44, 14],
  });
}

// ─── Fly-to saat properti dipilih dari daftar ────────────────────────────────
function FlyToSelected({ property }: { property: Property | null }) {
  const map = useMap();
  const prevId = useRef<string | null>(null);
  useEffect(() => {
    if (property && property.id !== prevId.current) {
      prevId.current = property.id;
      map.flyTo([property.latitude, property.longitude], Math.max(map.getZoom(), 16), {
        duration: 0.8,
      });
    }
    if (!property) prevId.current = null;
  }, [property, map]);
  return null;
}

// ─── Tombol "lokasi saya" ────────────────────────────────────────────────────
function LocateButton() {
  const map = useMap();
  const [state, setState] = useState<'idle' | 'locating' | 'denied'>('idle');
  return (
    <button
      type="button"
      className="map-view__locate"
      disabled={state === 'locating'}
      onClick={() => {
        if (!('geolocation' in navigator)) {
          setState('denied');
          return;
        }
        setState('locating');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setState('idle');
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 0.8 });
          },
          () => setState('denied'),
          { timeout: 8000 },
        );
      }}
      aria-label="Tampilkan lokasiku di peta"
      title={state === 'denied' ? 'Lokasi tidak diizinkan browser' : 'Tampilkan lokasiku'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
      </svg>
      {state === 'denied' ? 'Lokasi diblokir' : state === 'locating' ? 'Mencari…' : 'Lokasiku'}
    </button>
  );
}

export default function MapView({
  properties,
  selectedPropertyId = null,
  onPropertySelect,
  onMarkerNavigate,
  interactive = true,
}: MapViewProps) {
  // Tile gagal total (offline / tile diblokir) -> fallback informatif,
  // bukan peta abu-abu kosong. Kriteria: ada error tile dan belum satu pun
  // tile berhasil dimuat (bukan timer buta — tile lambat tetap ditunggu).
  const [loaded, setLoaded] = useState(0);
  const [errors, setErrors] = useState(0);
  const failed = errors >= 2 && loaded === 0;
  const selected = useMemo(
    () => properties.find((p) => p.id === selectedPropertyId) ?? null,
    [properties, selectedPropertyId],
  );

  if (failed) {
    return (
      <div className="map-view__fallback" role="status">
        <p>
          <strong>Peta tidak termuat.</strong>
        </p>
        <p>
          Tile peta (OpenStreetMap) tidak merespons dari jaringan ini. Daftar kos di
          sebelah kiri tetap bisa dipakai — coba muat ulang halaman.
        </p>
      </div>
    );
  }

  return (
    <div className="map-view">
      <LeafletMap
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        maxBounds={BANDA_ACEH_BOUNDS}
        maxBoundsViscosity={0.8}
        zoomControl={false}
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="map-view__leaflet"
        attributionControl
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          eventHandlers={{
            tileload: () => setLoaded((n) => n + 1),
            tileerror: () => setErrors((n) => n + 1),
          }}
        />
        <ZoomControl position="topright" />
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={ticketIcon(property, property.id === selectedPropertyId)}
            eventHandlers={{
              click: () => {
                if (onMarkerNavigate) onMarkerNavigate(property);
                else onPropertySelect?.(property);
              },
            }}
          />
        ))}
        <FlyToSelected property={selected} />
        {interactive && <LocateButton />}
      </LeafletMap>
    </div>
  );
}
