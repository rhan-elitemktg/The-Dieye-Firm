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

/* The 32 location pages, ingested by scripts/scrape-locations.mjs.
 *
 * NOT to be confused with `firmDetails.serviceAreas`, which is the FOUR nav
 * entries in the Service Areas flyout. These are the pages those four head —
 * the same trap as /family-law/ versus /practice-areas/, so the two are named
 * apart deliberately.
 *
 * The file path IS the route, with no prefix to strip: the live URLs sit at the
 * site root, so src/content/locations/sugar-land-family-law-attorney/divorce/
 * uncontested-divorce.md renders at that exact path. src/pages/[...slug].astro
 * consumes the id whole. Unlike the practice areas there is no section root
 * exception — every id is its own route.
 *
 * URLs match the live site exactly, so this section needs no redirects.
 *
 * Shaped as a Sanity `locationPage` document will return, same as the other
 * two collections — `location` and `parent` both become references, which is
 * why each stores the target's id rather than a path. */
const locations = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/locations" }),
  schema: z.object({
    /* The page h1, SEO-shaped on every page ("Sugar Land Paternity Attorney"). */
    title: z.string(),

    /* The short form for the sidebar menu ("Paternity"), read off the client's
       own /site-map/. The four location roots take theirs from the LOCATIONS
       table in the scraper instead, because the site map calls them "Sugar Land
       Family Law Attorney" — right for a sitemap link, and wrong for a menu
       whose every row would then repeat the city. */
    navLabel: z.string(),

    seoTitle: z.string().optional(),
    description: z.string(),

    /* The deck between the h1 and the opening paragraph. Present on 31 of 32 —
       .../mothers-rights/ opens straight into copy. */
    subtitle: z.string().optional(),

    /* Which location's menu this page belongs to: the id of that location's
       ROOT page. On a root it points at itself, so "which location am I in" is
       a total function with no branch.

       NOT derived from the URL, for the same reason `parent` isn't on the
       practice areas. Two Pasadena pages hang off the site root —
       /pasadena-child-support-attorney/ and
       /pasadena-family-law-mediation-attorney/ — and are placed by
       LOCATION_OVERRIDES in the scraper. Their URLs do not move; only their
       grouping is ours. Deriving from the path would work for 30 and need a
       special case for 2, which puts the truth in two places. */
    location: z.string(),

    /* The row above this one WITHIN its location. Absent on a location's
       top-level rows — including the root itself — and set only at the third
       level (.../divorce/uncontested-divorce/ → .../divorce/), which is what
       lets buildTree() be shared with the practice-area menu unchanged. */
    parent: z.string().optional(),

    /* Lifted out of the body by the scraper so they render as real markup with
       real FAQPage JSON-LD. Unlike the practice areas, none of these pages
       carries FAQPage microdata — the extraction is heading-based and audited
       in the run output. About 24 of the 32 have one. */
    faqs: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .default([]),

    legacyPath: z.string(),
  }),
});

export const collections = { blog, practiceAreas, locations };
