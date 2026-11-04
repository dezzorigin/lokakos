'use client';

/**
 * src/components/layout/Navbar.tsx
 *
 * Komponen navbar minimal untuk halaman utama LokaKos.
 * Berisi brand, tagline, dan tombol aksi (Masuk / Daftar Gratis).
 */

export default function Navbar() {
  return (
    <>
      <header className="navbar" role="banner">
        <div className="navbar__brand">
          <span className="navbar__logo">📍</span>
          <span className="navbar__wordmark">LokaKos</span>
        </div>
        <p className="navbar__tagline">Temukan kos di Banda Aceh — langsung di peta</p>
        <div className="navbar__actions">
          <button id="navbar-login-btn" className="navbar__btn navbar__btn--ghost">
            Masuk
          </button>
          <button id="navbar-register-btn" className="navbar__btn navbar__btn--accent">
            Daftar Gratis
          </button>
        </div>
      </header>

      <style>{`
        /* ── Navbar ── */
        .navbar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 20px;
          height: 56px;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          flex-shrink: 0;
          z-index: 20;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
        }

        .navbar__brand {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .navbar__logo {
          font-size: 20px;
          line-height: 1;
        }

        .navbar__wordmark {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
        }

        .navbar__tagline {
          font-size: 13px;
          color: #64748b;
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .navbar__actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .navbar__btn {
          padding: 7px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
          border: none;
          font-family: inherit;
        }

        .navbar__btn--ghost {
          background: transparent;
          color: #475569;
          border: 1px solid #cbd5e1;
        }

        .navbar__btn--ghost:hover {
          background: #f1f5f9;
          color: #0f172a;
          border-color: #94a3b8;
        }

        .navbar__btn--accent {
          background: #6366f1;
          color: #ffffff;
        }

        .navbar__btn--accent:hover {
          background: #818cf8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        @media (max-width: 640px) {
          .navbar__tagline { display: none; }
        }
      `}</style>
    </>
  );
}
