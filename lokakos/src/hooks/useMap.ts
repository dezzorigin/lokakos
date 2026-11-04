'use client';

/**
 * src/hooks/useMap.ts
 *
 * Custom hook untuk state management peta LokaKos.
 * Menyimpan: viewState peta dan selectedProperty.
 *
 * ATURAN WAJIB (PLANNER.md §6): harus 'use client' karena menggunakan React hooks.
 *
 * Catatan Phase 1: Menggunakan mock data (MOCK_PROPERTIES).
 * Di Phase 3, selectedProperty dapat diisi dari data Supabase.
 */

import { useState, useCallback } from 'react';
import type { Property } from '@/types/property';
import type { ViewState } from '@/types/map';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/mapbox/config';

// ─── Default viewState ────────────────────────────────────────────────────────
const DEFAULT_VIEW_STATE: ViewState = {
  longitude: DEFAULT_CENTER[0],
  latitude: DEFAULT_CENTER[1],
  zoom: DEFAULT_ZOOM,
  bearing: 0,
  pitch: 0,
};

// ─── Hook Return Type ─────────────────────────────────────────────────────────
export interface UseMapReturn {
  /** State viewport peta (longitude, latitude, zoom, bearing, pitch) */
  viewState: ViewState;
  /** Update viewport — dipanggil oleh onMove event dari Map */
  setViewState: (vs: ViewState) => void;
  /** Properti yang sedang dipilih (dari klik marker atau list) */
  selectedProperty: Property | null;
  /** Pilih properti — null untuk deselect */
  selectProperty: (property: Property | null) => void;
  /** Reset semua state ke default */
  resetMap: () => void;
}

// ─── useMap Hook ──────────────────────────────────────────────────────────────
export function useMap(): UseMapReturn {
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const selectProperty = useCallback((property: Property | null) => {
    setSelectedProperty(property);
  }, []);

  const resetMap = useCallback(() => {
    setSelectedProperty(null);
    setViewState(DEFAULT_VIEW_STATE);
  }, []);

  return {
    viewState,
    setViewState,
    selectedProperty,
    selectProperty,
    resetMap,
  };
}
