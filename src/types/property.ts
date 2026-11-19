/**
 * src/types/property.ts
 * Type definitions untuk domain Properti LokaKos.
 */

export type GenderType = 'male' | 'female' | 'mixed';
export type RoomStatus = 'available' | 'almost_full' | 'full';

export interface Facility {
  id: number;
  name: string; // 'WiFi', 'AC', 'Kamar Mandi Dalam', dll
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
  address: string;
  latitude: number;
  longitude: number;
  priceMin: number;   // IDR/bulan — harga terendah
  priceMax?: number;  // IDR/bulan — harga tertinggi (opsional)
  genderType: GenderType;
  thumbnailUrl?: string;
  imageUrls?: string[];
  facilities?: Facility[];
  rooms?: Room[];
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}
