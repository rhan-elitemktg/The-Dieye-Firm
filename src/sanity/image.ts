import createImageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "sanity:client";
import type { SanityImageSource } from "@sanity/image-url";

/* Sanity image URLs.
 *
 * Editor-supplied images go through Sanity's CDN rather than Astro's image
 * pipeline. They have to: `astro:assets` optimises files that exist in the repo
 * at build time, and a post's artwork is uploaded in the Studio, so there is no
 * local file to point it at.
 *
 * Design assets — the eyebrow bird, the logos, hero photography, the fallback
 * blog artwork — stay in src/assets and keep going through <Image>. The split is
 * "who chooses this file": if an editor does, it lives in Sanity.
 *
 * ⚠ ALWAYS pass explicit width and height to the <img>. Astro's <Image> derives
 * them from the file and so reserves the space before the image loads; a bare
 * CDN URL does not, and every image on the page becomes a layout shift. The
 * dimensions come from `asset->metadata.dimensions`, which is why the queries
 * project it.
 *
 * The import subpath matters: `@sanity/image-url` exports the type from the
 * package root. The `/lib/types/types` path some examples use is dead and
 * resolves to `any`, which then hides real mistakes.
 */
const builder = createImageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/** A Sanity image with the metadata a non-shifting <img> needs. */
export type SanityImage = {
  asset?: { _ref?: string; _id?: string };
  alt?: string;
  dimensions?: { width: number; height: number; aspectRatio: number };
};

/**
 * A cropped `<img>` at a fixed box, plus a 2× srcset.
 *
 * `fit("crop")` honouring the image's hotspot is what keeps a portrait upload
 * from being letterboxed into a landscape card.
 */
export function croppedImage(image: SanityImage, width: number, height: number) {
  const base = urlFor(image as SanityImageSource).fit("crop").auto("format").quality(80);
  return {
    src: base.width(width).height(height).url(),
    srcset: `${base.width(width).height(height).url()} 1x, ${base
      .width(width * 2)
      .height(height * 2)
      .url()} 2x`,
    width,
    height,
  };
}

/**
 * A responsive `<img>` at its natural aspect ratio: a `w`-descriptor srcset over
 * `widths`, plus the intrinsic box so nothing shifts while it loads.
 *
 * The caller supplies its own `sizes`, because only the caller knows how wide
 * the image renders in its layout — the same split `<Image widths sizes>` uses.
 *
 * `height` is derived from the asset's real aspect ratio rather than assumed. If
 * the metadata is missing the height is omitted rather than guessed: a wrong
 * height is a visible squash, where a missing one is only a layout shift.
 */
export function responsiveImage(image: SanityImage, widths: number[]) {
  const base = urlFor(image as SanityImageSource).auto("format").quality(80);
  const largest = widths[widths.length - 1];
  const ratio = image.dimensions?.aspectRatio;
  return {
    src: base.width(largest).url(),
    srcset: widths.map((w) => `${base.width(w).url()} ${w}w`).join(", "),
    width: largest,
    height: ratio ? Math.round(largest / ratio) : undefined,
  };
}
