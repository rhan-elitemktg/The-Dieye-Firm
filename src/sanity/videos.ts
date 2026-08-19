import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { SanityImage } from "./image";

/* The videos, and the one place Wistia is asked anything.
 *
 * Two surfaces, two shapes: the /video-center/ grid takes all nine in drag
 * order with their landscape posters, and the homepage carousel takes the ones
 * picked in `homePage.videoReels.picks`, in THAT array's order, with their
 * portrait posters. The two orders are deliberately different; the field
 * descriptions on both say why.
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
    poster{ asset, "dimensions": asset->metadata.dimensions },
    reelPoster{ asset, "dimensions": asset->metadata.dimensions }
  }
`);

export type Video = {
  id: string;
  title: string;
  label: string;
  aspect: "16/9" | "9/16";
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

const REEL_PICKS_QUERY = defineQuery(`
  *[_id == "homePage"][0].videoReels.picks[]->wistiaId
`);

/** The ones picked on the homepage, in THAT array's order — the carousel.
 *
 * The picks live on `homePage` rather than on the videos, so an editor choosing
 * what the homepage shows does it on the homepage. The ORDER is the array's, not
 * the grid's, and the two are deliberately unequal — see the field description.
 *
 * Ordering is done here rather than in GROQ because a `picks[]->` projection
 * returns documents in the array's order, but `all()` is one cached fetch for
 * both surfaces and is sorted by `orderRank` for the grid. So this asks for the
 * ids only, and re-orders the cached list to match. */
export async function getReels(): Promise<Video[]> {
  const ids = (await sanityClient.fetch(REEL_PICKS_QUERY)) as string[] | null;
  if (!ids?.length) {
    throw new Error(
      "homePage.videoReels.picks is empty — the homepage carousel has no videos. " +
        "Set it in the Studio under Pages → Home Page → Video Reels.",
    );
  }
  const byId = new Map((await all()).map((v) => [v.id, v]));
  const picked = ids.map((id) => {
    const video = byId.get(id);
    if (!video) {
      throw new Error(
        `homePage.videoReels.picks points at a video that no longer exists (wistiaId ${id}).`,
      );
    }
    return video;
  });
  const missing = picked.find((video) => !video.reelPoster?.asset);
  if (missing) {
    /* Schema validation cannot see this: the pick is on another document. The
       cost of letting it through is a carousel slide with no artwork. */
    throw new Error(
      `The video "${missing.title}" is picked for the homepage but has no portrait poster.`,
    );
  }
  return picked;
}
