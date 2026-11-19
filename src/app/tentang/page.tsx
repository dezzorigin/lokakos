'use client';

/**
 * src/app/tentang/page.tsx — Landing LokaKos (dulu `/`, pindah ke sini di PR #2).
 *
 * Sejak PR #2, `/` langsung membuka explorer penuh; halaman ini hanya
 * perkenalan: hero editorial + peta hidup, stepper cara kerja, contoh
 * daftar kos, strip fitur, footer. Semua angka dihitung dari dataset nyata
 * (data/kos.json) — tanpa statistik vanity.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MapContainer from '@/components/map/MapContainer';
import PropertyCard from '@/components/property/PropertyCard';
import { DATASET_META, DATASET_STATS, GEOCODED_PROPERTIES, KOS_PROPERTIES } from '@/lib/kosData';
import { formatPrice } from '@/lib/format';
import { useFavorites } from '@/lib/favorites';

/** 6 kos termurah (harga bulanan) sebagai contoh daftar di landing. */
const SAMPLE = [...KOS_PROPERTIES]
  .filter((p) => p.priceMin != null && p.pricePeriod === 'monthly')
  .sort((a, b) => (a.priceMin as number) - (b.priceMin as number))
  .slice(0, 6);

const FEATURES = [
  {
    title: 'Peta yang tidak butuh kunci API',
    body: 'Tile OpenStreetMap via Leaflet — tidak ada token, tidak ada tagihan, peta tetap jalan di halaman live.',
  },
  {
    title: 'Data dari listing publik yang nyata',
    body: 'Setiap kos tertelusur ke listing aslinya — nama sumber, tautan, dan tanggal ambil tercantum di detail tiap kos. Yang tidak ada di sumber, ditulis tidak ada.',
  },
  {
    title: 'Filter yang benar-benar menyaring',
    body: 'Area, harga, fasilitas, dan tipe kos memfilter daftar dan marker peta sekaligus. Bukan chip pajangan.',
  },
  {
    title: 'Favorit tersimpan di perangkatmu',
    body: 'Ketuk hati di kartu mana pun; daftar favoritmu tetap ada saat kembali, tanpa akun dan tanpa daftar.',
  },
  {
    title: 'Bagikan tautan satu kos',
    body: 'Setiap kos punya tautan /?kos=… — yang menerima langsung melihat detail kos itu, bukan beranda.',
  },
];

export default function TentangPage() {
  const router = useRouter();
  const { favorites, toggle, isFavorite } = useFavorites();

  const openInMap = (id: string) => router.push(`/?kos=${id}`);

  return (
    <div className="landing">
      <Navbar />

      <main>
        {/* ── Hero: editorial kiri, peta hidup kanan ── */}
        <div className="landing__wrap">
          <section className="hero" aria-label="Perkenalan LokaKos">
            <div>
              <span className="hero__eyebrow">Peta kos · Banda Aceh</span>
              <h1>Cari kos sambil lihat petanya.</h1>
              <p className="hero__sub">
                LokaKos menaruh peta di depan: tiap karcis kuning di peta adalah satu kos
                di Banda Aceh, lengkap dengan harga dan sumber listingnya. Klik,
                bandingkan, simpan yang cocok.
              </p>
              <div className="hero__actions">
                <Link className="btn btn--primary" href="/">
                  Buka Daftar Kos
                </Link>
                <Link className="btn btn--ghost" href="#daftar">
                  Lihat Contoh Kos
                </Link>
              </div>
              <div className="hero__stats" aria-label="Ringkasan data">
                <div className="hero__stat">
                  <div className="hero__stat-num num">{DATASET_STATS.total}</div>
                  <div className="hero__stat-label">kos terdaftar</div>
                </div>
                <div className="hero__stat">
                  <div className="hero__stat-num num">{formatPrice(DATASET_STATS.minMonthlyPrice)}</div>
                  <div className="hero__stat-label">harga mulai /bln</div>
                </div>
                <div className="hero__stat">
                  <div className="hero__stat-num num">{DATASET_STATS.withPhone}</div>
                  <div className="hero__stat-label">kos dengan kontak publik</div>
                </div>
              </div>
              <p className="hero__sample-note">
                Angka di atas dihitung dari dataset listing publik — diperbarui{' '}
                {DATASET_META.collected_at}. Bukan klaim pengguna atau properti fiktif.
              </p>
            </div>

            <div className="hero__map" role="region" aria-label="Peta kos Banda Aceh">
              <MapContainer
                properties={GEOCODED_PROPERTIES}
                onMarkerNavigate={(p) => openInMap(p.id)}
              />
              <div className="hero__map-caption">
                <span className="dot" aria-hidden="true" />
                Peta live — klik karcis harga untuk membuka kos di daftar penuh
              </div>
            </div>
          </section>
        </div>

        {/* ── Cara kerja: stepper, bukan 3 kartu ── */}
        <div className="landing__wrap">
          <section className="steps" id="cara-kerja" aria-label="Cara kerja">
            <h2 className="steps__title">Dari peta sampai kos yang cocok</h2>
            <p className="steps__intro">
              Tiga langkah, semuanya di satu layar peta. Tidak ada formulir, tidak ada akun.
            </p>
            <ol className="steps__list">
              <li className="steps__item">
                <span className="steps__num">Langkah 1</span>
                <h3>Lihat peta</h3>
                <p>
                  Karcis kuning menunjukkan harga mulai tiap kos. Kos tanpa harga di
                  sumber berkarcis tanda tanya — bukan harga karangan.
                </p>
              </li>
              <li className="steps__item">
                <span className="steps__num">Langkah 2</span>
                <h3>Saring yang cocok</h3>
                <p>
                  Pilih area, rentang harga, fasilitas, dan tipe kos — putra, putri,
                  atau campur. Daftar dan peta menyaring bersamaan.
                </p>
              </li>
              <li className="steps__item">
                <span className="steps__num">Langkah 3</span>
                <h3>Simpan dan bagikan</h3>
                <p>
                  Simpan kos incaran ke favorit, lalu bagikan tautannya ke teman sekamar.
                  Tautan itu membuka langsung detail kosnya.
                </p>
              </li>
            </ol>
          </section>
        </div>

        {/* ── Contoh daftar kos ── */}
        <div className="landing__wrap">
          <section className="listing" id="daftar" aria-label="Contoh daftar kos">
            <div className="listing__head">
              <h2>Kos termurah di daftar</h2>
              <p>
                {SAMPLE.length} kos termurah dari {DATASET_STATS.total} kos — klik kartu
                untuk membukanya di daftar penuh.
              </p>
            </div>
            <div className="listing__grid">
              {SAMPLE.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavorite={isFavorite(property.id)}
                  onFavoriteToggle={(p) => toggle(p.id)}
                  onClick={(p) => openInMap(p.id)}
                />
              ))}
            </div>
            <div className="listing__more">
              <Link className="btn btn--kunyit" href="/">
                Buka semua {DATASET_STATS.total} kos
              </Link>
            </div>
            <p className="hero__sample-note">
              Favorit tersimpan di perangkat ini ({favorites.size} tersimpan sekarang).
            </p>
          </section>
        </div>

        {/* ── Fitur ── */}
        <div className="landing__wrap">
          <section className="features" aria-label="Fitur">
            <h2>Kenapa peta dulu, daftar kemudian</h2>
            <ul className="features__list">
              {FEATURES.map((f) => (
                <li className="features__item" key={f.title}>
                  <span className="features__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <footer className="footer">
        <div className="landing__wrap">
          <div className="footer__row">
            <span className="navbar__wordmark">LokaKos</span>
            <span>Temukan kos di Banda Aceh — langsung di peta.</span>
            <span className="footer__links">
              <Link href="/">Daftar Kos</Link>
              <Link href="/tentang#daftar">Contoh Kos</Link>
              <a
                href="https://github.com/dezzorigin/lokakos"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </span>
          </div>
          <div className="footer__row" style={{ marginTop: 8 }}>
            <span>
              © 2026 LokaKos · Data kos dari listing publik, diperbarui{' '}
              {DATASET_META.collected_at}.
            </span>
            <span>Peta © OpenStreetMap contributors.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
