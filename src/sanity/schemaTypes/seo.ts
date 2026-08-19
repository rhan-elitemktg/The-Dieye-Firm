import { defineType, defineField } from "sanity";

/* Per-page search metadata. One shared object attached to every routed document
 * — the page singletons plus practiceArea, locationPage and blogPost — so the
 * SEO team can tune any page in the Studio without a code change.
 *
 * EVERY FIELD IS OPTIONAL, AND THAT IS THE DESIGN. Left empty, a page renders
 * exactly the title and description it rendered before this type existed; the
 * fallbacks live in src/lib/seo.ts. Adding the field to a document is a no-op
 * until someone deliberately fills it in, which is what lets the whole SEO layer
 * land without changing a single page.
 *
 * Length rules are `.warning()`, NEVER `.error()`. Publishing fires the Vercel
 * deploy hook, so a blocking validation error over a 62-character title would
 * stop the entire site rebuilding on a nitpick. Reserve errors for things that
 * would actually break a page.
 *
 * No keywords field — Google has ignored the tag for years. No separate og:title
 * and og:description either: they would double the field count for a case that
 * almost never differs from the meta pair, and both fall back to it.
 *
 * The sitewide og:image default and the "hide this site from search engines"
 * master switch belong to a `globalSeo` singleton, which lands with the rest of
 * the SEO layer (sitemap, robots, editor-managed redirects). The Studio's
 * Site Settings → Global SEO Settings folder is reserved for it now so that pass
 * moves no Studio URL.
 */
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      description:
        'The page name in search results and in the browser tab. " | The Dieye Firm" is added automatically, so don\'t type it. Leave empty to use the page\'s normal heading.',
      validation: (rule) =>
        rule
          .max(60)
          .warning("Titles over about 60 characters get truncated in search results."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      description:
        "The summary under the title in search results. Leave empty to use the page's existing opening line.",
      validation: (rule) =>
        rule
          .max(160)
          .warning(
            "Descriptions over about 160 characters get truncated in search results.",
          ),
    }),
    defineField({
      name: "canonicalUrl",
      title: "Canonical URL",
      type: "url",
      description:
        "Only needed when this page duplicates another one — point it at the version search engines should rank. Leave empty and the page points at itself.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      description:
        "Keeps this page out of Google and out of the sitemap. The page stays live and reachable by link.",
      initialValue: false,
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description:
        "Shown when the page is shared on Facebook, LinkedIn or X. 1200 × 630 works best. Leave empty to use the site-wide default.",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "metaTitle", noIndex: "noIndex" },
    prepare({ title, noIndex }) {
      return {
        title: title || "SEO",
        subtitle: noIndex ? "Hidden from search engines" : undefined,
      };
    },
  },
});
