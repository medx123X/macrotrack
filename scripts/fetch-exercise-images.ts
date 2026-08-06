/**
 * Fills in `imageUrl` for exercises in public/exercises/exercises.json by
 * searching the Unsplash API. Mirrors scripts/fetch-food-images.ts — same
 * setup, same rate-limit behavior, same resumability. The only structural
 * difference is exercises live in one file instead of per-category files.
 *
 * Setup: same Unsplash Access Key you already have from the food photos —
 * no new signup needed.
 *   UNSPLASH_ACCESS_KEY=your_key_here npm run fetch:exercise-images
 *
 * Flags: --limit=45 (default), --force, --category=Gym
 *
 * Output:
 *   - Writes imageUrl directly into public/exercises/exercises.json
 *   - Writes scripts/exercise-image-review.json listing weak matches (<3
 *     results) — expect this to flag home-bodyweight moves and some gym
 *     machine exercises, since stock photography skews toward generic gym
 *     shots rather than named movements.
 *   - No merge/build step needed afterward (unlike foods) — this file is
 *     already what the app loads at runtime.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXERCISES_FILE = join(__dirname, '..', 'public', 'exercises', 'exercises.json');
const REVIEW_FILE = join(__dirname, 'exercise-image-review.json');

interface ExerciseRecord {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  [key: string]: unknown;
}

interface UnsplashResult {
  total: number;
  url: string | null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const limit = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 45);
  const force = args.includes('--force');
  const category = args.find((a) => a.startsWith('--category='))?.split('=')[1]?.toLowerCase();
  return { limit, force, category };
}

async function searchUnsplash(query: string, accessKey: string): Promise<UnsplashResult> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${accessKey}` } });
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Unsplash rate limit hit (403). Wait an hour, or lower --limit and re-run.');
    }
    throw new Error(`Unsplash request failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { total: number; results: { urls: { regular: string } }[] };
  const first = data.results[0];
  return { total: data.total, url: first ? first.urls.regular : null };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Plain name first ("Bench Press"), broaden to "Bench Press exercise" only
 *  if that comes up empty — same lesson learned from the food script, where
 *  over-specific queries returned zero results more often than plain ones. */
async function searchWithFallback(name: string, accessKey: string): Promise<UnsplashResult & { queryUsed: string }> {
  const first = await searchUnsplash(name, accessKey);
  if (first.total > 0) return { ...first, queryUsed: name };

  await sleep(600);
  const broad = `${name} exercise`;
  const second = await searchUnsplash(broad, accessKey);
  return { ...second, queryUsed: broad };
}

async function main() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error('Missing UNSPLASH_ACCESS_KEY. Run: UNSPLASH_ACCESS_KEY=your_key npm run fetch:exercise-images');
    process.exit(1);
  }

  const { limit, force, category } = parseArgs();
  const exercises = JSON.parse(readFileSync(EXERCISES_FILE, 'utf-8')) as ExerciseRecord[];

  let requestsUsed = 0;
  let updated = 0;
  let skipped = 0;
  const needsReview: { id: string; name: string; category: string; totalResults: number }[] = [];

  for (const exercise of exercises) {
    if (category && !exercise.category.toLowerCase().includes(category)) continue;
    if (exercise.imageUrl && !force) {
      skipped++;
      continue;
    }
    if (requestsUsed >= limit - 1) {
      console.log(`\nHit --limit=${limit} requests for this run. Re-run in ~1 hour to continue.`);
      break;
    }

    try {
      const result = await searchWithFallback(exercise.name, accessKey);
      requestsUsed += result.queryUsed === exercise.name ? 1 : 2;

      if (result.url) {
        exercise.imageUrl = result.url;
        updated++;
        console.log(`✓ ${exercise.name} (${exercise.category}) — ${result.total} results [query: "${result.queryUsed}"]`);
      } else {
        console.log(`✗ ${exercise.name} (${exercise.category}) — no results even after fallback, leaving emoji`);
      }
      if (result.total < 3) {
        needsReview.push({ id: exercise.id, name: exercise.name, category: exercise.category, totalResults: result.total });
      }
      await sleep(600);
    } catch (err) {
      console.error(`Error fetching "${exercise.name}":`, (err as Error).message);
      if ((err as Error).message.includes('rate limit')) break;
    }
  }

  writeFileSync(EXERCISES_FILE, JSON.stringify(exercises, null, 2) + '\n');
  writeFileSync(REVIEW_FILE, JSON.stringify(needsReview, null, 2) + '\n');

  console.log(`\nDone. Updated ${updated}, skipped ${skipped} (already had a photo).`);
  if (needsReview.length > 0) {
    console.log(`${needsReview.length} exercises had weak matches — see scripts/exercise-image-review.json.`);
  }
}

main();
