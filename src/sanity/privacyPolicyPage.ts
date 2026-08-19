import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { PortableTextBlock } from "@portabletext/types";

/* /privacy-policy/ — header, opening and eight sections of rich text.
 *
 * The phone number and postal address in the closing sentence are NOT here:
 * they come from `firmDetails`, so this page cannot publish a number the rest
 * of the site has stopped using.
 */
const QUERY = defineQuery(`
  *[_id == "privacyPolicyPage"][0]{
    header{ kicker, title },
    intro,
    sections[]{ heading, body, contactNote }
  }
`);

export type PrivacyPolicyPage = {
  header: { kicker: string; title: string };
  intro: PortableTextBlock[];
  sections: { heading: string; body: PortableTextBlock[]; contactNote?: string }[];
};

let cache: Promise<PrivacyPolicyPage> | undefined;

async function fetchPage(): Promise<PrivacyPolicyPage> {
  const doc = (await sanityClient.fetch(QUERY)) as PrivacyPolicyPage | null;
  if (!doc?.sections?.length) {
    throw new Error(
      "The privacyPolicyPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/privacy-policy-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getPrivacyPolicyPage(): Promise<PrivacyPolicyPage> {
  if (!import.meta.env.PROD) return fetchPage();
  cache ??= fetchPage();
  return cache;
}
