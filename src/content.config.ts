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

      /* Which post takes the Blog index's featured panel. Editorial rather
         than date-driven on purpose: the newest post is sometimes the one
         without artwork, and the panel renders its image half-width and
         ~600px tall. Unset on every post falls back to the newest.
         Maps to a Sanity boolean in the migration. */
      featured: z.boolean().default(false),

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

/* Practice areas — the 31 family-law detail pages, ingested from the live site
   by `npm run scrape:practice-areas`. See scripts/scrape-practice-areas.mjs.

   The file layout IS the route: src/content/practice-areas/divorce.md becomes
   /family-law/divorce/, and .../divorce/military-divorce.md becomes
   /family-law/divorce/military-divorce/. The glob loader's id is already the
   nested slug, so nothing has to reassemble it.

   URLs match the live site exactly, so unlike the blog this section needs no
   redirects — which is also why there is no `legacyPath`-driven redirect map
   here. The field is kept only as a record of where each page came from.

   The /family-law/ index is deliberately NOT in this collection: it has a comp
   ("Practice Areas index.dc.html"), and AGENTS.md makes a comp the source of
   truth for both layout and copy wherever one exists.

   Shaped as a Sanity `practiceArea` document will return, same as the blog
   collection — modelling stays deferred until the static site is done. */
const practiceAreas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/practice-areas" }),
  schema: z.object({
    /* The page h1, which is SEO-shaped on every page ("Pearland Divorce
       Lawyer"). The short form used in nav and the sidebar is navLabel. */
    title: z.string(),

    /* The client's own nav wording ("Child Custody", "QDROs"). Distinct from
       `title` on all 31 pages, which is why both exist. */
    navLabel: z.string(),

    seoTitle: z.string().optional(),
    description: z.string(),

    /* The deck that sits between the h1 and the opening paragraph. Present on
       every page, but optional so a future page without one still builds. */
    subtitle: z.string().optional(),

    /* Top-level pages omit this. Set to the parent's slug on the 21 children,
       leaving 10 top-level areas.

       It is NOT derived from the URL. 13 of the 21 are nested on the live site
       too (10 under divorce, 3 under child-custody); the other 8 are
       re-parented by PARENT_OVERRIDES in the scraper to keep the sidebar menu
       to ten rows. Those 8 keep their flat URLs, so a page's path and its
       parent deliberately disagree — see the note there. */
    parent: z.string().optional(),

    /* schema.org FAQPage microdata found in the source. Only
       mediation-vs-litigation carries any today; the extractor is generic so
       more can arrive without a code change. */
    faqs: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .default([]),

    legacyPath: z.string(),
  }),
});

export const collections = { blog, practiceAreas };
