/**
 * src/types/map.ts
 * Type definitions untuk state peta LokaKos.
 */

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface MapMarker {
  id: string;
  longitude: number;
  latitude: number;
  /** Label yang ditampilkan di marker (biasanya harga singkat, e.g. "1.2Jt") */
  label: string;
  /** ID properti yang direpresentasikan marker ini */
  propertyId: string;
}
