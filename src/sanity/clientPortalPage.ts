import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

const QUERY = defineQuery(`
  *[_id == "clientPortalPage"][0]{
    header{ kicker, title, deck },
    groups[]{ heading, blurb, actions[]{ label, note, href, style, external, download } }
  }
`);

export type ClientPortalPage = {
  header: { kicker: string; title: string; deck: string };
  groups: {
    heading: string;
    blurb: string;
    actions: {
      label: string;
      note: string;
      href: string;
      style: string;
      external?: boolean;
      download?: boolean;
    }[];
  }[];
};

let cache: Promise<ClientPortalPage> | undefined;

async function fetchPage(): Promise<ClientPortalPage> {
  const doc = (await sanityClient.fetch(QUERY)) as ClientPortalPage | null;
  if (!doc?.header?.title) {
    throw new Error(
      "The clientPortalPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/client-portal-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getClientPortalPage(): Promise<ClientPortalPage> {
  if (!import.meta.env.PROD) return fetchPage();
  cache ??= fetchPage();
  return cache;
}
