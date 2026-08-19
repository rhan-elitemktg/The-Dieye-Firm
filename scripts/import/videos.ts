/* One-time import: the nine videos.
 *
 *   npx sanity exec scripts/import/videos.ts --with-user-token
 *
 * Transcribed from video-center/VideoGrid.astro (all nine, with the landscape
 * posters and the grid order) and home/VideoReels.astro (the six shorts, with
 * the portrait posters and the homepage order). Those two files held the SAME
 * SIX TITLES twice; they are one field here now.
 *
 * BOTH ORDERS ARE PRESERVED EXACTLY, and they disagree on purpose. The grid
 * order is arranged so that the three photographs used twice never land next to
 * each other at 3-up, 2-up or one column; the homepage order is arranged so
 * that four posters across six slides never repeat within a view. Read the
 * comment at the top of VideoGrid.astro before changing either.
 *
 * Posters are uploaded rather than left in src/assets/, because a collection an
 * editor cannot add a video to is a list of nine things they can only delete -
 * and a new video with no poster is not a card, it is a hole in the grid.
 */

import { getCliClient } from "sanity/cli";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

type Row = {
  id: string;
  wistiaId: string;
  title: string;
  label: "The Firm" | "Quick Answer";
  aspect: "16/9" | "9/16";
  poster: string;
  reelOrder?: number;
  reelPoster?: string;
};

/* In GRID order. `reelOrder` is the homepage carousel's own sequence. */
const VIDEOS: Row[] = [
  {
    id: "video-about-the-firm",
    wistiaId: "xnom95l12h",
    title: "About The Dieye Firm",
    label: "The Firm",
    aspect: "16/9",
    poster: "papa-storefront.jpg",
  },
  {
    id: "video-what-makes-us-different",
    wistiaId: "btxq2ysibw",
    title: "What Makes Us Different",
    label: "The Firm",
    aspect: "16/9",
    poster: "papa-old-town-portrait.jpg",
  },
  {
    id: "video-choosing-an-attorney",
    wistiaId: "e15abitkx1",
    title: "Choosing An Attorney",
    label: "The Firm",
    aspect: "16/9",
    poster: "hero-testimonials.jpg",
  },
  {
    id: "video-dating-before-final",
    wistiaId: "bu44cm272t",
    title: "Dating before your divorce is final",
    label: "Quick Answer",
    aspect: "9/16",
    poster: "papa-tan-wide.jpg",
    reelOrder: 2,
    reelPoster: "reels/papa-reel-storefront.jpg",
  },
  {
    id: "video-judges-custody",
    wistiaId: "lfabb7o3i4",
    title: "What judges really look at in custody",
    label: "Quick Answer",
    aspect: "9/16",
    poster: "community/comm-n1.jpg",
    reelOrder: 1,
    reelPoster: "reels/papa-reel-pearland.jpg",
  },
  {
    id: "video-how-fast-divorce",
    wistiaId: "hf0aygaziw",
    title: "How fast can you get divorced in Texas?",
    label: "Quick Answer",
    aspect: "9/16",
    poster: "papa-water-tower.jpg",
    reelOrder: 3,
    reelPoster: "reels/papa-reel-sky.jpg",
  },
  {
    id: "video-legal-separation",
    wistiaId: "9d4t97fstd",
    title: "Is legal separation a thing in Texas?",
    label: "Quick Answer",
    aspect: "9/16",
    poster: "community/comm-n2.jpg",
    reelOrder: 4,
    reelPoster: "reels/papa-reel-portico.jpg",
  },
  {
    id: "video-im-done",
    wistiaId: "bc4fv4m4oz",
    title: 'Sometimes "I\'m done" is all it takes',
    label: "Quick Answer",
    aspect: "9/16",
    poster: "hero-practice.jpg",
    reelOrder: 5,
    reelPoster: "reels/papa-reel-pearland.jpg",
  },
  {
    id: "video-need-a-lawyer",
    wistiaId: "aed5yc9gn0",
    title: "Do you really need a divorce lawyer?",
    label: "Quick Answer",
    aspect: "9/16",
    poster: "papa-hero-b.jpg",
    reelOrder: 6,
    reelPoster: "reels/papa-reel-storefront.jpg",
  },
];

const rank = (i: number) => `0|${String((i + 1) * 100000).padStart(6, "0")}:`;

/* Four portrait posters cover six slides, so two files are referenced twice.
   Uploading each once keeps one asset behind both references. */
const uploaded = new Map<string, string>();

async function upload(path: string): Promise<string> {
  const cached = uploaded.get(path);
  if (cached) return cached;
  const asset = await client.assets.upload(
    "image",
    createReadStream(join(process.cwd(), "src/assets/images", path)),
    { filename: path.split("/").pop() },
  );
  uploaded.set(path, asset._id);
  console.log(`   uploaded ${path.padEnd(34)} ${asset._id}`);
  return asset._id;
}

const image = (ref: string) => ({
  _type: "image" as const,
  asset: { _type: "reference" as const, _ref: ref },
});

async function run() {
  const tx = client.transaction();

  for (const [i, row] of VIDEOS.entries()) {
    const poster = await upload(row.poster);
    const reelPoster = row.reelPoster ? await upload(row.reelPoster) : undefined;

    tx.createOrReplace({
      _id: row.id,
      _type: "video",
      orderRank: rank(i),
      title: row.title,
      wistiaId: row.wistiaId,
      label: row.label,
      aspect: row.aspect,
      poster: image(poster),
      ...(row.reelOrder ? { reelOrder: row.reelOrder } : {}),
      ...(reelPoster ? { reelPoster: image(reelPoster) } : {}),
    });
  }

  await tx.commit();
  const reels = VIDEOS.filter((v) => v.reelOrder).length;
  console.log(`✓ ${VIDEOS.length} videos written (${reels} on the homepage)`);

  await waitForPublic('count(*[_type == "video"])', VIDEOS.length, "the videos");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
