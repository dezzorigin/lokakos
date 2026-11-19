import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function NotFound() {
  return (
    <div className="landing">
      <Navbar />
      <main className="not-found">
        <h1>Halaman tidak ketemu.</h1>
        <p>
          Alamat yang kamu buka tidak ada di LokaKos. Mungkin tautan kosnya sudah
          kedaluwarsa — kembali ke peta dan cari lagi dari sana.
        </p>
        <Link className="btn btn--primary" href="/peta">
          Buka Peta
        </Link>
      </main>
    </div>
  );
}
