import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* The three-value band, on 8 pages.
 *
 * Promise-cached in PROD so a static build fetches it once rather than once per
 * page, and deliberately NOT cached in dev — a running dev server would
 * otherwise serve the document it fetched at boot for the life of the process,
 * with the Studio, the CLI and dist/ all showing the new value and only the
 * page in the browser disagreeing.
 */
const WHAT_DRIVES_US_QUERY = defineQuery(`
  *[_id == "whatDrivesUs"][0]{
    eyebrow,
    headingLead,
    headingAccent,
    values[]{ icon, title, text }
  }
`);

export type DriveValue = {
  /* One of the three keys in ICONS in about/WhatDrivesUs.astro. The schema
     constrains the field to those three; the component throws on anything else
     rather than rendering a card with an empty box where the glyph goes. */
  icon: string;
  title: string;
  text: string;
};

export type WhatDrivesUs = {
  eyebrow: string;
  headingLead: string;
  headingAccent?: string;
  values: DriveValue[];
};

let cache: Promise<WhatDrivesUs> | undefined;

async function fetchWhatDrivesUs(): Promise<WhatDrivesUs> {
  const doc = (await sanityClient.fetch(WHAT_DRIVES_US_QUERY)) as WhatDrivesUs | null;
  if (!doc?.headingLead) {
    throw new Error(
      "The whatDrivesUs document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/what-drives-us.ts --with-user-token",
    );
  }
  return doc;
}

export function getWhatDrivesUs(): Promise<WhatDrivesUs> {
  if (!import.meta.env.PROD) return fetchWhatDrivesUs();
  cache ??= fetchWhatDrivesUs();
  return cache;
}
