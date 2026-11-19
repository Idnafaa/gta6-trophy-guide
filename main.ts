// Hand-in program for the gta6-trophy-guide-01 bounty (Node 22, standard library only).
//
// The entry is the static app in app/ (index.html + ES modules + CSS + data/trophies.json, no build step, no
// network). This program copies app/ and screenshots/ into the output directory and writes dossier.json with the
// vendored make.fun library, which the scorer rebuilds byte for byte. Nothing here depends on time, randomness or
// directory order beyond what buildDossier itself sorts, so two runs write identical bytes.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts      (the grader uses /output)
//   node serve.ts                                            (then open http://localhost:8080)

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Same caps as the scorer's gate: text cut at 160 KiB, at most 4 screenshots of 256 KiB, app/ within 993 entries / 48 MiB.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function copyDir(name: string): void {
  const from = join(repoRoot, name);
  const to = join(outputDir, name);
  mkdirSync(to, { recursive: true });
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyDir('app');
copyDir('screenshots');
writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, DOSSIER_CAPS));
