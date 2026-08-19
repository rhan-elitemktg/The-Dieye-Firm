/* One-time import: /about-us/choosing-a-family-law-attorney/ — phase 5.
 *
 *   npx sanity exec scripts/import/hiring-guide-page.ts --with-user-token
 *
 * This page has no comp: it was built from the live site's own 738 words,
 * because where the client's published prose exists it is the source and it
 * carries the equity. The text below is theirs.
 *
 * The body becomes PORTABLE TEXT, converted by lib/html-to-pt.ts, which throws
 * on any tag it was not written for. These paragraphs carry LINKS into the
 * practice-area section — as plain strings an editor would be hand-typing
 * `<a href>` on the one page whose job is cross-linking.
 *
 * Headings stay OUTSIDE the rich text: Portable Text headings render through
 * ProseHeading, which stamps an id on each, and these never had one.
 *
 * Read out of the page file rather than restated, so the two cannot disagree,
 * and the block count is asserted so a regex that matches less than it should
 * fails here instead of publishing a page with a paragraph missing.
 */

import { getCliClient } from "sanity/cli";
import { paragraphsToPt, decode } from "./lib/html-to-pt";
import { waitForPublic } from "./lib/wait-for-public";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const client = getCliClient({ apiVersion: "2025-08-15" });

const PAGE = readFileSync(
  join(process.cwd(), "src/pages/about-us/choosing-a-family-law-attorney.astro"),
  "utf8",
);

const start = PAGE.indexOf("const sections = [");
const end = PAGE.indexOf("\n];\n", start);
if (start === -1 || end === -1) throw new Error("hiring guide import: could not find `sections`");
const src = PAGE.slice(start, end);

const sections = src
  .split(/\n  \{\n/)
  .slice(1)
  .map((block, index) => {
    const heading = /heading: "([^"]*)"/.exec(block)?.[1];
    if (!heading) throw new Error("hiring guide import: a section has no heading");
    const paragraphs = [...block.matchAll(/`([^`]*)`/g)].map((m) => m[1]);
    if (!paragraphs.length) throw new Error(`hiring guide import: "${heading}" has no paragraphs`);
    return {
      _type: "section",
      _key: `section-${index + 1}`,
      heading: decode(heading),
      body: paragraphsToPt(paragraphs, `s${index}b`),
    };
  });

async function run() {
  const expected = src.match(/`[^`]*`/g)?.length ?? 0;
  const parsed = sections.reduce((sum, section) => sum + section.body.length, 0);
  if (parsed !== expected) {
    throw new Error(`hiring guide import: source has ${expected} paragraphs, parsed ${parsed}`);
  }

  await client.createOrReplace({
    _id: "hiringGuidePage",
    _type: "hiringGuidePage",
    header: {
      kicker: "About Us",
      kickerHref: "/about-us/",
      title: "Choosing a Texas Family Law Attorney",
    },
    sections,
  });
  console.log(`✓ hiringGuidePage written — ${sections.length} sections, ${parsed} paragraphs`);

  await waitForPublic('count(*[_id == "hiringGuidePage"])', 1, "the hiring guide");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
