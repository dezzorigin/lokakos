/**
 * src/types/property.ts
 * Type definitions untuk domain Properti LokaKos.
 *
 * Sejak PR #2 (dataset jujur, opsi B) data BUKAN contoh lagi: 208 kos nyata
 * Banda Aceh dari listing publik (data/kos.json). Karena sumber tidak selalu
 * lengkap, banyak field boleh null — dan null ditampilkan apa adanya di UI,
 * bukan diisi karangan. Lihat docs/data.md untuk skema dataset.
 */

export type GenderType = 'male' | 'female' | 'mixed' | 'unknown';
export type RoomStatus = 'available' | 'almost_full' | 'full' | 'unknown';
export type PricePeriod = 'monthly' | 'yearly';
/** Seberapa presisi koordinatnya: place (plus code sumber), street (alamat
 *  jalan via Nominatim), area (fallback nama area), null (tidak diketahui). */
export type CoordinateAccuracy = 'place' | 'street' | 'area' | null;

export interface Facility {
  id: number;
  name: string; // 'WiFi', 'AC', 'K. Mandi Dalam', dll
  icon?: string; // Nama icon Lucide
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;       // 'Kamar Standar', 'Kamar Premium'
  price: number;      // IDR/bulan
  totalUnits: number;
  availableUnits: number;
  status: RoomStatus;
}

export interface Property {
  id: string;
  name: string;
  description?: string;
  /** Alamat apa adanya dari sumber; bisa berupa nama area saja. */
  address: string;
  /** Area/kecamatan dari sumber, mis. 'Kopelma Darussalam'. */
  area?: string | null;
  /** null = koordinat tidak diketahui (kos tetap tampil di daftar, tidak di peta). */
  latitude: number | null;
  longitude: number | null;
  /** null = harga tidak tercantum di sumber. */
  priceMin: number | null; // IDR — lihat pricePeriod untuk periodenya
  priceMax?: number | null; // IDR — harga tertinggi (opsional)
  pricePeriod: PricePeriod;
  genderType: GenderType;
  thumbnailUrl?: string;
  imageUrls?: string[];
  facilities?: Facility[];
  rooms?: Room[];
  /** Catatan kamar/tipe dari sumber, mis. '16 kamar tersedia'. */
  roomsNote?: string | null;
  /** Nomor kontak publik dari listing sumber (bukan nomor relay platform). */
  contactPhone?: string | null;
  /** Nama sumber, mis. 'mamikos' / 'carialamat'. */
  source: string;
  /** URL listing sumber — setiap kos wajib tertelusur ke sini. */
  sourceUrl: string;
  /** Tanggal pengumpulan, format YYYY-MM-DD. */
  collectedAt: string;
  coordinateAccuracy?: CoordinateAccuracy;
  /** Plus code sumber kalau ada dan terverifikasi resolve ke Banda Aceh. */
  plusCode?: string | null;
  /** Ketersediaan kamar: 'unknown' untuk semua listing publik — sumber
   *  tidak memberi info ketersediaan yang bisa diverifikasi. */
  status: RoomStatus;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}
