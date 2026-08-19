import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* The nine questions, in the one order both surfaces use.
 *
 * Two shapes come out of one fetch. `getFaqs()` is /faq/'s — every question
 * with the client's full published answer. `getHomeFaqs()` is the homepage's —
 * the six flagged for it, with our condensed answers. They are deliberately
 * different wordings of the same nine documents; see the schema's header.
 *
 * Both return the `{ q, a }` shape home/Faq.astro already took as a prop, so
 * the component and the FAQPage JSON-LD it generates needed no edits.
 */
const FAQS_QUERY = defineQuery(`
  *[_type == "faq"] | order(orderRank){ question, answer, shortAnswer, showOnHomepage }
`);

type FaqDoc = {
  question: string;
  answer: string;
  shortAnswer?: string;
  showOnHomepage?: boolean;
};

export type FaqItem = { q: string; a: string };

let cache: Promise<FaqDoc[]> | undefined;

async function fetchFaqs(): Promise<FaqDoc[]> {
  const docs = (await sanityClient.fetch(FAQS_QUERY)) as FaqDoc[] | null;
  if (!docs?.length) {
    throw new Error(
      "No faq documents in Sanity. Import them with:\n" +
        "  npx sanity exec scripts/import/faqs.ts --with-user-token",
    );
  }
  return docs;
}

function all(): Promise<FaqDoc[]> {
  if (!import.meta.env.PROD) return fetchFaqs();
  cache ??= fetchFaqs();
  return cache;
}

/** Every question with the client's full answer — /faq/. */
export async function getFaqs(): Promise<FaqItem[]> {
  return (await all()).map((doc) => ({ q: doc.question, a: doc.answer }));
}

/** The six flagged for the homepage, with our condensed answers. */
export async function getHomeFaqs(): Promise<FaqItem[]> {
  const picked = (await all()).filter((doc) => doc.showOnHomepage);
  const missing = picked.find((doc) => !doc.shortAnswer);
  if (missing) {
    /* The schema asks for a short answer whenever the flag is on, but
       validation is a warning an editor can publish through. Without this the
       homepage renders an empty <p> inside an accordion nobody opens. */
    throw new Error(
      `The FAQ "${missing.question}" is set to show on the homepage but has no short answer.`,
    );
  }
  return picked.map((doc) => ({ q: doc.question, a: doc.shortAnswer! }));
}
