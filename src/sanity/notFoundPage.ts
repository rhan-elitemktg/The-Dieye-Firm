import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const QUERY = defineQuery(`
  *[_id == "notFoundPage"][0]{
    header{ kicker, title, deck },
    routes[]{ label, href, note },
    callLead
  }
`);

export type NotFoundPage = {
  header: { kicker: string; title: string; deck: string };
  routes: { label: string; href: string; note: string }[];
  callLead: string;
};

let cache: Promise<NotFoundPage> | undefined;

async function fetchPage(): Promise<NotFoundPage> {
  const doc = (await sanityClient.fetch(QUERY)) as NotFoundPage | null;
  if (!doc?.header?.title) {
    throw new Error(
      "The notFoundPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/not-found-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getNotFoundPage(): Promise<NotFoundPage> {
  if (!import.meta.env.PROD) return fetchPage();
  cache ??= fetchPage();
  return cache;
}
