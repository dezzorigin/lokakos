/**
 * src/lib/format.ts
 * Format harga IDR — dipakai kartu, drawer detail, dan marker peta.
 * Dipindah dari mockData.ts (dihapus di PR #2) supaya tidak ada lagi
 * impor dari file data contoh.
 */

/**
 * Helper: format harga IDR ke label singkat untuk marker
 * Contoh: 1200000 → "1.2Jt"
 */
export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) {
    return `${(price / 1_000_000).toFixed(1).replace('.0', '')}Jt`;
  }
  return `${(price / 1_000).toFixed(0)}Rb`;
}

/**
 * Format harga lengkap ke format IDR
 * Contoh: 1200000 → "Rp 1.200.000"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/** Label periode harga: '/bln' untuk bulanan, '/thn' untuk tahunan. */
export function pricePeriodLabel(period: 'monthly' | 'yearly'): string {
  return period === 'yearly' ? '/thn' : '/bln';
}
