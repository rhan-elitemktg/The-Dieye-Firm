/* One-time import: the "By the Numbers" strip moves out of `aboutPage`.
 *
 *   npx sanity exec scripts/import/stats-band.ts --with-user-token
 *
 * It renders on /about-us/ AND /practice-areas/, so it is a record, not a
 * page's copy. Same move as the Success Stories band a commit earlier, and for
 * the same reason — see scripts/checks/page-copy-scope.mjs, which now fails the
 * build for this class of mistake instead of leaving it to be noticed.
 *
 * READS the four stats off `aboutPage` rather than hardcoding them, so anything
 * an editor has already changed is what moves, then unsets the old field: a
 * field the schema no longer declares is invisible in the Studio but still in
 * the document, and a stale copy is what the move exists to prevent.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

async function run() {
  const about = (await client.getDocument("aboutPage")) as
    | { byTheNumbers?: { stats?: { _key: string; value: string; label: string }[] } }
    | undefined;

  const stats = about?.byTheNumbers?.stats;
  if (!stats?.length) {
    throw new Error(
      "aboutPage.byTheNumbers.stats is empty, so there is nothing to move. If the strip " +
        "has already been moved, this script has already run.",
    );
  }

  await client.createOrReplace({ _id: "statsBand", _type: "statsBand", stats });
  console.log(`✓ statsBand written with ${stats.length} figures`);

  await client.patch("aboutPage").unset(["byTheNumbers"]).commit();
  console.log("✓ aboutPage.byTheNumbers unset");

  await waitForPublic('count(*[_id == "statsBand"])', 1, "the By the Numbers band");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
