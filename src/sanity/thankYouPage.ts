import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const QUERY = defineQuery(`
  *[_id == "thankYouPage"][0]{
    head{ eyebrow, title },
    band{ headingLines, headingAccent, headingTail, lead, ctaLabel }
  }
`);

export type ThankYouPage = {
  head: { eyebrow: string; title: string };
  band: {
    headingLines: string[];
    headingAccent?: string;
    headingTail?: string;
    lead: string;
    ctaLabel: string;
  };
};

let cache: Promise<ThankYouPage> | undefined;

async function fetchPage(): Promise<ThankYouPage> {
  const doc = (await sanityClient.fetch(QUERY)) as ThankYouPage | null;
  if (!doc?.head?.title) {
    throw new Error(
      "The thankYouPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/thank-you-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getThankYouPage(): Promise<ThankYouPage> {
  if (!import.meta.env.PROD) return fetchPage();
  cache ??= fetchPage();
  return cache;
}
