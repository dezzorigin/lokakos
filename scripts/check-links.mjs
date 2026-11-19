#!/usr/bin/env node
/**
 * check-links.mjs — pemeriksaan statis (tanpa browser), dipakai
 * `npm run validate` dan job `static-checks` di CI:
 *   1. Tautan file lokal di README.md + docs/*.md benar-benar ada di disk.
 *   2. File wajib ada (LICENSE, README, .env.example, docs inti, CI, skrip).
 *   3. Sapu secret kasar di file sumber (bukan node_modules).
 * Keluar 1 bila ada satu saja temuan.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (msg) => failures.push(msg);

// ── 1. Tautan lokal di Markdown ───────────────────────────────────────────
const mdFiles = ['README.md', 'PRD.md', 'CHANGELOG.md'];
for (const f of readdirSync(join(ROOT, 'docs'))) {
  if (f.endsWith('.md')) mdFiles.push(`docs/${f}`);
}
for (const rel of mdFiles) {
  if (!existsSync(join(ROOT, rel))) continue;
  const content = readFileSync(join(ROOT, rel), 'utf-8');
  for (const m of content.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const ref = m[1];
    if (/^(https?:|mailto:|#|data:)/.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean.startsWith('/')
      ? join(ROOT, clean.slice(1))
      : join(ROOT, dirname(rel), clean);
    if (!existsSync(target)) fail(`${rel}: tautan lokal hilang: ${ref}`);
  }
}

// ── 2. File wajib ada ─────────────────────────────────────────────────────
for (const f of [
  'LICENSE', 'README.md', 'PRD.md', 'CHANGELOG.md', '.env.example',
  'docs/README.md', 'docs/DESIGN.md', 'docs/architecture.md', 'docs/data.md',
  'docs/deploy.md', 'docs/testing.md', 'docs/diagrams.html',
  'docs/PLANNER.md', 'scripts/advisory-sweep.py', 'scripts/check-links.mjs',
  'scripts/check-static.mjs', 'scripts/screenshot.mjs', 'scripts/make-video.mjs',
  'scripts/smoke.mjs', 'e2e/smoke.spec.ts', 'playwright.config.ts',
  '.github/workflows/ci.yml',
]) {
  if (!existsSync(join(ROOT, f))) fail(`${f} hilang`);
}

// ── 3. Sapu secret kasar ──────────────────────────────────────────────────
const SECRET_PATTERNS = [
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/ghp_[A-Za-z0-9]{20,}/, 'GitHub PAT'],
  [/gho_[A-Za-z0-9]{20,}/, 'GitHub OAuth token'],
  [/AIza[0-9A-Za-z_-]{35}/, 'Google API key'],
  [/sk-[A-Za-z0-9]{16,}/, 'API key sk-...'],
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/xox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/pk\.ey[A-Za-z0-9_-]{10,}/, 'Mapbox token (pk.ey...)'],
];
const scanFiles = ['package.json', 'README.md', 'PRD.md', '.env.example'];
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!['node_modules', '.next', 'out', '.git'].includes(e.name)) walk(p);
    } else if (/\.(ts|tsx|js|mjs|css|md|json|yml|yaml)$/.test(e.name)) {
      scanFiles.push(p.replace(ROOT + '/', ''));
    }
  }
};
walk(join(ROOT, 'src'));
walk(join(ROOT, 'scripts'));
walk(join(ROOT, 'e2e'));
for (const rel of [...new Set(scanFiles)]) {
  if (!existsSync(join(ROOT, rel))) continue;
  const content = readFileSync(join(ROOT, rel), 'utf-8');
  for (const [re, label] of SECRET_PATTERNS) {
    if (re.test(content)) fail(`${rel}: pola secret terdeteksi (${label})`);
  }
}

if (failures.length > 0) {
  console.error(`check-links: ${failures.length} temuan:`);
  for (const f of failures) console.error(`  FAIL ${f}`);
  process.exit(1);
}
console.log('check-links: OK (tautan lokal + file wajib + sapu secret)');
