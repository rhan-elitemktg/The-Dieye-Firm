import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { PageHeader } from "./blogPage";

/* /faq/ — its own opening. Everything below it is data or a shared record.
 *
 * The same three strings as /blog/, rendered by the same BlogHeader, so the
 * shape is imported rather than written out a third time. */
const QUERY = defineQuery(`
  *[_id == "faqPage"][0]{ header{ eyebrow, title, intro } }
`);

export type FaqPage = { header: PageHeader };

let cache: Promise<FaqPage> | undefined;

async function fetchPage(): Promise<FaqPage> {
  const doc = (await sanityClient.fetch(QUERY)) as FaqPage | null;
  if (!doc?.header?.title) {
    throw new Error(
      "The faqPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/faq-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getFaqPage(): Promise<FaqPage> {
  if (!import.meta.env.PROD) return fetchPage();
  cache ??= fetchPage();
  return cache;
}
