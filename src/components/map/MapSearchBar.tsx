'use client';

/**
 * src/components/map/MapSearchBar.tsx
 *
 * Search bar mengambang di atas peta — controlled: nilai + submit diteruskan
 * ke halaman, yang memfilter daftar + marker (lihat src/lib/filter.ts).
 * Sebelum restructure, `onSearch` tidak pernah dipasangkan di page.tsx.
 */

import { useRef, useState } from 'react';

export interface MapSearchBarProps {
  value?: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function MapSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Cari nama kos atau jalan di Darussalam…',
}: MapSearchBarProps) {
  const [inner, setInner] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = value ?? inner;
  const setQuery = (v: string) => {
    if (onChange) onChange(v);
    else setInner(v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch?.(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className={`map-searchbar${isFocused ? ' map-searchbar--focused' : ''}`}>
      <form
        className="map-searchbar__form"
        onSubmit={handleSubmit}
        role="search"
        aria-label="Cari properti kos"
      >
        <span className="map-searchbar__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <input
          ref={inputRef}
          id="map-search-input"
          type="text"
          className="map-searchbar__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          aria-label="Ketik nama atau lokasi kos"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            type="button"
            id="map-search-clear-btn"
            className="map-searchbar__clear"
            onClick={handleClear}
            aria-label="Hapus pencarian"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          id="map-search-submit-btn"
          className="map-searchbar__submit"
          aria-label="Cari"
        >
          Cari
        </button>
      </form>
    </div>
  );
}
