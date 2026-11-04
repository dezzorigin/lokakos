'use client';

/**
 * src/components/property/PropertyDetail.tsx
 *
 * Panel detail properti — slide-in dari kanan saat marker diklik.
 * Menampilkan nama, alamat, harga, fasilitas, dan tipe kamar.
 *
 * ATURAN WAJIB (PLANNER.md §6): harus 'use client' karena menggunakan hooks dan browser API.
 */

import type { Property, RoomStatus } from '@/types/property';
import { formatPrice } from '@/lib/mockData';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<RoomStatus, { label: string; color: string }> = {
  available: { label: 'Tersedia', color: '#10b981' },
  almost_full: { label: 'Hampir Penuh', color: '#fbbf24' },
  full: { label: 'Penuh', color: '#f43f5e' },
};

const GENDER_LABELS: Record<string, string> = {
  male: '♂ Putra',
  female: '♀ Putri',
  mixed: '⚥ Campur',
};

function getOverallStatus(property: Property): RoomStatus {
  if (!property.rooms?.length) return 'available';
  const allFull = property.rooms.every((r) => r.status === 'full');
  const anyAlmostFull = property.rooms.some((r) => r.status === 'almost_full');
  if (allFull) return 'full';
  if (anyAlmostFull) return 'almost_full';
  return 'available';
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface PropertyDetailProps {
  property: Property;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PropertyDetail({ property, onClose }: PropertyDetailProps) {
  const status = getOverallStatus(property);
  const statusCfg = STATUS_CONFIG[status];

  return (
    <>
      <aside className="detail-panel" role="complementary" aria-label="Detail properti">
        {/* Header */}
        <div className="detail-panel__header">
          <div className="detail-panel__header-top">
            <span
              className="detail-panel__status-badge"
              style={{ backgroundColor: `${statusCfg.color}22`, color: statusCfg.color }}
            >
              <span
                className="detail-panel__status-dot"
                style={{ backgroundColor: statusCfg.color }}
              />
              {statusCfg.label}
            </span>
            <button
              id="close-detail-panel-btn"
              onClick={onClose}
              className="detail-panel__close-btn"
              aria-label="Tutup panel detail"
            >
              ✕
            </button>
          </div>
          <h2 className="detail-panel__name">{property.name}</h2>
          <p className="detail-panel__address">{property.address}</p>
          <div className="detail-panel__tags">
            <span className="detail-panel__tag">{GENDER_LABELS[property.genderType]}</span>
          </div>
        </div>

        {/* Price */}
        <div className="detail-panel__price-section">
          <span className="detail-panel__price-label">Mulai dari</span>
          <span className="detail-panel__price">
            {formatPrice(property.priceMin)}
            <span className="detail-panel__price-unit">/bln</span>
          </span>
          {property.priceMax && (
            <span className="detail-panel__price-max">
              s/d {formatPrice(property.priceMax)}
            </span>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <div className="detail-panel__section">
            <h3 className="detail-panel__section-title">Deskripsi</h3>
            <p className="detail-panel__description">{property.description}</p>
          </div>
        )}

        {/* Facilities */}
        {property.facilities && property.facilities.length > 0 && (
          <div className="detail-panel__section">
            <h3 className="detail-panel__section-title">Fasilitas</h3>
            <div className="detail-panel__facilities">
              {property.facilities.map((f) => (
                <span key={f.id} className="detail-panel__facility-chip">
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rooms */}
        {property.rooms && property.rooms.length > 0 && (
          <div className="detail-panel__section">
            <h3 className="detail-panel__section-title">Tipe Kamar</h3>
            <div className="detail-panel__rooms">
              {property.rooms.map((room) => {
                const roomStatus = STATUS_CONFIG[room.status];
                return (
                  <div key={room.id} className="detail-panel__room-card">
                    <div className="detail-panel__room-info">
                      <span className="detail-panel__room-name">{room.name}</span>
                      <span
                        className="detail-panel__room-status"
                        style={{ color: roomStatus.color }}
                      >
                        {room.availableUnits > 0
                          ? `${room.availableUnits} kamar tersisa`
                          : roomStatus.label}
                      </span>
                    </div>
                    <span className="detail-panel__room-price">
                      {formatPrice(room.price)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="detail-panel__cta">
          <button id="hubungi-pemilik-btn" className="detail-panel__cta-btn">
            Hubungi Pemilik
          </button>
        </div>
      </aside>

      <style>{`
        /* ── Detail Panel ── */
        .detail-panel {
          position: absolute;
          top: 0;
          right: 0;
          width: 360px;
          height: 100%;
          background: #ffffff;
          border-left: 1px solid #e2e8f0;
          overflow-y: auto;
          z-index: 30;
          display: flex;
          flex-direction: column;
          gap: 0;
          animation: slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: -4px 0 24px rgba(15, 23, 42, 0.08);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        .detail-panel__header {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #ffffff;
        }

        .detail-panel__header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .detail-panel__status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-panel__status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .detail-panel__close-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 150ms ease;
          font-family: inherit;
          flex-shrink: 0;
        }

        .detail-panel__close-btn:hover {
          background: #fee2e2;
          color: #f43f5e;
          border-color: #fecdd3;
        }

        .detail-panel__name {
          font-size: 17px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
        }

        .detail-panel__address {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .detail-panel__tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .detail-panel__tag {
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        /* ── Price Section ── */
        .detail-panel__price-section {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: linear-gradient(135deg, #fafafa 0%, #f0f9ff 100%);
        }

        .detail-panel__price-label {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        .detail-panel__price {
          font-size: 24px;
          font-weight: 800;
          color: #6366f1;
          letter-spacing: -0.02em;
        }

        .detail-panel__price-unit {
          font-size: 13px;
          font-weight: 500;
          color: #94a3b8;
          margin-left: 2px;
        }

        .detail-panel__price-max {
          font-size: 12px;
          color: #94a3b8;
        }

        /* ── Sections ── */
        .detail-panel__section {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #ffffff;
        }

        .detail-panel__section-title {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
        }

        .detail-panel__description {
          font-size: 13px;
          color: #475569;
          line-height: 1.7;
        }

        /* ── Facilities ── */
        .detail-panel__facilities {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .detail-panel__facility-chip {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 500;
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        /* ── Rooms ── */
        .detail-panel__rooms {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-panel__room-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .detail-panel__room-card:hover {
          border-color: #c7d2fe;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
        }

        .detail-panel__room-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .detail-panel__room-name {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
        }

        .detail-panel__room-status {
          font-size: 11px;
          font-weight: 600;
        }

        .detail-panel__room-price {
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
        }

        /* ── CTA ── */
        .detail-panel__cta {
          padding: 20px;
          margin-top: auto;
          background: #ffffff;
          border-top: 1px solid #f1f5f9;
        }

        .detail-panel__cta-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 200ms ease;
          font-family: inherit;
          letter-spacing: 0.01em;
        }

        .detail-panel__cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }

        .detail-panel__cta-btn:active {
          transform: translateY(0);
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .detail-panel {
            width: 100%;
            height: 70dvh;
            top: auto;
            bottom: 0;
            right: 0;
            border-left: none;
            border-top: 1px solid #e2e8f0;
            border-radius: 20px 20px 0 0;
            animation: slideInBottom 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }

          @keyframes slideInBottom {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
        }
      `}</style>
    </>
  );
}
