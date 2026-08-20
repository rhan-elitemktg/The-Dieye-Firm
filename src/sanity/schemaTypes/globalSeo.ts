import { defineType, defineField } from "sanity";
import { SearchIcon } from "@sanity/icons/Search";

/* Global SEO Settings — the sitewide search knobs, as a SINGLETON.
 *
 * Kept separate from Firm Details on purpose. Firm Details is "who the firm
 * is" — name, address, phone, socials — and it feeds the LegalService JSON-LD,
 * which is a different concern that happens to also matter to search. This
 * document holds only the switches that exist to serve SEO and nothing else.
 *
 * Per-page overrides live on each page's own `seo` object and are untouched by
 * anything here — these are the FALLBACKS. That is the whole design of this
 * layer: every field is optional, and a page with an empty SEO tab renders
 * exactly what it rendered before the tab existed.
 */
export const globalSeo = defineType({
  name: "globalSeo",
  title: "Global SEO Settings",
  type: "document",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "discourageCrawling",
      title: "Discourage this site from being crawled",
      type: "boolean",
      description:
        "When ON, the whole site is hidden from Google and other search engines — every page gets a 'noindex' tag and robots.txt blocks crawlers. Use it while the site is still on its temporary address. ⚠️ TURN THIS OFF AT LAUNCH, or the real site will never appear in search.",
      initialValue: false,
    }),
    defineField({
      name: "defaultOgImage",
      title: "Default social share image",
      type: "image",
      description:
        "Shown when a shared page has no share image of its own. 1200 × 630 works best. Any page can override it in that page's own SEO tab.",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { discouraged: "discourageCrawling" },
    prepare: ({ discouraged }) => ({
      title: "Global SEO Settings",
      /* The one setting on this site that can silently cost every ranking, so
         it says so on the row rather than only inside the document. */
      subtitle: discouraged ? "⚠️ Hidden from search engines" : undefined,
    }),
  },
});
