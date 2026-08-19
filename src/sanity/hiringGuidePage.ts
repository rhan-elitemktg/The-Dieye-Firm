import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { PortableTextBlock } from "@portabletext/types";

/* /about-us/choosing-a-family-law-attorney/ — the client's own 738 words.
 *
 * Rich text, because the paragraphs carry links into the practice-area section.
 */
const QUERY = defineQuery(`
  *[_id == "hiringGuidePage"][0]{
    header{ kicker, kickerHref, title },
    sections[]{ heading, body }
  }
`);

export type HiringGuidePage = {
  header: { kicker: string; kickerHref?: string; title: string };
  sections: { heading: string; body: PortableTextBlock[] }[];
};

let cache: Promise<HiringGuidePage> | undefined;

async function fetchPage(): Promise<HiringGuidePage> {
  const doc = (await sanityClient.fetch(QUERY)) as HiringGuidePage | null;
  if (!doc?.sections?.length) {
    throw new Error(
      "The hiringGuidePage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/hiring-guide-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getHiringGuidePage(): Promise<HiringGuidePage> {
  if (!import.meta.env.PROD) return fetchPage();
  cache ??= fetchPage();
  return cache;
}
