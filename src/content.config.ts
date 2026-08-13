import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/* Blog posts — ingested from the live dieyelaw.com archive by
   `npm run scrape:blog`. See scripts/scrape-blog.mjs.

   These fields are deliberately the shape a Sanity `post` document will
   return, the same contract src/components/home/Blog.astro already writes
   against, so the eventual migration is a query and a map rather than a
   rewrite. Content modelling stays deferred until the static site is done
   (AGENTS.md) — Markdown now, one batch migration later. */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),

      /* Three posts ship an SEO-tuned <title> that differs from the h1. Only
         present when it actually differs; the template falls back to `title`. */
      seoTitle: z.string().optional(),

      description: z.string(),
      date: z.coerce.date(),
      author: z.string().default("The Dieye Firm"),

      /* Four categories in use: child-custody, divorce, child-support,
         domestic-violence. One post carries three, most carry one. */
      categories: z.array(z.string()).default([]),

      /* Optional: the August 2026 post was published with no featured image
         (its JSON-LD points at the bare origin), so the template falls back
         to the firm's generic blog artwork rather than breaking the build. */
      image: image().optional(),
      imageAlt: z.string().default(""),

      /* Extractive summaries drawn from each post's own statements. Optional so
         the component degrades cleanly on posts that don't have them yet.
         PENDING ATTORNEY REVIEW — see HANDOFF.md. */
      keyTakeaways: z.array(z.string()).optional(),

      /* The old Scorpion CMS URL, kept so the redirect map can be regenerated
         from the content itself rather than a separate side file. */
      legacyPath: z.string(),
    }),
});

export const collections = { blog };
