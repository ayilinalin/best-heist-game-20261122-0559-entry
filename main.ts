// VAULTLINE — main.ts
// Entrypoint program/v1: menyalin game/ dan screenshots/ dari repository
// ke direktori output, lalu menulis dossier.json dengan buildDossier
// dari vendor/makefun-game.ts (copy kit, tanpa diubah).
//
// Di luar grader, MAKEFUN_OUTPUT_DIR menggantikan /output.
// Program ini deterministik: dua run menulis byte yang sama.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTree(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src).sort();
  for (const name of entries) {
    const from = join(src, name);
    const to = join(dest, name);
    if (statSync(from).isDirectory()) {
      copyTree(from, to);
    } else {
      cpSync(from, to);
    }
  }
}

const gameDir = join(repoRoot, 'game');
const shotsDir = join(repoRoot, 'screenshots');
if (!existsSync(gameDir)) throw new Error('main.ts: game/ tidak ditemukan di repo');
if (!existsSync(shotsDir)) throw new Error('main.ts: screenshots/ tidak ditemukan di repo');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
copyTree(gameDir, join(outDir, 'game'));
copyTree(shotsDir, join(outDir, 'screenshots'));

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
if (dossier.length > 1572864) {
  throw new Error(`main.ts: dossier.json ${dossier.length} byte melebihi cap gate 1,5 MiB`);
}
writeFileSync(join(outDir, 'dossier.json'), dossier);
console.log(`vaultline: wrote ${outDir} (dossier.json ${dossier.length} bytes)`);
