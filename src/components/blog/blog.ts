import type { CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

/* The four categories the archive actually uses. Display labels live here
   rather than being derived from the slug so "child-custody" doesn't render as
   "Child custody", and so a future Sanity `category` document has an obvious
   home to migrate into. */
const LABELS: Record<string, string> = {
  divorce: "Divorce",
  "child-custody": "Child Custody",
  "child-support": "Child Support",
  "domestic-violence": "Domestic Violence",
};

export const categoryLabel = (slug: string) =>
  LABELS[slug] ?? slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* Every category the archive actually uses, in the editorial order above
   rather than alphabetically. Derived from the posts so a category can never
   be listed after its last post is retired, and so a new one appears without
   a code change. */
export function allCategories(posts: Post[]): string[] {
  const used = new Set(posts.flatMap((p) => p.data.categories));
  const known = Object.keys(LABELS).filter((slug) => used.has(slug));
  const extra = [...used].filter((slug) => !(slug in LABELS)).sort();
  return [...known, ...extra];
}

/* Category archives are built with the Blog index, the next template in the
   ranking. Until then these resolve to a route that does not exist yet — a
   known dangle, tracked in HANDOFF.md. */
export const categoryHref = (slug: string) => `/blog/categories/${slug}/`;

export const postHref = (post: Post) => `/blog/${post.id}/`;

/* en-GB gives "01 April 2026" — day first, no comma. The Blog Post comp uses
   the US "July 2, 2026" form, but the built homepage already uses this one and
   a site should not date itself two ways; comp conventions get translated to
   repo conventions the same way its colour tokens do. */
/* timeZone: "UTC" is load-bearing. Frontmatter dates are bare "2026-04-01"
   strings, which JS parses as UTC midnight; formatting those in a US local
   zone renders the previous day. Both functions therefore read the date in
   UTC so the displayed date always matches the file. */
export const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/* The comp's "8 min read" is decorative. This computes it instead, so it can
   never contradict the article. 225wpm is the usual prose reading estimate. */
export const readingTime = (body: string) =>
  Math.max(1, Math.round(body.trim().split(/\s+/).length / 225));

export const byNewest = (a: Post, b: Post) => b.data.date.getTime() - a.data.date.getTime();

/* Related posts: same category first, then backfilled by recency so the slot
   is always full even for the single domestic-violence post. */
export function relatedPosts(current: Post, all: Post[], limit = 3): Post[] {
  const others = all.filter((p) => p.id !== current.id).sort(byNewest);
  const cats = new Set(current.data.categories);

  const sameCategory = others.filter((p) => p.data.categories.some((c) => cats.has(c)));
  const rest = others.filter((p) => !sameCategory.includes(p));

  return [...sameCategory, ...rest].slice(0, limit);
}
