#!/usr/bin/env node
/**
 * check-static.mjs — gate anti-slop P0 + penjaga restructure, dipakai
 * `npm run validate` dan job `static-checks` di CI:
 *   1. Tanpa gradient ungu/biru, tanpa headline gradient, tanpa font Inter,
 *      tanpa rounded-2xl/3xl + shadow-lg di UI.
 *   2. Tanpa emoji mentah sebagai ikon fungsi. Dikecualikan: penanda teks
 *      tipe kos (♂/♀/⚥), hati favorit (♥/♡), dan silang (✕) — ketiganya
 *      glyph teks yang didokumentasikan di docs/DESIGN.md, bukan ikon fungsi.
 *   3. Mapbox benar-benar hilang dari src (tanpa impor mapbox-gl /
 *      react-map-gl, tanpa NEXT_PUBLIC_MAPBOX_TOKEN, tanpa mapbox://).
 *   4. Tanpa file .env yang ter-commit; tanpa app_backup_root.
 * Keluar 1 bila ada satu saja temuan.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (msg) => failures.push(msg);

const SRC_FILES = [];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.next', 'out', '.git'].includes(e.name)) walk(p);
    } else if (/\.(ts|tsx|css)$/.test(e.name)) {
      SRC_FILES.push(p);
    }
  }
};
walk(join(ROOT, 'src'));

// ── 1+2. Gate P0 ─────────────────────────────────────────────────────────
const P0_CHECKS = [
  [/linear-gradient\([^)]*(violet|purple|indigo|blue|cyan|#6366f1|#818cf8)/i, 'gradient ungu/biru'],
  [/bg-clip-text/, 'headline gradient (bg-clip-text)'],
  [/\bInter\b/, 'font Inter'],
  [/rounded-2xl|rounded-3xl/, 'rounded-2xl/3xl (radius template)'],
  [/shadow-lg|shadow-2xl/, 'shadow-lg/2xl di permukaan'],
];
// Emoji pictograph — kecuali glyph teks yang didokumentasikan.
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;
const EMOJI_ALLOWED = new Set(['♂', '♀', '⚥', '♥', '♡', '✕']);
for (const f of SRC_FILES) {
  const content = readFileSync(f, 'utf-8');
  const rel = f.replace(ROOT + '/', '');
  for (const [re, label] of P0_CHECKS) {
    if (re.test(content)) fail(`${rel}: pelanggaran P0 — ${label}`);
  }
  for (const m of content.matchAll(EMOJI_RE)) {
    if (!EMOJI_ALLOWED.has(m[0])) {
      fail(`${rel}: emoji mentah terdeteksi (${m[0]}) — pakai ikon SVG`);
    }
  }
}

// ── 3. Mapbox hilang dari src ─────────────────────────────────────────────
for (const f of SRC_FILES) {
  const content = readFileSync(f, 'utf-8');
  const rel = f.replace(ROOT + '/', '');
  for (const [re, label] of [
    [/mapbox-gl/, 'impor mapbox-gl'],
    [/react-map-gl/, 'impor react-map-gl'],
    [/NEXT_PUBLIC_MAPBOX_TOKEN/, 'token Mapbox masih dibaca'],
    [/mapbox:\/\//, 'style mapbox:// masih dipakai'],
  ]) {
    if (re.test(content)) fail(`${rel}: Mapbox belum bersih — ${label}`);
  }
}

// ── 4. Kebersihan tree ───────────────────────────────────────────────────
for (const bad of ['src/app/health', 'src/lib/mapbox', 'src/components/map/PropertyMarker.tsx', 'lokakos', 'app_backup_root']) {
  if (existsSync(join(ROOT, bad))) fail(`${bad} masih ada — harus sudah dihapus saat restructure`);
}
for (const f of readdirSync(ROOT)) {
  if (/^\.env($|\.)/.test(f) && f !== '.env.example') fail(`file env ter-commit: ${f}`);
}

if (failures.length > 0) {
  console.error(`check-static: ${failures.length} temuan:`);
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log('check-static: OK (gate P0 + Mapbox bersih + tree bersih)');
