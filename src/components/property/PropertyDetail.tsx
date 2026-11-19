'use client';

/**
 * src/components/property/PropertyDetail.tsx
 *
 * Panel detail properti — slide-in dari kanan saat marker / kartu diklik.
 * Dataset jujur (PR #2): setiap kos menampilkan SUMBERNYA (nama + tautan
 * listing asli + tanggal ambil). Field yang tidak ada di sumber ditampilkan
 * apa adanya ("tidak tercatat"), bukan diisi karangan.
 *
 * CTA yang benar-benar jalan:
 *  - "Simpan" -> favorit (localStorage), toggle.
 *  - "Bagikan" -> salin tautan /?kos=<id> ke clipboard (deep-link: membuka
 *    tautan itu langsung membuka detail kos ini).
 *  - "Hubungi" -> tel: ke nomor publik dari listing sumber (hanya muncul
 *    kalau sumber mencantumkan nomor; nomor relay platform TIDAK dipakai).
 */

import { useState } from 'react';
import type { Property } from '@/types/property';
import { formatPrice, pricePeriodLabel } from '@/lib/format';
import {
  ACCURACY_LABELS,
  GENDER_LABELS,
  getOverallStatus,
  STATUS_CONFIG,
} from '@/lib/property';

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
    const url = `${window.location.origin}/?kos=${property.id}`;
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
      {property.thumbnailUrl && (
        <div className="detail-panel__photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={property.thumbnailUrl} alt={`Foto ${property.name}`} loading="lazy" />
          <span className="detail-panel__photo-note">Foto dari listing sumber</span>
        </div>
      )}

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
          {property.area && <span className="detail-panel__tag">{property.area}</span>}
          {property.latitude == null && (
            <span className="detail-panel__tag">Lokasi belum terpetakan</span>
          )}
        </div>
      </div>

      <div className="detail-panel__price-section">
        {property.priceMin != null ? (
          <>
            <span className="detail-panel__price-label">Mulai dari</span>
            <span className="detail-panel__price num">
              {formatPrice(property.priceMin)}
              <span className="detail-panel__price-unit">
                {pricePeriodLabel(property.pricePeriod)}
              </span>
            </span>
            {property.priceMax && (
              <span className="detail-panel__price-max num">
                s/d {formatPrice(property.priceMax)} {pricePeriodLabel(property.pricePeriod)}
              </span>
            )}
            {property.pricePeriod === 'yearly' && (
              <span className="detail-panel__price-max">
                Harga tahunan dari sumber — bukan per bulan.
              </span>
            )}
          </>
        ) : (
          <>
            <span className="detail-panel__price-label">Harga</span>
            <span className="detail-panel__price detail-panel__price--none">
              Tidak tercatat di sumber
            </span>
            <span className="detail-panel__price-max">
              Listing sumber tidak mencantumkan harga — tanyakan langsung ke pemilik.
            </span>
          </>
        )}
      </div>

      {property.description && (
        <div className="detail-panel__section">
          <h3 className="detail-panel__section-title">Catatan harga</h3>
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

      {property.roomsNote && (
        <div className="detail-panel__section">
          <h3 className="detail-panel__section-title">Catatan kamar</h3>
          <p className="detail-panel__description">{property.roomsNote}</p>
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

      <div className="detail-panel__section detail-panel__source">
        <h3 className="detail-panel__section-title">Sumber data</h3>
        <p className="detail-panel__description">
          Data dari listing publik di <strong>{property.source}</strong>, dikumpulkan{' '}
          {property.collectedAt}. Harga dan ketersediaan bisa berubah — cek listing
          aslinya sebelum menghubungi.
        </p>
        <a
          className="detail-panel__source-link"
          href={property.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Lihat listing asli di {property.source} ↗
        </a>
        {property.coordinateAccuracy && (
          <p className="detail-panel__accuracy">
            {ACCURACY_LABELS[property.coordinateAccuracy] ?? ''}
          </p>
        )}
      </div>

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
        {property.contactPhone ? (
          <a
            id="call-property-btn"
            className="btn btn--primary"
            href={`tel:${property.contactPhone.replace(/[^+0-9]/g, '')}`}
          >
            Hubungi {property.contactPhone}
          </a>
        ) : (
          <button
            id="share-property-btn"
            type="button"
            className="btn btn--primary"
            onClick={handleShare}
          >
            Bagikan
          </button>
        )}
      </div>
      {property.contactPhone && (
        <div className="detail-panel__cta detail-panel__cta--second">
          <button
            id="share-property-btn"
            type="button"
            className="btn btn--ghost"
            onClick={handleShare}
          >
            Bagikan
          </button>
        </div>
      )}
      {copied && (
        <p className="detail-panel__copied" role="status">
          Tautan kos ini disalin — buka tautan itu untuk langsung melihat detailnya.
        </p>
      )}
      {property.contactPhone ? (
        <p className="detail-panel__sample">
          Nomor di atas tercantum publik di listing sumber. LokaKos tidak memverifikasi
          nomor pemilik secara independen.
        </p>
      ) : (
        <p className="detail-panel__sample">
          Listing sumber tidak mencantumkan nomor kontak — hubungi lewat tautan listing
          asli di atas.
        </p>
      )}
    </aside>
  );
}
