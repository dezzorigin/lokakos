import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LokaKos — Temukan Kos di Banda Aceh',
  description:
    'Platform map-first untuk menemukan kos-kosan terbaik di Banda Aceh. Lihat lokasi, harga, dan ketersediaan kamar langsung di peta.',
  keywords: ['kos', 'kosan', 'Banda Aceh', 'Darussalam', 'Unsyiah', 'sewa kamar'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
