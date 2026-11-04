'use client';

/**
 * src/components/map/MapSearchBar.tsx
 *
 * Search bar mengambang di atas peta — top-center overlay.
 * Phase 1: statis, belum terhubung ke backend.
 * Phase 5: akan memicu full-text search ke Supabase.
 *
 * ATURAN WAJIB (PLANNER.md §6): harus 'use client'.
 */

import { useState, useRef } from 'react';

// ─── Props ────────────────────────────────────────────────────────────────────
export interface MapSearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  /** Callback ketika user submit pencarian (Enter / klik ikon) */
  onSearch?: (query: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MapSearchBar({
  placeholder = 'Cari kos di Darussalam, Banda Aceh…',
  onSearch,
}: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <>
      <div className={`map-searchbar${isFocused ? ' map-searchbar--focused' : ''}`}>
        <form
          className="map-searchbar__form"
          onSubmit={handleSubmit}
          role="search"
          aria-label="Cari properti kos"
        >
          {/* Ikon Search */}
          <span className="map-searchbar__icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle
                cx="9"
                cy="9"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M13.5 13.5L17 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>

          {/* Input */}
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

          {/* Clear button — tampil saat ada query */}
          {query && (
            <button
              type="button"
              id="map-search-clear-btn"
              className="map-searchbar__clear"
              onClick={handleClear}
              aria-label="Hapus pencarian"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2 2L10 10M10 2L2 10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {/* Search submit button */}
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

      <style>{`
        /* ── Search Bar Wrapper ── */
        .map-searchbar {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 20;
          width: min(480px, calc(100% - 120px));
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          box-shadow:
            0 4px 16px rgba(15, 23, 42, 0.1),
            0 1px 4px rgba(15, 23, 42, 0.06);
          transition: box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease;
        }

        .map-searchbar--focused {
          border-color: #a5b4fc;
          box-shadow:
            0 8px 32px rgba(99, 102, 241, 0.18),
            0 2px 8px rgba(15, 23, 42, 0.08);
          transform: translateX(-50%) translateY(-1px);
        }

        /* ── Form Row ── */
        .map-searchbar__form {
          display: flex;
          align-items: center;
          padding: 0 6px 0 14px;
          gap: 8px;
          height: 46px;
        }

        /* ── Search Icon ── */
        .map-searchbar__icon {
          display: flex;
          align-items: center;
          color: #94a3b8;
          flex-shrink: 0;
          transition: color 200ms ease;
        }

        .map-searchbar--focused .map-searchbar__icon {
          color: #6366f1;
        }

        /* ── Input ── */
        .map-searchbar__input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          font-weight: 450;
          color: #0f172a;
          font-family: inherit;
          min-width: 0;
        }

        .map-searchbar__input::placeholder {
          color: #cbd5e1;
          font-weight: 400;
        }

        /* ── Clear Button ── */
        .map-searchbar__clear {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: none;
          background: #f1f5f9;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 150ms ease, color 150ms ease;
          padding: 0;
        }

        .map-searchbar__clear:hover {
          background: #fee2e2;
          color: #f43f5e;
        }

        /* ── Submit Button ── */
        .map-searchbar__submit {
          padding: 7px 16px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: opacity 150ms ease, transform 150ms ease, box-shadow 150ms ease;
          font-family: inherit;
          letter-spacing: 0.01em;
        }

        .map-searchbar__submit:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        .map-searchbar__submit:active {
          transform: translateY(0);
          opacity: 1;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .map-searchbar {
            top: 12px;
            width: calc(100% - 32px);
          }
        }
      `}</style>
    </>
  );
}
