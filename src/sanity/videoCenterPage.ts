import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { PageHeader } from "./blogPage";

/* /video-center/ — its own opening. Everything below it is data or a shared record.
 *
 * The same three strings as /blog/, rendered by the same BlogHeader, so the
 * shape is imported rather than written out a third time. */
const QUERY = defineQuery(`
  *[_id == "videoCenterPage"][0]{ header{ eyebrow, title, intro } }
`);

export type VideoCenterPage = { header: PageHeader };

let cache: Promise<VideoCenterPage> | undefined;

async function fetchPage(): Promise<VideoCenterPage> {
  const doc = (await sanityClient.fetch(QUERY)) as VideoCenterPage | null;
  if (!doc?.header?.title) {
    throw new Error(
      "The videoCenterPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/video-center-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getVideoCenterPage(): Promise<VideoCenterPage> {
  if (!import.meta.env.PROD) return fetchPage();
  cache ??= fetchPage();
  return cache;
}
