import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* The four-figure strip, on /about-us/ and /practice-areas/.
 *
 * Cached in PROD only, like every other site-wide record here, so a dev server
 * picks up a Studio edit on refresh rather than serving what it read at boot.
 */
const STATS_BAND_QUERY = defineQuery(`
  *[_id == "statsBand"][0]{ stats[]{ value, label } }
`);

export type StatsBand = { stats: { value: string; label: string }[] };

let cache: Promise<StatsBand> | undefined;

async function fetchStatsBand(): Promise<StatsBand> {
  const doc = (await sanityClient.fetch(STATS_BAND_QUERY)) as StatsBand | null;
  if (!doc?.stats?.length) {
    throw new Error(
      "The statsBand document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/stats-band.ts --with-user-token",
    );
  }
  return doc;
}

export function getStatsBand(): Promise<StatsBand> {
  if (!import.meta.env.PROD) return fetchStatsBand();
  cache ??= fetchStatsBand();
  return cache;
}
