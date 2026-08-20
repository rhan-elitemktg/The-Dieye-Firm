import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImage } from "./image";
import type { SeoInput } from "../lib/seo";

/* The blog posts, read from Sanity.
 *
 * ── The result mimics an Astro content entry, on purpose ─────────────────────
 *
 * `{ id, data: { … } }` is what `getCollection("blog")` returned, and matching
 * it means src/components/blog/blog.ts — ten helpers used across nine
 * components — needs no edit, and neither do the components. See the same note
 * in ./practiceAreas.ts.
 *
 * `data.date` is a real Date, because `byNewest`, `formatDate` and `isoDate` all
 * call Date methods on it. GROQ returns the `date` field as a "YYYY-MM-DD"
 * string, so it is constructed here — once, in the one place that knows.
 *
 * ⚠ That string parses as UTC midnight, and formatting it in a US local zone
 * renders the DAY BEFORE. Everything downstream passes `timeZone: "UTC"` for
 * exactly this reason; blog.ts says so twice. Don't "simplify" either.
 *
 * ── Image dimensions are not optional ────────────────────────────────────────
 *
 * `asset->metadata.dimensions` is projected so every <img> can carry explicit
 * width and height. Astro's <Image> derived those from the file; a bare CDN URL
 * does not, and without them each card becomes a layout shift.
 */

const BLOG_POSTS_ALL_QUERY = defineQuery(`
  *[_type == "blogPost"]{
    "id": slug.current,
    "data": {
      title,
      date,
      author,
      "categories": coalesce(categories, []),
      featured,
      "keyTakeaways": coalesce(keyTakeaways, []),
      "description": seo.metaDescription,
      "seoTitle": seo.metaTitle,
      "imageAlt": coalesce(image.alt, ""),
      "image": image{
        asset,
        "dimensions": asset->metadata.dimensions
      }
    },
    body,
    "seo": seo{ metaTitle, metaDescription, canonicalUrl, noIndex, ogImage },
    "noIndex": seo.noIndex,
    _updatedAt
  }
`);

export type Post = {
  id: string;
  data: {
    title: string;
    date: Date;
    author: string;
    categories: string[];
    featured: boolean;
    keyTakeaways: string[];
    description?: string;
    seoTitle?: string;
    imageAlt: string;
    image?: SanityImage;
  };
  body: PortableTextBlock[];
  seo?: SeoInput | null;
  noIndex?: boolean;
  _updatedAt: string;
};

let cache: Promise<Post[]> | undefined;

async function fetchAll(): Promise<Post[]> {
  const rows = (await sanityClient.fetch(BLOG_POSTS_ALL_QUERY)) as any[] | null;
  if (!rows?.length) {
    throw new Error(
      "No blogPost documents in Sanity. Import them with:\n" +
        "  npx sanity exec scripts/import/blog.ts --with-user-token",
    );
  }

  const slugs = new Set<string>();
  for (const row of rows) {
    if (!row.id) throw new Error("A blog post has no slug");
    if (slugs.has(row.id)) throw new Error(`Two blog posts share the slug "${row.id}"`);
    slugs.add(row.id);
  }

  return rows.map((row) => ({
    ...row,
    data: {
      ...row.data,
      date: new Date(row.data.date),
      featured: Boolean(row.data.featured),
      /* An image whose asset never resolved would render a broken <img> with no
         error; treat it as absent so the fallback artwork takes over. */
      image: row.data.image?.asset ? row.data.image : undefined,
    },
  })) as Post[];
}

export function getBlogPosts(): Promise<Post[]> {
  if (!import.meta.env.PROD) return fetchAll();
  cache ??= fetchAll();
  return cache;
}
