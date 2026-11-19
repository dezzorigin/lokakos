'use client';

/**
 * src/components/layout/Navbar.tsx
 *
 * Navbar LokaKos. Tidak ada tombol Masuk / Daftar — tidak ada auth di
 * aplikasi ini, dan tombol yang tidak ke mana-mana adalah cacat produk.
 * Yang ada: navigasi nyata (rute / dan /tentang), logo GitHub di kanan
 * yang menaut ke repo, dan CTA "Buka Daftar Kos".
 */

import Link from 'next/link';

const GITHUB_URL = 'https://github.com/dezzorigin/lokakos';

function PinMark() {
  return (
    <svg
      className="navbar__mark"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 2C9.9 2 5 6.9 5 13c0 8.5 11 17 11 17s11-8.5 11-17C27 6.9 22.1 2 16 2Z"
        fill="#E9B44C"
        stroke="#1E3A34"
        strokeWidth="2"
      />
      <circle cx="16" cy="13" r="4.5" fill="#1E3A34" />
      <circle cx="16" cy="13" r="1.8" fill="#FAF6EE" />
    </svg>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export default function Navbar({ compact = false }: { compact?: boolean }) {
  return (
    <header className={`navbar${compact ? ' navbar--app' : ''}`} role="banner">
      <Link className="navbar__brand" href="/" aria-label="LokaKos — beranda">
        <PinMark />
        <span className="navbar__wordmark">LokaKos</span>
      </Link>
      <nav className="navbar__nav" aria-label="Navigasi utama">
        <Link className="navbar__link" href="/">
          Daftar Kos
        </Link>
        <Link className="navbar__link" href="/tentang">
          Tentang
        </Link>
        <Link className="navbar__link" href="/tentang#cara-kerja">
          Cara Kerja
        </Link>
      </nav>
      <span className="navbar__spacer" />
      <a
        className="navbar__github"
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Lihat kode sumber LokaKos di GitHub"
      >
        <GithubMark />
        <span>GitHub</span>
      </a>
      <Link className="navbar__cta" href="/">
        Buka Daftar Kos
      </Link>
    </header>
  );
}
