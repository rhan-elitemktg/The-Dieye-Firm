import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* The editor-managed redirect list.
 *
 * Ordered by source only so the build log and dist/bulk-redirects.json read
 * predictably — Vercel matches on the path, not on position, so the order
 * carries no meaning at the edge.
 *
 * ⚠️ The build queries Sanity UNAUTHENTICATED, and an anonymous read returns no
 * drafts. So an unpublished redirect genuinely cannot reach the site: "nothing
 * happens until you Publish" is literally true, not a convention. That property
 * is what makes the Studio safe to hand to the SEO team.
 */
const REDIRECTS_QUERY = defineQuery(`
  *[_type == "redirect" && defined(source) && defined(destination)]
    | order(source asc){ source, destination, permanent }
`);

export type RedirectRule = {
  source: string;
  destination: string;
  permanent?: boolean;
};

export async function getRedirects(): Promise<RedirectRule[]> {
  return ((await sanityClient.fetch(REDIRECTS_QUERY)) ?? []) as RedirectRule[];
}
