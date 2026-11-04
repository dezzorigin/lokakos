'use client';

/**
 * src/components/map/PropertyMarker.tsx
 *
 * Custom marker untuk properti di peta Mapbox.
 * Menampilkan label harga singkat + dot status + arrow pointer ke bawah.
 *
 * ATURAN WAJIB (PLANNER.md §6): harus 'use client' karena digunakan di dalam MapContainer.
 */

import { Marker } from 'react-map-gl/mapbox';
import { formatPriceShort } from '@/lib/mockData';
import type { Property } from '@/types/property';

// ─── Status color map ─────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  available: '#10b981',    // emerald-500
  almost_full: '#fbbf24',  // amber-400
  full: '#f43f5e',         // rose-500
};

function getPropertyStatus(property: Property): string {
  if (!property.rooms || property.rooms.length === 0) return 'available';
  const allFull = property.rooms.every((r) => r.status === 'full');
  const anyAlmostFull = property.rooms.some((r) => r.status === 'almost_full');
  if (allFull) return 'full';
  if (anyAlmostFull) return 'almost_full';
  return 'available';
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface PropertyMarkerProps {
  property: Property;
  isSelected: boolean;
  onClick: (property: Property) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PropertyMarker({ property, isSelected, onClick }: PropertyMarkerProps) {
  const status = getPropertyStatus(property);
  const dotColor = STATUS_COLOR[status] ?? STATUS_COLOR.available;
  const label = formatPriceShort(property.priceMin);

  return (
    <Marker
      longitude={property.longitude}
      latitude={property.latitude}
      anchor="bottom"
      onClick={(e) => {
        // Mencegah event klik dari bubble ke peta
        e.originalEvent.stopPropagation();
        onClick(property);
      }}
    >
      <div
        className={`property-marker ${isSelected ? 'property-marker--selected' : ''}`}
        title={property.name}
      >
        <span className="property-marker__label">{label}</span>
        <span
          className="property-marker__dot"
          style={{ backgroundColor: dotColor }}
        />
        {/* Arrow pointer ke bawah */}
        <span className="property-marker__arrow" />
      </div>

      <style>{`
        /* ── Property Marker — Light Mode ── */
        .property-marker {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12), 0 1px 4px rgba(15, 23, 42, 0.08);
          transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
          transform-origin: bottom center;
          user-select: none;
        }

        .property-marker:hover {
          transform: scale(1.08) translateY(-2px);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.1);
          border-color: #6366f1;
        }

        .property-marker--selected {
          background: #6366f1;
          border-color: #4f46e5;
          transform: scale(1.12) translateY(-4px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.45);
        }

        .property-marker--selected .property-marker__label {
          color: #ffffff;
        }

        .property-marker__label {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: 0.01em;
        }

        .property-marker__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Arrow pointer ke bawah */
        .property-marker__arrow {
          position: absolute;
          bottom: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid #ffffff;
          transition: border-top-color 150ms ease;
        }

        .property-marker--selected .property-marker__arrow {
          border-top-color: #6366f1;
        }
      `}</style>
    </Marker>
  );
}
