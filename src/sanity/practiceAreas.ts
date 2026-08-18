import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { PortableTextBlock } from "@portabletext/types";

/* The 32 practice areas, read from Sanity.
 *
 * ── The result deliberately mimics an Astro content entry ────────────────────
 *
 * `{ id, data: { … } }` is the shape `getCollection("practiceAreas")` returned,
 * and it is reproduced here on purpose. Six things consume it — the route,
 * FamilyLawNav, PracticeAreaSidebar, AllAreas, FeaturedAreas and the site map —
 * plus the shared tree helpers in src/components/interior/tree.ts, whose
 * `TreeEntry` is exactly `{ id, data: { navLabel, parent? } }`.
 *
 * Matching the old shape means TreeNav and both sidebars change by NOT ONE LINE
 * across the 33 routes they render, which is what makes "the menu is identical"
 * provable rather than argued. The alternative — a natural Sanity shape plus
 * adapters at six call sites — is the same data with more places to get it
 * wrong.
 *
 * `id` is the slug (the route tail), and `data.parent` is the PARENT'S SLUG, not
 * a document id, because that is what `buildTree` matches against `id`.
 *
 * ── slug and parent are allowed to disagree ──────────────────────────────────
 *
 * Eight pages sit under a parent in the menu while keeping a top-level URL. So
 * never reconstruct a path from the parent chain: `areaHref` uses the slug and
 * nothing else. See the header of schemaTypes/practiceArea.ts.
 *
 * ── TypeGen ──────────────────────────────────────────────────────────────────
 *
 * Query names are global across the project and `defineQuery` is parsed
 * statically, so the projection cannot be hoisted into a shared const and the
 * const name is prefixed per file.
 *
 * Two GROQ notes, both learned here:
 *   - Only `//` comments. A `/* … *\/` block inside a query is a parse error at
 *     request time, not at build time, so it surfaces as a failed fetch.
 *   - `faqs` is coalesced to [] because GROQ returns null for a field that is
 *     not set, while the content collection this replaces defaulted it to an
 *     empty array. Only one of the 32 practice areas has FAQs, so null is the
 *     normal case and every consumer would otherwise need its own guard.
 */

const PRACTICE_AREAS_ALL_QUERY = defineQuery(`
  *[_type == "practiceArea"]{
    "id": slug.current,
    "data": {
      title,
      navLabel,
      subtitle,
      "parent": parent->slug.current,
      "description": seo.metaDescription,
      "seoTitle": seo.metaTitle,
      "faqs": coalesce(faqs[]{ _key, question, answer }, [])
    },
    body,
    "noIndex": seo.noIndex,
    "canonicalUrl": seo.canonicalUrl,
    _updatedAt
  }
`);

export type PracticeAreaFaq = {
  _key: string;
  question: string;
  answer: PortableTextBlock[];
};

export type PracticeArea = {
  id: string;
  data: {
    title: string;
    navLabel: string;
    subtitle?: string;
    parent?: string;
    description?: string;
    seoTitle?: string;
    faqs?: PracticeAreaFaq[];
  };
  body: PortableTextBlock[];
  noIndex?: boolean;
  canonicalUrl?: string;
  _updatedAt: string;
};

/* Promise-cached in PROD only, the same shape as getFirmDetails(). Thirty-three
   routes call this and each would otherwise be its own round trip; skipping the
   cache in dev is what lets a Studio edit show on refresh. */
let cache: Promise<PracticeArea[]> | undefined;

async function fetchAll(): Promise<PracticeArea[]> {
  const rows = (await sanityClient.fetch(PRACTICE_AREAS_ALL_QUERY)) as PracticeArea[] | null;
  if (!rows?.length) {
    throw new Error(
      "No practiceArea documents in Sanity. Import them with:\n" +
        "  npx sanity exec scripts/import/practice-areas.ts --with-user-token",
    );
  }

  /* Two build-time assertions, both for failures that are otherwise silent.

     A slug that appears twice would have `getStaticPaths` emit the same path
     twice and the filesystem keep whichever wrote last — a page replaced by
     another page, with a green build.

     A parent that doesn't resolve drops a whole branch out of the sidebar on
     every page that renders it, and the menu just looks shorter. */
  const slugs = new Set<string>();
  for (const row of rows) {
    if (!row.id) throw new Error(`A practiceArea has no slug (${row._updatedAt})`);
    if (slugs.has(row.id)) throw new Error(`Two practice areas share the slug "${row.id}"`);
    slugs.add(row.id);
  }
  for (const row of rows) {
    if (row.data.parent && !slugs.has(row.data.parent)) {
      throw new Error(
        `Practice area "${row.id}" sits under "${row.data.parent}", which is not a practice area.`,
      );
    }
  }
  return rows;
}

export function getPracticeAreas(): Promise<PracticeArea[]> {
  if (!import.meta.env.PROD) return fetchAll();
  cache ??= fetchAll();
  return cache;
}
