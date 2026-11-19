/**
 * src/lib/mockData.ts
 * Data CONTOH properti — sebelum Supabase terintegrasi.
 * Semua koordinat berada di area Universitas Syiah Kuala (Darussalam), Banda Aceh.
 * Nama, alamat, harga, dan ketersediaan di file ini adalah CONTOH untuk demo
 * (dilabeli "data contoh" di UI) — bukan listing sungguhan.
 */

import { Property } from '@/types/property';

/**
 * Helper: format harga IDR ke label singkat untuk marker
 * Contoh: 1200000 → "1.2Jt"
 */
export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(1).replace('.0', '')}Jt`;
  }
  return `${(price / 1_000).toFixed(0)}Rb`;
}

/**
 * Format harga lengkap ke format IDR
 * Contoh: 1200000 → "Rp 1.200.000"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/** Total kamar tersedia di seluruh data contoh — dipakai angka hero (angka asli, bukan vanity). */
export function totalAvailableRooms(properties: Property[]): number {
  return properties.reduce(
    (n, p) => n + (p.rooms ?? []).reduce((m, r) => m + r.availableUnits, 0),
    0,
  );
}

export const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-001',
    name: 'Kos Putri Darussalam Indah',
    description:
      'Kos eksklusif khusus putri dengan suasana asri, dekat Gerbang Utama Unsyiah. Kamar bersih, aman, dan nyaman.',
    address: 'Jl. T. Nyak Arief No. 12, Darussalam, Banda Aceh',
    latitude: 5.5710,
    longitude: 95.3680,
    priceMin: 800_000,
    priceMax: 1_200_000,
    genderType: 'female',
    thumbnailUrl: undefined,
    facilities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 2, name: 'AC', icon: 'air-vent' },
      { id: 3, name: 'Kamar Mandi Dalam', icon: 'shower-head' },
      { id: 5, name: 'Dapur Bersama', icon: 'utensils' },
    ],
    rooms: [
      {
        id: 'room-001a',
        propertyId: 'prop-001',
        name: 'Kamar Standar',
        price: 800_000,
        totalUnits: 8,
        availableUnits: 3,
        status: 'available',
      },
      {
        id: 'room-001b',
        propertyId: 'prop-001',
        name: 'Kamar Premium (AC)',
        price: 1_200_000,
        totalUnits: 4,
        availableUnits: 1,
        status: 'almost_full',
      },
    ],
    isPublished: true,
  },
  {
    id: 'prop-002',
    name: 'Kos Putra Grand Kopelma',
    description:
      'Kos putra strategis di jantung Kopelma Darussalam, 5 menit jalan kaki ke FKIP Unsyiah. Lingkungan aman & 24 jam.',
    address: 'Jl. Hamzah Fansuri No. 3, Kopelma Darussalam, Banda Aceh',
    latitude: 5.5675,
    longitude: 95.3710,
    priceMin: 600_000,
    priceMax: 900_000,
    genderType: 'male',
    thumbnailUrl: undefined,
    facilities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 4, name: 'Parkir Motor', icon: 'bike' },
      { id: 5, name: 'Dapur Bersama', icon: 'utensils' },
    ],
    rooms: [
      {
        id: 'room-002a',
        propertyId: 'prop-002',
        name: 'Kamar Standar Fan',
        price: 600_000,
        totalUnits: 10,
        availableUnits: 0,
        status: 'full',
      },
      {
        id: 'room-002b',
        propertyId: 'prop-002',
        name: 'Kamar AC',
        price: 900_000,
        totalUnits: 6,
        availableUnits: 4,
        status: 'available',
      },
    ],
    isPublished: true,
  },
  {
    id: 'prop-003',
    name: 'Kos Campur Nusa Indah',
    description:
      'Kos mixed gender dengan fasilitas lengkap. Dekat Fakultas Teknik dan Rumah Sakit Unsyiah. Cocok untuk mahasiswa dan karyawan.',
    address: 'Jl. Syech Abdurrauf No. 7, Darussalam, Banda Aceh',
    latitude: 5.5698,
    longitude: 95.3655,
    priceMin: 700_000,
    priceMax: 1_100_000,
    genderType: 'mixed',
    thumbnailUrl: undefined,
    facilities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 2, name: 'AC', icon: 'air-vent' },
      { id: 3, name: 'Kamar Mandi Dalam', icon: 'shower-head' },
      { id: 4, name: 'Parkir Motor', icon: 'bike' },
      { id: 6, name: 'Laundry', icon: 'washing-machine' },
    ],
    rooms: [
      {
        id: 'room-003a',
        propertyId: 'prop-003',
        name: 'Kamar Standar',
        price: 700_000,
        totalUnits: 12,
        availableUnits: 5,
        status: 'available',
      },
      {
        id: 'room-003b',
        propertyId: 'prop-003',
        name: 'Kamar Deluxe (AC + KM Dalam)',
        price: 1_100_000,
        totalUnits: 6,
        availableUnits: 2,
        status: 'almost_full',
      },
    ],
    isPublished: true,
  },
  {
    id: 'prop-004',
    name: 'Kos Putri Al-Ikhlas',
    description:
      'Kos bernuansa Islami khusus putri, dekat Masjid Unsyiah dan FEB. Lingkungan tenang, ada ruang belajar bersama.',
    address: 'Jl. Teuku Daud Beureueh No. 21, Darussalam, Banda Aceh',
    latitude: 5.5720,
    longitude: 95.3720,
    priceMin: 650_000,
    genderType: 'female',
    thumbnailUrl: undefined,
    facilities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 5, name: 'Dapur Bersama', icon: 'utensils' },
      { id: 7, name: 'Ruang Belajar', icon: 'book-open' },
    ],
    rooms: [
      {
        id: 'room-004a',
        propertyId: 'prop-004',
        name: 'Kamar Standar Fan',
        price: 650_000,
        totalUnits: 8,
        availableUnits: 2,
        status: 'almost_full',
      },
    ],
    isPublished: true,
  },
  {
    id: 'prop-005',
    name: 'Kos Putra Darussalam Residence',
    description:
      'Kos putra dua lantai di jalan utama Darussalam, 3 menit ke Gerbang Unsyiah. Parkir luas, ada penjaga malam.',
    address: 'Jl. T. Nyak Arief No. 88, Darussalam, Banda Aceh',
    latitude: 5.5688,
    longitude: 95.3668,
    priceMin: 750_000,
    priceMax: 1_100_000,
    genderType: 'male',
    thumbnailUrl: undefined,
    facilities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 2, name: 'AC', icon: 'air-vent' },
      { id: 4, name: 'Parkir Motor', icon: 'bike' },
    ],
    rooms: [
      {
        id: 'room-005a',
        propertyId: 'prop-005',
        name: 'Kamar Standar',
        price: 750_000,
        totalUnits: 6,
        availableUnits: 2,
        status: 'almost_full',
      },
      {
        id: 'room-005b',
        propertyId: 'prop-005',
        name: 'Kamar AC',
        price: 1_100_000,
        totalUnits: 4,
        availableUnits: 3,
        status: 'available',
      },
    ],
    isPublished: true,
  },
  {
    id: 'prop-006',
    name: 'Kos Putri Meurah Silu',
    description:
      'Kos putri premium dekat Syech Abdurrauf, kamar luas dengan KM dalam dan laundry. Cocok untuk mahasiswi pascasarjana.',
    address: 'Jl. Syech Abdurrauf No. 31, Darussalam, Banda Aceh',
    latitude: 5.5705,
    longitude: 95.37,
    priceMin: 900_000,
    priceMax: 1_500_000,
    genderType: 'female',
    thumbnailUrl: undefined,
    facilities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 2, name: 'AC', icon: 'air-vent' },
      { id: 3, name: 'Kamar Mandi Dalam', icon: 'shower-head' },
      { id: 6, name: 'Laundry', icon: 'washing-machine' },
    ],
    rooms: [
      {
        id: 'room-006a',
        propertyId: 'prop-006',
        name: 'Kamar Standar',
        price: 900_000,
        totalUnits: 10,
        availableUnits: 6,
        status: 'available',
      },
      {
        id: 'room-006b',
        propertyId: 'prop-006',
        name: 'Kamar Premium',
        price: 1_500_000,
        totalUnits: 4,
        availableUnits: 0,
        status: 'full',
      },
    ],
    isPublished: true,
  },
  {
    id: 'prop-007',
    name: 'Kos Campur Lamgugob Homey',
    description:
      'Kos campur suasana rumahan di Lamgugob, dekat warung dan laundry. Harga paling ramah di daftar ini.',
    address: 'Jl. Lamgugob No. 5, Darussalam, Banda Aceh',
    latitude: 5.566,
    longitude: 95.374,
    priceMin: 550_000,
    priceMax: 800_000,
    genderType: 'mixed',
    thumbnailUrl: undefined,
    facilities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 4, name: 'Parkir Motor', icon: 'bike' },
      { id: 5, name: 'Dapur Bersama', icon: 'utensils' },
    ],
    rooms: [
      {
        id: 'room-007a',
        propertyId: 'prop-007',
        name: 'Kamar Standar Fan',
        price: 550_000,
        totalUnits: 8,
        availableUnits: 1,
        status: 'almost_full',
      },
      {
        id: 'room-007b',
        propertyId: 'prop-007',
        name: 'Kamar Standar',
        price: 800_000,
        totalUnits: 5,
        availableUnits: 5,
        status: 'available',
      },
    ],
    isPublished: true,
  },
  {
    id: 'prop-008',
    name: 'Kos Putri Krueng Raya',
    description:
      'Kos putri tenang di ujung Krueng Raya, ada ruang belajar bersama dan dapur bersih. Jalan kaki ke kampus 10 menit.',
    address: 'Jl. Krueng Raya No. 14, Darussalam, Banda Aceh',
    latitude: 5.5735,
    longitude: 95.367,
    priceMin: 1_000_000,
    genderType: 'female',
    thumbnailUrl: undefined,
    facilities: [
      { id: 1, name: 'WiFi', icon: 'wifi' },
      { id: 2, name: 'AC', icon: 'air-vent' },
      { id: 3, name: 'Kamar Mandi Dalam', icon: 'shower-head' },
      { id: 7, name: 'Ruang Belajar', icon: 'book-open' },
    ],
    rooms: [
      {
        id: 'room-008a',
        propertyId: 'prop-008',
        name: 'Kamar AC',
        price: 1_000_000,
        totalUnits: 6,
        availableUnits: 4,
        status: 'available',
      },
    ],
    isPublished: true,
  },
];
