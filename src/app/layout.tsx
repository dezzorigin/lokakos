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
  title: 'LokaKos — Temukan Kos di Banda Aceh',
  description:
    'Marketplace kos map-first untuk Darussalam, Banda Aceh. Lihat lokasi, harga, dan ketersediaan kamar langsung di peta OpenStreetMap — tanpa daftar, tanpa iklan.',
  keywords: ['kos', 'kosan', 'Banda Aceh', 'Darussalam', 'Unsyiah', 'sewa kamar', 'Kopelma'],
  icons: { icon: '/favicon.svg' },
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
