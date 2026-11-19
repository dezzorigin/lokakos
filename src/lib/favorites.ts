/**
 * src/lib/favorites.ts
 * Favorit kos — disimpan di localStorage (tanpa akun, tanpa backend).
 * "Masuk / Daftar" di navbar lama dihapus karena tidak ada auth sama sekali;
 * favorit lokal adalah pengganti yang benar-benar jalan.
 */

import { useCallback, useEffect, useState } from 'react';

const KEY = 'lokakos:favorites:v1';

function readStored(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr: unknown = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => readStored());

  // Sinkron saat tab lain mengubah favorit yang sama.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setFavorites(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        // localStorage penuh / privat — favorit tetap jalan di memori sesi ini.
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, toggle, isFavorite };
}
