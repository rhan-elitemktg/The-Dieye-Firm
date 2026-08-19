import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { SanityImage } from "./image";

/* The accreditation strip: its heading and its badges.
 *
 * One fetch returns both, because no caller wants one without the other — the
 * band is a heading and a row, and rendering either alone is a bug. Cached in
 * PROD only, like every other site-wide record here, so a dev server picks up a
 * Studio edit on refresh instead of serving whatever it read at boot.
 */
const AWARDS_QUERY = defineQuery(`{
  "heading": *[_id == "awardsBand"][0].heading,
  "badges": *[_type == "award"] | order(orderRank){
    "id": _id,
    alt,
    width,
    image{ asset, "dimensions": asset->metadata.dimensions }
  }
}`);

export type Award = {
  id: string;
  alt: string;
  width: number;
  image: SanityImage;
};

export type AwardsBand = {
  heading: string;
  badges: Award[];
};

let cache: Promise<AwardsBand> | undefined;

async function fetchAwards(): Promise<AwardsBand> {
  const doc = (await sanityClient.fetch(AWARDS_QUERY)) as AwardsBand | null;
  if (!doc?.heading || !doc.badges?.length) {
    throw new Error(
      "The awards band is missing its heading or its badges. Import them with:\n" +
        "  npx sanity exec scripts/import/awards.ts --with-user-token",
    );
  }
  return doc;
}

export function getAwards(): Promise<AwardsBand> {
  if (!import.meta.env.PROD) return fetchAwards();
  cache ??= fetchAwards();
  return cache;
}
