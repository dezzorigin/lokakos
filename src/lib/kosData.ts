/**
 * src/lib/kosData.ts
 * Dataset JUJUR LokaKos (PR #2, opsi B) — 208 kos Banda Aceh dari listing
 * publik, dikumpulkan 19 Nov 2026 (lihat data/kos.json + scripts/collect/).
 *
 * Setiap entri tertelusur ke URL sumbernya (sourceUrl). Field yang tidak ada
 * di sumber = null dan ditampilkan apa adanya — JANGAN pernah mengisi
 * karangan di lapisan ini.
 */

import raw from '../../data/kos.json';
import type { Facility, GenderType, Property } from '@/types/property';

interface RawKos {
  id: string;
  name: string;
  address: string | null;
  area: string | null;
  facilities: string[] | null;
  gender: 'male' | 'female' | 'mixed' | null;
  phone: string | null;
  photo_url: string | null;
  price_min: number | null;
  price_max: number | null;
  price_period: 'monthly' | 'yearly';
  price_note: string | null;
  rooms_note: string | null;
  source: string;
  source_url: string;
  collected_at: string;
  status: 'unknown';
  lat: number | null;
  lon: number | null;
  coordinate_accuracy: 'place' | 'street' | 'area' | null;
  plus_code: string | null;
}

const DATASET = raw as unknown as {
  meta: { collected_at: string; sources: string[]; method: string; note: string };
  count: number;
  kos: RawKos[];
};

function toFacilityNames(names: string[] | null): Facility[] {
  return (names ?? []).map((name, i) => ({ id: i + 1, name }));
}

function toProperty(k: RawKos): Property {
  return {
    id: k.id,
    name: k.name,
    description: k.price_note ?? undefined,
    address: k.address ?? k.area ?? 'Alamat tidak tercatat di sumber',
    area: k.area,
    latitude: k.lat,
    longitude: k.lon,
    priceMin: k.price_min,
    priceMax: k.price_max,
    pricePeriod: k.price_period,
    genderType: (k.gender ?? 'unknown') as GenderType,
    thumbnailUrl: k.photo_url ?? undefined,
    facilities: toFacilityNames(k.facilities),
    roomsNote: k.rooms_note,
    contactPhone: k.phone,
    source: k.source,
    sourceUrl: k.source_url,
    collectedAt: k.collected_at,
    coordinateAccuracy: k.coordinate_accuracy,
    plusCode: k.plus_code,
    status: 'unknown',
    isPublished: true,
  };
}

/** Seluruh dataset sebagai Property[] — urutan sesuai data/kos.json. */
export const KOS_PROPERTIES: Property[] = DATASET.kos.map(toProperty);

/** Metadata pengumpulan (tanggal, sumber, metode) — tampil di UI. */
export const DATASET_META = DATASET.meta;
export const DATASET_COUNT = DATASET.count;

/** Kos yang punya koordinat (bisa tampil sebagai marker peta). */
export const GEOCODED_PROPERTIES: Property[] = KOS_PROPERTIES.filter(
  (p) => p.latitude != null && p.longitude != null,
);

/** Daftar area unik, urut dari yang kosnya terbanyak — untuk filter area. */
export const AREAS: string[] = (() => {
  const counts = new Map<string, number>();
  for (const p of KOS_PROPERTIES) {
    if (p.area) counts.set(p.area, (counts.get(p.area) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'id'))
    .map(([area]) => area);
})();

/** Statistik jujur dari dataset — semua angka dihitung, bukan ditulis tangan. */
export const DATASET_STATS = {
  total: KOS_PROPERTIES.length,
  withPrice: KOS_PROPERTIES.filter((p) => p.priceMin != null).length,
  withPhone: KOS_PROPERTIES.filter((p) => p.contactPhone).length,
  withCoords: GEOCODED_PROPERTIES.length,
  withPhoto: KOS_PROPERTIES.filter((p) => p.thumbnailUrl).length,
  minMonthlyPrice: Math.min(
    ...KOS_PROPERTIES.filter(
      (p) => p.priceMin != null && p.pricePeriod === 'monthly',
    ).map((p) => p.priceMin as number),
  ),
  byGender: {
    female: KOS_PROPERTIES.filter((p) => p.genderType === 'female').length,
    male: KOS_PROPERTIES.filter((p) => p.genderType === 'male').length,
    mixed: KOS_PROPERTIES.filter((p) => p.genderType === 'mixed').length,
    unknown: KOS_PROPERTIES.filter((p) => p.genderType === 'unknown').length,
  },
  bySource: DATASET.meta.sources.map((s) => ({
    source: s,
    count: KOS_PROPERTIES.filter((p) => p.source === s).length,
  })),
};
