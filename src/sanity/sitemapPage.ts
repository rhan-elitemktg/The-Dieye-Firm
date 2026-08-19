import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const QUERY = defineQuery(`
  *[_id == "sitemapPage"][0]{
    header{ kicker, title, deckTemplate }
  }
`);

export type SitemapPage = { header: { kicker: string; title: string; deckTemplate: string } };

let cache: Promise<SitemapPage> | undefined;

async function fetchPage(): Promise<SitemapPage> {
  const doc = (await sanityClient.fetch(QUERY)) as SitemapPage | null;
  if (!doc?.header?.title) {
    throw new Error(
      "The sitemapPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/sitemap-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getSitemapPage(): Promise<SitemapPage> {
  if (!import.meta.env.PROD) return fetchPage();
  cache ??= fetchPage();
  return cache;
}
