/* Resolves a page's <head> metadata from its Sanity `seo` block, falling back
 * to what the page already passed to Layout.
 *
 * ═══ The fallbacks are the whole point ═══
 *
 * Every SEO field is optional, so a page with an empty SEO tab must render
 * EXACTLY the title and description it rendered before the fields existed.
 * Nothing changes until an editor fills something in. That is the acceptance
 * test for this layer: a build before it and a build after it have
 * byte-identical <title> and <meta name="description"> on all 95 pages.
 *
 * ═══ Trailing slashes are KEPT ═══
 *
 * Unlike the reference build, this site serves every URL with a trailing slash
 * and its existing canonicals already say so. `canonicalize()` therefore
 * NORMALIZES TO the slash rather than stripping it — see routePaths.ts.
 */
/* From the package ROOT. The `/lib/types/types` subpath some examples use is
   dead and resolves to `any`, which then hides real mistakes — see the note
   in sanity/image.ts. */
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "../sanity/image";

/**
 * Appended to every <title>. Must equal the homepage's own `<Layout title>`
 * for the bare-brand case below to fire.
 */
export const SITE_NAME = "The Dieye Firm";

/** The `seo` object as any of the queries project it. All fields optional. */
export interface SeoInput {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean | null;
  ogImage?: SanityImageSource | null;
}

export interface ResolvedSeo {
  title: string;
  description?: string;
  canonical: string;
  noIndex: boolean;
  ogImage?: string;
}

/** Blank strings from the Studio count as "not set". */
const clean = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

/**
 * A page's absolute URL in the site's canonical form: exactly one trailing
 * slash. Shared with sitemap.xml so the two can never disagree.
 *
 * A query string or hash would make it a different URL, so anything past the
 * path is dropped rather than slash-normalized around.
 */
export const canonicalize = (url: URL | string) => {
  const parsed = typeof url === "string" ? new URL(url) : url;
  const path = parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${path}/`;
};

/**
 * The full <title>.
 *
 * ═══ The brand suffix applies to the EDITOR'S title, not to the fallback ═══
 *
 * This is a deliberate divergence from the reference build, and it is forced by
 * what is already on the page. 92 of this site's 93 titles are passed to Layout
 * with the brand ALREADY on them — "Pearland Divorce Lawyer | The Dieye Firm" —
 * and the 93rd is the homepage, which opens with it instead. Appending
 * unconditionally would ship "… | The Dieye Firm | The Dieye Firm" on 92 pages
 * and break the one guarantee this layer makes: an empty SEO tab changes
 * nothing.
 *
 * So a fallback passes through VERBATIM, and only a `metaTitle` an editor typed
 * gets the suffix — which is what `seo.ts`'s field description promises them
 * ("' | The Dieye Firm' is added automatically, so don't type it"). If they type
 * it anyway, it is not added twice.
 */
export function resolveTitle(seo: SeoInput | null | undefined, fallback: string) {
  const typed = clean(seo?.metaTitle);
  if (!typed) return fallback;
  if (typed === SITE_NAME) return typed;
  if (typed.includes(SITE_NAME)) return typed;
  return `${typed} | ${SITE_NAME}`;
}

/**
 * Everything Layout needs for the <head>.
 *
 * `pageUrl` is the page's own absolute URL (`Astro.url`), used as the canonical
 * unless the page overrides it. `defaultOgImage` is the sitewide fallback share
 * image from the Global SEO Settings singleton.
 */
export function resolveSeo(
  seo: SeoInput | null | undefined,
  {
    fallbackTitle,
    fallbackDescription,
    fallbackCanonical,
    pageUrl,
    defaultOgImage,
  }: {
    fallbackTitle: string;
    fallbackDescription?: string;
    /* Pages that already computed their own canonical keep it, so this layer
       cannot change a URL that was correct before it existed. */
    fallbackCanonical?: string;
    pageUrl: URL;
    defaultOgImage?: SanityImageSource | null;
  },
): ResolvedSeo {
  const image = seo?.ogImage ?? defaultOgImage ?? undefined;

  return {
    title: resolveTitle(seo, fallbackTitle),
    description: clean(seo?.metaDescription) ?? clean(fallbackDescription),
    canonical:
      clean(seo?.canonicalUrl) ?? fallbackCanonical ?? canonicalize(pageUrl),
    noIndex: seo?.noIndex === true,
    ogImage: image
      ? urlFor(image).width(1200).height(630).fit("crop").auto("format").url()
      : undefined,
  };
}
