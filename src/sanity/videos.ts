import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { SanityImage } from "./image";

/* The videos, and the one place Wistia is asked anything.
 *
 * Two surfaces, two shapes: the /video-center/ grid takes all nine in drag
 * order with their landscape posters, and the homepage carousel takes the ones
 * carrying a `reelOrder`, in that order, with their portrait posters. The two
 * orders are deliberately different; the schema header says why.
 *
 * ═══ Runtime ═══
 *
 * Fetched from Wistia's oEmbed endpoint at BUILD time, never stored. Each
 * request is wrapped, so an outage costs the duration pill rather than the
 * build. The fetch is done ONCE per video here rather than once per surface:
 * the six shorts appear on both pages, and the old arrangement asked Wistia
 * about each of them twice per build.
 */
const VIDEOS_QUERY = defineQuery(`
  *[_type == "video"] | order(orderRank){
    "id": wistiaId,
    title,
    label,
    aspect,
    reelOrder,
    poster{ asset, "dimensions": asset->metadata.dimensions },
    reelPoster{ asset, "dimensions": asset->metadata.dimensions }
  }
`);

export type Video = {
  id: string;
  title: string;
  label: string;
  aspect: "16/9" | "9/16";
  reelOrder?: number;
  poster: SanityImage;
  reelPoster?: SanityImage;
  /** From Wistia at build time; null when the request fails or is slow. */
  runtime: string | null;
};

let cache: Promise<Video[]> | undefined;

async function runtimeFor(id: string): Promise<string | null> {
  const mediaUrl = "https://home.wistia.com/medias/" + id;
  const oembedUrl = "https://fast.wistia.com/oembed?url=" + encodeURIComponent(mediaUrl);
  try {
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;
    const data = await response.json();
    const duration = typeof data.duration === "number" ? data.duration : null;
    return duration
      ? `${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, "0")}`
      : null;
  } catch {
    return null;
  }
}

async function fetchVideos(): Promise<Video[]> {
  const docs = (await sanityClient.fetch(VIDEOS_QUERY)) as Omit<Video, "runtime">[] | null;
  if (!docs?.length) {
    throw new Error(
      "No video documents in Sanity. Import them with:\n" +
        "  npx sanity exec scripts/import/videos.ts --with-user-token",
    );
  }
  return Promise.all(
    docs.map(async (doc) => ({ ...doc, runtime: await runtimeFor(doc.id) })),
  );
}

function all(): Promise<Video[]> {
  if (!import.meta.env.PROD) return fetchVideos();
  cache ??= fetchVideos();
  return cache;
}

/** All nine, in grid order — /video-center/. */
export function getVideos(): Promise<Video[]> {
  return all();
}

/** The ones with a homepage position, in that order — the homepage carousel. */
export async function getReels(): Promise<Video[]> {
  const picked = (await all()).filter((video) => typeof video.reelOrder === "number");
  const missing = picked.find((video) => !video.reelPoster?.asset);
  if (missing) {
    /* Schema validation is a warning an editor can publish through, and the
       cost here is a carousel slide with no artwork on the homepage. */
    throw new Error(
      `The video "${missing.title}" has a homepage position but no portrait poster.`,
    );
  }
  return picked.sort((a, b) => a.reelOrder! - b.reelOrder!);
}
