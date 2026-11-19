'use client';

/**
 * src/app/page.tsx — Landing LokaKos.
 *
 * Struktur (referensi pemenang: Marren & Co, Framer): hero editorial kiri +
 * peta hidup kanan, lalu stepper cara kerja, daftar kos, strip fitur, footer.
 * Peta di hero adalah peta BENERAN (MapContainer yang sama dengan /peta):
 * klik karcis harga -> buka kos itu di /peta. Semua angka dihitung dari
 * MOCK_PROPERTIES — tanpa statistik vanity.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MapContainer from '@/components/map/MapContainer';
import PropertyCard from '@/components/property/PropertyCard';
import { MOCK_PROPERTIES, formatPrice, totalAvailableRooms } from '@/lib/mockData';
import { useFavorites } from '@/lib/favorites';

const MIN_PRICE = Math.min(...MOCK_PROPERTIES.map((p) => p.priceMin));
const AVAILABLE_ROOMS = totalAvailableRooms(MOCK_PROPERTIES);

const FEATURES = [
  {
    title: 'Peta yang tidak butuh kunci API',
    body: 'Tile OpenStreetMap via Leaflet — tidak ada token, tidak ada tagihan, peta tetap jalan di halaman live.',
  },
  {
    title: 'Filter yang benar-benar menyaring',
    body: 'Harga, fasilitas, dan tipe kos memfilter daftar dan marker peta sekaligus. Bukan chip pajangan.',
  },
  {
    title: 'Favorit tersimpan di perangkatmu',
    body: 'Ketuk hati di kartu mana pun; daftar favoritmu tetap ada saat kembali, tanpa akun dan tanpa daftar.',
  },
  {
    title: 'Bagikan tautan satu kos',
    body: 'Setiap kos punya tautan /peta?kos=… — yang menerima langsung melihat detail kos itu, bukan beranda.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const { favorites, toggle, isFavorite } = useFavorites();

  const openInMap = (id: string) => router.push(`/peta?kos=${id}`);

  return (
    <div className="landing">
      <Navbar />

      <main>
        {/* ── Hero: editorial kiri, peta hidup kanan ── */}
        <div className="landing__wrap">
          <section className="hero" aria-label="Perkenalan LokaKos">
            <div>
              <span className="hero__eyebrow">Peta kos · Darussalam, Banda Aceh</span>
              <h1>Cari kos sambil lihat petanya.</h1>
              <p className="hero__sub">
                LokaKos menaruh peta di depan: tiap karcis kuning di peta adalah satu kos
                di sekitar Unsyiah, lengkap dengan harga dan status kamarnya. Klik, bandingkan,
                simpan yang cocok.
              </p>
              <div className="hero__actions">
                <Link className="btn btn--primary" href="/peta">
                  Buka Peta
                </Link>
                <Link className="btn btn--ghost" href="#daftar">
                  Lihat Daftar Kos
                </Link>
              </div>
              <div className="hero__stats" aria-label="Ringkasan data">
                <div className="hero__stat">
                  <div className="hero__stat-num num">{MOCK_PROPERTIES.length}</div>
                  <div className="hero__stat-label">kos contoh</div>
                </div>
                <div className="hero__stat">
                  <div className="hero__stat-num num">{formatPrice(MIN_PRICE)}</div>
                  <div className="hero__stat-label">harga mulai /bln</div>
                </div>
                <div className="hero__stat">
                  <div className="hero__stat-num num">{AVAILABLE_ROOMS}</div>
                  <div className="hero__stat-label">kamar tersedia</div>
                </div>
              </div>
              <p className="hero__sample-note">
                Angka di atas dihitung dari data contoh di aplikasi — bukan klaim pengguna
                atau properti sungguhan.
              </p>
            </div>

            <div className="hero__map" role="region" aria-label="Peta kos Darussalam">
              <MapContainer
                properties={MOCK_PROPERTIES}
                onMarkerNavigate={(p) => openInMap(p.id)}
              />
              <div className="hero__map-caption">
                <span className="dot" aria-hidden="true" />
                Peta live — klik karcis harga untuk membuka kos di peta penuh
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
                  Karcis kuning menunjukkan harga mulai tiap kos. Warna titiknya memberi tahu
                  status kamar: hijau tersedia, kuning hampir penuh, merah penuh.
                </p>
              </li>
              <li className="steps__item">
                <span className="steps__num">Langkah 2</span>
                <h3>Saring yang cocok</h3>
                <p>
                  Pilih rentang harga, fasilitas, dan tipe kos — putra, putri, atau campur.
                  Daftar dan peta menyaring bersamaan.
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

        {/* ── Daftar kos ── */}
        <div className="landing__wrap">
          <section className="listing" id="daftar" aria-label="Daftar kos">
            <div className="listing__head">
              <h2>Kos di sekitar Unsyiah</h2>
              <p>
                {MOCK_PROPERTIES.length} kos contoh di Darussalam dan Kopelma — klik kartu
                untuk membukanya di peta.
              </p>
            </div>
            <div className="listing__grid">
              {MOCK_PROPERTIES.map((property) => (
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
              <Link className="btn btn--kunyit" href="/peta">
                Buka semuanya di peta
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
              <Link href="/peta">Peta</Link>
              <Link href="/#daftar">Daftar Kos</Link>
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
            <span>© 2026 LokaKos · Data kos di situs ini adalah data contoh.</span>
            <span>Peta © OpenStreetMap contributors.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
