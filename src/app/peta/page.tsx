'use client';

/**
 * src/app/peta/page.tsx — Redirect /peta -> / (PR #2).
 *
 * Sejak PR #2, explorer penuh tinggal di `/`. Rute lama /peta dipertahankan
 * sebagai redirect supaya tautan lama (termasuk deep-link /peta?kos=<id>
 * yang sudah dibagikan) tetap jalan.
 *
 * Kenapa redirect klien, bukan `redirects` di next.config / `redirect()`?
 * Proyek ini static export (`output: 'export'`, lihat next.config.ts) dan
 * `redirects` termasuk fitur yang TIDAK didukung static export (lihat
 * node_modules/next/dist/docs/01-app/02-guides/static-exports.md).
 * Jadi: baca ?kos= di klien, router.replace ke / dengan param yang sama,
 * plus tautan fallback kalau JavaScript mati.
 *
 * useSearchParams wajib di dalam <Suspense> pada route prerender — lihat
 * node_modules/next/dist/docs/.../use-search-params.md.
 */

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function PetaRedirector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kos = searchParams.get('kos');
  const target = kos ? `/?kos=${encodeURIComponent(kos)}` : '/';

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return (
    <main className="peta-redirect">
      <p>Peta sudah pindah ke beranda.</p>
      <p>
        <Link href={target}>Buka daftar kos</Link>
      </p>
    </main>
  );
}

export default function PetaPage() {
  return (
    <Suspense
      fallback={
        <main className="peta-redirect">
          <p>Peta sudah pindah ke beranda.</p>
          <p>
            <Link href="/">Buka daftar kos</Link>
          </p>
        </main>
      }
    >
      <PetaRedirector />
    </Suspense>
  );
}
