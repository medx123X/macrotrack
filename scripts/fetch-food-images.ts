/**
 * Fills in `imageUrl` for foods in src/database/foods/*.json by searching the
 * Unsplash API. Safe to re-run — foods that already have an imageUrl are
 * skipped unless --force is passed, so you can run this in batches across
 * Unsplash's free-tier rate limit (50 requests/hour) without redoing work.
 *
 * Setup:
 *   1. Create a free app at https://unsplash.com/oauth/applications -> copy
 *      the "Access Key" (NOT the secret key).
 *   2. Run:  UNSPLASH_ACCESS_KEY=your_key_here npm run fetch:images
 *
 * Flags:
 *   --limit=45        Max API requests this run (default 45, stays under the
 *                      50/hour free-tier cap with headroom). Re-run after an
 *                      hour to continue where it left off.
 *   --force            Re-fetch even for foods that already have an imageUrl.
 *   --category=Egyptian  Only process one category file (matches the JSON
 *                      filename without .json, case-insensitive substring).
 *
 * Output:
 *   - Writes imageUrl directly into the matching src/database/foods/*.json file.
 *   - Writes scripts/food-image-review.json listing every food whose match had
 *     few Unsplash results (<3) — these are the ones worth checking by eye or
 *     replacing with an AI-generated / hand-picked photo, since it's usually
 *     the Egyptian-specific dishes stock photography doesn't cover well.
 *   - Run `npm run build:foods` afterward to merge the changes into
 *     public/foods/foods.json (the file the app actually loads at runtime).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FOODS_DIR = join(__dirname, '..', 'src', 'database', 'foods');
const REVIEW_FILE = join(__dirname, 'food-image-review.json');

interface FoodRecord {
  id: string;
  name: string;
  cat: string;
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

/** Strips parenthetical translations ("Taameya (Falafel)" -> "Taameya"). */
function cleanName(name: string): string {
  return name.replace(/\(.*?\)/g, '').trim();
}

/**
 * Tries the plain food name first — for specific dishes ("Koshary", "Ful
 * Medames"), appending extra words like "food dish" over-constrains
 * Unsplash's tag-based search and returns zero results even when good
 * photos exist. Only widens the query if the plain name comes up empty.
 */
async function searchUnsplashWithFallback(
  name: string,
  accessKey: string
): Promise<UnsplashResult & { queryUsed: string }> {
  const plain = cleanName(name);
  const first = await searchUnsplash(plain, accessKey);
  if (first.total > 0) return { ...first, queryUsed: plain };

  await sleep(600);
  const broad = `${plain} food`;
  const second = await searchUnsplash(broad, accessKey);
  return { ...second, queryUsed: broad };
}

async function searchUnsplash(query: string, accessKey: string): Promise<UnsplashResult> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error('Unsplash rate limit hit (403). Wait an hour, or lower --limit and re-run.');
    }
    throw new Error(`Unsplash request failed: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as { total: number; results: { urls: { regular: string; small: string } }[] };
  const first = data.results[0];
  return {
    total: data.total,
    url: first ? first.urls.regular : null,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error('Missing UNSPLASH_ACCESS_KEY. Run: UNSPLASH_ACCESS_KEY=your_key npm run fetch:images');
    process.exit(1);
  }

  const { limit, force, category } = parseArgs();
  const files = readdirSync(FOODS_DIR)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => !category || f.toLowerCase().includes(category));

  let requestsUsed = 0;
  const needsReview: { id: string; name: string; cat: string; totalResults: number }[] = [];
  let updated = 0;
  let skipped = 0;

  for (const file of files) {
    const filePath = join(FOODS_DIR, file);
    const foods = JSON.parse(readFileSync(filePath, 'utf-8')) as FoodRecord[];
    let fileChanged = false;

    for (const food of foods) {
      if (food.imageUrl && !force) {
        skipped++;
        continue;
      }
      // reserve room for a possible 2nd (fallback) request this food might use
      if (requestsUsed >= limit - 1) {
        console.log(`\nHit --limit=${limit} requests for this run. Stopping here.`);
        console.log('Re-run the same command in ~1 hour to continue with the remaining foods.');
        writeReview(needsReview);
        printSummary(updated, skipped, needsReview.length);
        return;
      }

      try {
        const result = await searchUnsplashWithFallback(food.name, accessKey);
        requestsUsed += result.queryUsed === cleanName(food.name) ? 1 : 2;

        if (result.url) {
          food.imageUrl = result.url;
          fileChanged = true;
          updated++;
          console.log(`✓ ${food.name} (${food.cat}) — ${result.total} results [query: "${result.queryUsed}"]`);
        } else {
          console.log(`✗ ${food.name} (${food.cat}) — no results even after fallback, leaving emoji`);
        }

        if (result.total < 3) {
          needsReview.push({ id: food.id, name: food.name, cat: food.cat, totalResults: result.total });
        }

        await sleep(600); // gentle pacing, well under the hourly cap
      } catch (err) {
        console.error(`Error fetching "${food.name}":`, (err as Error).message);
        if ((err as Error).message.includes('rate limit')) {
          writeReview(needsReview);
          printSummary(updated, skipped, needsReview.length);
          return;
        }
      }
    }

    if (fileChanged) {
      writeFileSync(filePath, JSON.stringify(foods, null, 2) + '\n');
    }
  }

  writeReview(needsReview);
  printSummary(updated, skipped, needsReview.length);
}

function writeReview(list: { id: string; name: string; cat: string; totalResults: number }[]) {
  writeFileSync(REVIEW_FILE, JSON.stringify(list, null, 2) + '\n');
}

function printSummary(updated: number, skipped: number, reviewCount: number) {
  console.log(`\nDone. Updated ${updated}, skipped ${skipped} (already had a photo).`);
  if (reviewCount > 0) {
    console.log(`${reviewCount} foods had weak matches (<3 Unsplash results) — see scripts/food-image-review.json.`);
    console.log('These are worth a manual look or an AI-generated photo, especially Egyptian dishes.');
  }
  console.log('\nNext: run `npm run build:foods` to merge changes into public/foods/foods.json.');
}

main();
