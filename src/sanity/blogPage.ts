import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* /blog/ — its own opening. The posts are the `blogPost` collection. */
const BLOG_PAGE_QUERY = defineQuery(`
  *[_id == "blogPage"][0]{ header{ eyebrow, title, intro } }
`);

export type BlogPage = { header: { eyebrow: string; title: string; intro: string } };

let cache: Promise<BlogPage> | undefined;

async function fetchBlogPage(): Promise<BlogPage> {
  const doc = (await sanityClient.fetch(BLOG_PAGE_QUERY)) as BlogPage | null;
  if (!doc?.header?.title) {
    throw new Error(
      "The blogPage document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/blog-page.ts --with-user-token",
    );
  }
  return doc;
}

export function getBlogPage(): Promise<BlogPage> {
  if (!import.meta.env.PROD) return fetchBlogPage();
  cache ??= fetchBlogPage();
  return cache;
}
