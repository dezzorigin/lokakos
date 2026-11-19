'use client';

/**
 * src/components/property/PropertyDetail.tsx
 *
 * Panel detail properti — slide-in dari kanan saat marker / kartu diklik.
 * CTA yang benar-benar jalan:
 *  - "Simpan" -> favorit (localStorage), toggle.
 *  - "Bagikan" -> salin tautan /peta?kos=<id> ke clipboard (deep-link:
 *    membuka tautan itu langsung membuka detail kos ini).
 *
 * "Hubungi Pemilik" DIHAPUS: data contoh tidak punya nomor pemilik, dan
 * tombol tanpa aksi adalah cacat produk (standar anti-slop §5).
 */

import { useState } from 'react';
import type { Property } from '@/types/property';
import { formatPrice } from '@/lib/mockData';
import { GENDER_LABELS, getOverallStatus, STATUS_CONFIG } from '@/lib/property';

export interface PropertyDetailProps {
  property: Property;
  isFavorite?: boolean;
  onFavoriteToggle?: (property: Property) => void;
  onClose: () => void;
}

export default function PropertyDetail({
  property,
  isFavorite = false,
  onFavoriteToggle,
  onClose,
}: PropertyDetailProps) {
  const [copied, setCopied] = useState(false);
  const status = getOverallStatus(property);
  const statusCfg = STATUS_CONFIG[status];
  const genderCfg = GENDER_LABELS[property.genderType];

  const handleShare = async () => {
    const url = `${window.location.origin}/peta?kos=${property.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback clipboard lama.
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <aside className="detail-panel" role="complementary" aria-label="Detail properti">
      <div className="detail-panel__header">
        <div className="detail-panel__header-top">
          <span
            className="property-card__status"
            style={{ color: statusCfg.color, background: statusCfg.bg }}
          >
            <span className="property-card__status-dot" style={{ background: statusCfg.color }} />
            {statusCfg.label}
          </span>
          <button
            id="close-detail-panel-btn"
            type="button"
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
          <span className="detail-panel__tag">
            {genderCfg.mark} {genderCfg.label}
          </span>
          <span className="detail-panel__tag">Darussalam, Banda Aceh</span>
        </div>
      </div>

      <div className="detail-panel__price-section">
        <span className="detail-panel__price-label">Mulai dari</span>
        <span className="detail-panel__price num">
          {formatPrice(property.priceMin)}
          <span className="detail-panel__price-unit">/bln</span>
        </span>
        {property.priceMax && (
          <span className="detail-panel__price-max num">
            s/d {formatPrice(property.priceMax)} /bln
          </span>
        )}
      </div>

      {property.description && (
        <div className="detail-panel__section">
          <h3 className="detail-panel__section-title">Deskripsi</h3>
          <p className="detail-panel__description">{property.description}</p>
        </div>
      )}

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

      {property.rooms && property.rooms.length > 0 && (
        <div className="detail-panel__section">
          <h3 className="detail-panel__section-title">Tipe Kamar</h3>
          {property.rooms.map((room) => {
            const roomStatus = STATUS_CONFIG[room.status];
            return (
              <div key={room.id} className="detail-panel__room-card">
                <div>
                  <span className="detail-panel__room-name">{room.name}</span>
                  <span className="detail-panel__room-status">
                    {room.availableUnits > 0
                      ? `${room.availableUnits} dari ${room.totalUnits} kamar tersisa`
                      : roomStatus.label}
                  </span>
                </div>
                <span className="detail-panel__room-price num">{formatPrice(room.price)}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="detail-panel__cta">
        <button
          id="save-property-btn"
          type="button"
          className="btn btn--ghost"
          onClick={() => onFavoriteToggle?.(property)}
          aria-pressed={isFavorite}
        >
          {isFavorite ? '♥ Tersimpan' : '♡ Simpan'}
        </button>
        <button
          id="share-property-btn"
          type="button"
          className="btn btn--primary"
          onClick={handleShare}
        >
          Bagikan
        </button>
      </div>
      {copied && (
        <p className="detail-panel__copied" role="status">
          Tautan kos ini disalin — buka tautan itu untuk langsung melihat detailnya.
        </p>
      )}
      <p className="detail-panel__sample">
        Data contoh untuk demo — nama, harga, dan ketersediaan di atas bukan listing sungguhan.
      </p>
    </aside>
  );
}
