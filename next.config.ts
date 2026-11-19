import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export untuk Cloudflare Pages (direct upload `out/`).
  // Konsekuensi: tidak ada Route Handler dinamis — /health lama dihapus,
  // status aplikasi dicek lewat halaman statis `/` dan `/peta`.
  output: "export",
  // trailingSlash: true supaya tiap rute jadi folder index.html
  // (out/peta/index.html) — server statis & Cloudflare Pages menyajikan
  // /peta/ langsung tanpa rewrite. Tanpa ini, rute jadi out/peta.html.
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
