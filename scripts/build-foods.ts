/**
 * Merges src/database/foods/*.json (source-of-truth, one file per category)
 * into a single public/foods/foods.json consumed at runtime by FoodRepository.
 * Run via `npm run build:foods` — also runs automatically before `dev`/`build`.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(__dirname, '..', 'src', 'database', 'foods');
const OUT_DIR = join(__dirname, '..', 'public', 'foods');
const OUT_FILE = join(OUT_DIR, 'foods.json');

function main() {
  const files = readdirSync(SRC_DIR).filter((f) => f.endsWith('.json'));
  const merged: unknown[] = [];
  const seenIds = new Set<string>();

  for (const file of files) {
    const raw = readFileSync(join(SRC_DIR, file), 'utf-8');
    const items = JSON.parse(raw) as { id: string }[];
    for (const item of items) {
      if (seenIds.has(item.id)) {
        throw new Error(`Duplicate food id "${item.id}" found in ${file}`);
      }
      seenIds.add(item.id);
      merged.push(item);
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(merged, null, 2));
  console.log(`Built ${OUT_FILE} — ${merged.length} foods from ${files.length} category files.`);
}

main();
