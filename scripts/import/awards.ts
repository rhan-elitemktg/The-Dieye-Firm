/* One-time import: the accreditation strip — its heading and its seven badges.
 *
 *   npx sanity exec scripts/import/awards.ts --with-user-token
 *
 * Transcribed from home/Awards.astro, where the seven were imports and an
 * array. The PNGs ARE uploaded: this is the type most likely to gain a document
 * without a developer, and a badge collection an editor cannot add a badge to
 * would be a list of seven things they can only delete.
 *
 * `width` travels with each badge because it varies by source file, not by
 * layout: the Texas Bar lockup ships at 1024px for a badge that never renders
 * above 190, while the rest are already at or under their cap.
 *
 * ORDER. The strip reads Martindale first and the Texas Bar lockup last. Each
 * document is given an explicit orderRank in that sequence rather than being
 * left to sort by creation time, which would be an accident that happened to
 * look right.
 */

import { getCliClient } from "sanity/cli";
import { createReadStream } from "node:fs";
import { join } from "node:path";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const AWARDS = [
  {
    id: "award-av-preeminent",
    file: "av-preeminent.png",
    width: 256,
    alt: "Martindale-Hubbell AV Preeminent, peer rated for the highest level of professional excellence",
  },
  {
    id: "award-avvo-superb",
    file: "avvo-superb.png",
    width: 155,
    alt: "Avvo Rating 10.0 Superb, Top Lawyer",
  },
  {
    id: "award-national-top-100",
    file: "national-top-100-black-lawyers.png",
    width: 175,
    alt: "The National Top 100 Black Lawyers",
  },
  {
    id: "award-avvo-top-attorney",
    file: "avvo-top-attorney.png",
    width: 263,
    alt: "Avvo Rating 10.0, Papa Magaye Dieye, Top Attorney",
  },
  {
    id: "award-avvo-reviews",
    file: "avvo-reviews.png",
    width: 242,
    alt: "Avvo Reviews, 4.5 stars out of 17 reviews for Papa Magaye Dieye",
  },
  {
    id: "award-avvo-clients-choice",
    file: "avvo-clients-choice.png",
    width: 313,
    alt: "Avvo Clients' Choice Award 2016, Papa Magaye Dieye",
  },
  {
    id: "award-texas-bar-college",
    file: "texas-bar-college.png",
    width: 380,
    alt: "Proud member of the Texas Bar College",
  },
];

/* The plugin sorts on these lexically, so they are zero-padded and spaced: the
   gaps leave room for a badge dragged between two without renumbering. */
const rank = (i: number) => `0|${String((i + 1) * 100000).padStart(6, "0")}:`;

async function run() {
  const tx = client.transaction();

  for (const [i, award] of AWARDS.entries()) {
    const asset = await client.assets.upload(
      "image",
      createReadStream(join(process.cwd(), "src/assets/images/awards", award.file)),
      { filename: award.file },
    );
    console.log(`   uploaded ${award.file.padEnd(34)} ${asset._id}`);

    tx.createOrReplace({
      _id: award.id,
      _type: "award",
      orderRank: rank(i),
      alt: award.alt,
      width: award.width,
      image: { _type: "image", asset: { _type: "reference", _ref: asset._id } },
    });
  }

  tx.createOrReplace({
    _id: "awardsBand",
    _type: "awardsBand",
    heading: "Awards & Recognition",
  });

  await tx.commit();
  console.log(`✓ awardsBand + ${AWARDS.length} awards written`);

  await waitForPublic('count(*[_type == "award"])', AWARDS.length, "the award badges");
  await waitForPublic('count(*[_id == "awardsBand"])', 1, "the awards band heading");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
