import type { Metadata } from 'next';
import { Fraunces, Public_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://lokakos.pages.dev'),
  title: 'LokaKos — Temukan Kos di Banda Aceh',
  description:
    'Marketplace kos map-first untuk Darussalam, Banda Aceh. Lihat lokasi, harga, dan ketersediaan kamar langsung di peta OpenStreetMap — tanpa daftar, tanpa iklan.',
  keywords: ['kos', 'kosan', 'Banda Aceh', 'Darussalam', 'Unsyiah', 'sewa kamar', 'Kopelma'],
  icons: { icon: '/favicon.svg' },
  // Kartu preview saat tautan ditempel (preferensi Nabil 19 Nov 2026):
  // gambar preview = screenshot ASLI explorer baru situs ini
  // (public/og.png, 1200x630, diambil dari build lokal halaman "/"),
  // bukan placeholder.
  openGraph: {
    title: 'LokaKos — Temukan Kos di Banda Aceh',
    description:
      '208 kos nyata Banda Aceh di peta — harga, sumber listing, dan kontak langsung dari daftar.',
    url: 'https://lokakos.pages.dev',
    siteName: 'LokaKos',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: 'https://lokakos.pages.dev/og.png',
        width: 1200,
        height: 630,
        alt: 'Daftar 208 kos Banda Aceh di peta LokaKos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LokaKos — Temukan Kos di Banda Aceh',
    description:
      '208 kos nyata Banda Aceh di peta — harga, sumber listing, dan kontak langsung dari daftar.',
    images: ['https://lokakos.pages.dev/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
