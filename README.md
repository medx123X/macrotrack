# MacroTrack Egypt

Offline-first calorie & macro tracker with strong Egyptian food coverage, built with
React + TypeScript + Vite + Tailwind v4, Dexie (IndexedDB), Zustand, and Recharts.

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Works fully offline after first load (PWA).

## Build for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

`npm run dev` and `npm run build` both automatically run `build:foods` first, which
merges `src/database/foods/*.json` (the source-of-truth category files) into
`public/foods/foods.json` (the runtime catalog). If you add foods to a category file,
just re-run `npm run dev` or `npm run build:foods` to pick them up — no need to touch
the merged file directly.

## Architecture

```
UI -> Pages -> Components -> Zustand stores -> Repositories -> Calculation Engine
                                                     |
                                        Storage Provider (Dexie today; swappable)
```

- **`src/engine/`** - single source of truth for all nutrition math
  (`calculateNutritionPlan()`), the two-question activity model, and the adaptive
  calorie adjustment. Add new BMR formulas (Katch-McArdle, Cunningham) here.
- **`src/storage/`** - `StorageProvider` interface + `DexieProvider` implementation.
  Swap in a future API-backed provider without touching repositories or UI.
- **`src/repositories/`** - the only layer that talks to storage. Stores call these,
  never Dexie directly.
- **`src/store/`** - Zustand stores (profile, day, food, settings).
- **`src/database/migrations.ts`** - versioned settings migrations (`SettingsV1` ->
  future `SettingsV2`, etc.) so upgrades never silently break saved user data.
- **`src/ai/`** - empty placeholders (`recommendations.ts`, `insights.ts`,
  `mealSuggestions.ts`) reserved for when you wire up a real LLM later.

## What's included in v1

- Full onboarding: personal info -> two-question activity (training days + steps) ->
  goal -> plan reveal
- Dashboard: calorie ring, macro rings, metabolic stats, weight journey chart
- Tracker: category browsing, search, food detail modal (grams or serving-based),
  custom food creation, water logging
- Analytics: weekly calories, macro donut, protein consistency, weight trajectory,
  pattern-based insights (from real data, not fabricated), real streak-based
  achievements
- Calendar (replaces a flat history list) - tap any day to see that day's totals
- Weekly check-in flow that recalculates BMR/TDEE/targets on every new weigh-in,
  and nudges calories +/-100 kcal if your real progress is off pace vs. your goal
- Light/dark theme (persisted, defaults to OS preference), full DESIGN.md token system
- Settings: theme, units, adaptive-calorie toggle, export/import/reset data
- PWA - installable, works offline

## Deferred to v1.1 (clean extension points left in place, not built yet)

- Search ranking tiers (most-used / favorites / recent / suggested)
- Meal templates ("Breakfast Template" one-tap logging)
- Daily nutrition score
- Automated weekly report generation
- Extended analytics (consistency %, calorie heatmap, best/worst day)
- Customizable macro strategy (g/kg sliders instead of fixed ratios)
- Daily reminder notifications

## Deploying for free (Vercel)

1. Push this project to a GitHub repo.
2. Go to vercel.com, sign in with GitHub, click **New Project**, and import the repo.
3. Vercel auto-detects Vite - leave the default build command (`npm run build`) and
   output directory (`dist`). Click **Deploy**.
4. You'll get a free `your-project.vercel.app` URL reachable from your phone. Add it
   to your home screen (Safari/Chrome -> "Add to Home Screen") to install it as a PWA.

### Alternative: Netlify

1. Push to GitHub.
2. netlify.com -> **Add new site** -> **Import an existing project** -> pick the repo.
3. Build command: `npm run build`. Publish directory: `dist`. Deploy.

Both are entirely free for this project - no environment variables, API keys, or
paid services are required anywhere in v1.

## Data & privacy

All data (profile, logs, weigh-ins, custom foods, settings) lives in the browser's
IndexedDB via Dexie. Nothing is sent to a server. Use **Profile -> Export Data** to
back up a JSON snapshot, and **Import Data** to restore it (e.g. after clearing
browser storage or moving to a new device).
