import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* /contact-us/ — its hero and its Find Us heading.
 *
 * The form between them is `consultForm` (a record, on 93 pages) and the
 * address under them is `firmDetails`. This document holds neither.
 */
const CONTACT_PAGE_QUERY = defineQuery(`
  *[_id == "contactPage"][0]{
    hero{ eyebrow, title, lead },
    findUs{ eyebrow, headingLead, headingAccent, headingTail }
  }
`);

export type ContactPage = {
  hero: { eyebrow: string; title: string; lead: string };
  findUs: { eyebrow: string; headingLead: string; headingAccent?: string; headingTail?: string };
};

let cache: Promise<ContactPage> | undefined;

async function fetchContactPage(): Promise<ContactPage> {
  const doc = (await sanityClient.fetch(CONTACT_PAGE_QUERY)) as ContactPage | null;
  if (!doc?.hero?.title) {
    throw new Error(
      "The contactPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/contact-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getContactPage(): Promise<ContactPage> {
  if (!import.meta.env.PROD) return fetchContactPage();
  cache ??= fetchContactPage();
  return cache;
}
