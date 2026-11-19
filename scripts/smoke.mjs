// Smoke statis terhadap hasil `next build` (folder out/) — persis yang
// di-upload ke Cloudflare Pages. Menjalankan server statis lokal lalu
// mengecek HTTP + isi halaman. Dipakai `npm run smoke` dan job `smoke` di CI.
// Pola repo #29: JANGAN `curl | grep -q` + pipefail (grep -q menutup pipe,
// curl mati SIGPIPE exit 23) — curl ke file dulu, baru grep file-nya.
import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'out');
const PORT = process.env.SMOKE_PORT || '8332';

if (!existsSync(join(OUT, 'index.html'))) {
  console.error('out/index.html tidak ada — jalankan `npm run build` dulu.');
  process.exit(1);
}

const server = spawn('python3', ['-m', 'http.server', PORT, '--directory', OUT], {
  stdio: 'ignore',
});

const waitFor = async (url, tries = 30) => {
  for (let i = 0; i < tries; i++) {
    try {
      execFileSync('curl', ['-sf', '-o', '/dev/null', url], { stdio: 'ignore' });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return false;
};

const check = (url, file, needles) => {
  execFileSync('curl', ['-sf', '-o', file, url], { stdio: 'ignore' });
  const body = readFileSync(file, 'utf-8');
  for (const n of needles) {
    if (!body.includes(n)) throw new Error(`${url}: tidak mengandung ${JSON.stringify(n)}`);
  }
  console.log(`OK ${url}`);
};

let code = 0;
try {
  const up = await waitFor(`http://127.0.0.1:${PORT}/`);
  if (!up) throw new Error('server statis tidak naik');
  check(`http://127.0.0.1:${PORT}/`, '/tmp/lokakos-smoke-home.html', [
    // Beranda = explorer penuh (PR #2): panel filter + peta.
    'Filter properti',
    'Memuat peta',
  ]);
  check(`http://127.0.0.1:${PORT}/tentang/`, '/tmp/lokakos-smoke-tentang.html', [
    'Cari kos sambil lihat petanya.',
    'Memuat peta',
  ]);
  check(`http://127.0.0.1:${PORT}/peta/`, '/tmp/lokakos-smoke-peta.html', [
    // Rute lama /peta = halaman redirect ke / (PR #2).
    'Peta sudah pindah ke beranda',
  ]);
  check(`http://127.0.0.1:${PORT}/favicon.svg`, '/tmp/lokakos-smoke-favicon.svg', ['<svg']);
  console.log('smoke: OK (beranda explorer + tentang + redirect /peta + favicon dari out/)');
} catch (e) {
  console.error(`smoke: FAIL — ${e.message}`);
  code = 1;
} finally {
  server.kill();
}
process.exit(code);
