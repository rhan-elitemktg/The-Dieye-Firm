/* One-time import: /privacy-policy/ — phase 5.
 *
 *   npx sanity exec scripts/import/privacy-policy-page.ts --with-user-token
 *
 * The body becomes PORTABLE TEXT, converted from the page's HTML strings by
 * lib/html-to-pt.ts, which throws on any tag it was not written for rather than
 * dropping it. Bold survives as a decorator.
 *
 * Headings stay OUTSIDE the rich text: Portable Text headings render through
 * ProseHeading, which stamps an id on each, and these eight never had one.
 *
 * The closing sentence keeps its own field. The phone number and postal address
 * that follow it come from `firmDetails`, so this page cannot end up publishing
 * a number the rest of the site has stopped using.
 *
 * Two deviations from the live policy travel with the source and are unchanged
 * here — see the comments in the page file this was lifted from.
 */

import { getCliClient } from "sanity/cli";
import { paragraphsToPt, listToPt, decode, type Block } from "./lib/html-to-pt";
import { waitForPublic } from "./lib/wait-for-public";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const client = getCliClient({ apiVersion: "2025-08-15" });

/* Read the arrays out of the page rather than restating them: this script and
   that file must agree exactly, and the only way to guarantee that is to have
   one of them be the other's source. */
const PAGE = readFileSync(join(process.cwd(), "src/pages/privacy-policy.astro"), "utf8");

function slice(from: string, to: string): string {
  const start = PAGE.indexOf(from);
  const end = PAGE.indexOf(to, start);
  if (start === -1 || end === -1) throw new Error(`privacy import: could not find ${from}`);
  return PAGE.slice(start, end);
}

const introHtml = [...slice("const intro = [", "];").matchAll(/`([^`]*)`/g)].map((m) => m[1]);

const sectionsSrc = slice("const sections = [", "\n];\n");
const sections = sectionsSrc
  .split(/\n  \{\n/)
  .slice(1)
  .map((block, index) => {
    const heading = /heading: "([^"]*)"/.exec(block)?.[1];
    if (!heading) throw new Error("privacy import: a section has no heading");

    const body: Block[] = [];
    let contactNote: string | undefined;
    let cursor = 0;

    /* `ul` sits across several lines while `p` and `contact` are one-liners, so
       the alternation has to allow the newlines and the surrounding indentation.
       Getting this wrong drops the list SILENTLY, which is why run() asserts on
       the block count rather than trusting the parse. */
    for (const entry of block.matchAll(/\{ (p|contact): `([^`]*)` \}|\{\s*ul:\s*\[([\s\S]*?)\],?\s*\}/g)) {
      const [, kind, text, list] = entry;
      if (kind === "p") body.push(...paragraphsToPt([text], `s${index}b${cursor++}`));
      else if (kind === "contact") contactNote = text;
      else {
        const items = [...list.matchAll(/`([^`]*)`/g)].map((m) => m[1]);
        body.push(...listToPt(items, `s${index}u${cursor++}`));
      }
    }

    if (!body.length) throw new Error(`privacy import: section "${heading}" produced no blocks`);
    return {
      _type: "section",
      _key: `section-${index + 1}`,
      heading: decode(heading),
      body,
      ...(contactNote ? { contactNote: decode(contactNote) } : {}),
    };
  });

const intro = paragraphsToPt(introHtml, "intro");

async function run() {
  if (sections.length !== 8) throw new Error(`privacy import: expected 8 sections, parsed ${sections.length}`);

  /* The source's own count, so a regex that quietly matches less than it should
     fails here rather than publishing a policy with a paragraph missing. */
  const expected =
    (PAGE.match(/\{ p: `/g)?.length ?? 0) +
    [...PAGE.matchAll(/ul:\s*\[([\s\S]*?)\]/g)].reduce(
      (sum, m) => sum + (m[1].match(/`[^`]*`/g)?.length ?? 0),
      0,
    ) +
    introHtml.length;
  const parsed = sections.reduce((sum, section) => sum + section.body.length, 0) + intro.length;
  if (parsed !== expected) {
    throw new Error(`privacy import: source has ${expected} blocks, parsed ${parsed}`);
  }
  if (introHtml.length !== 1) throw new Error(`privacy import: expected 1 intro paragraph, parsed ${introHtml.length}`);

  await client.createOrReplace({
    _id: "privacyPolicyPage",
    _type: "privacyPolicyPage",
    header: { kicker: "Legal", title: "Privacy Policy" },
    intro,
    sections,
  });

  const blocks = sections.reduce((sum, section) => sum + section.body.length, 0);
  console.log(`✓ privacyPolicyPage written — ${sections.length} sections, ${blocks} blocks`);

  await waitForPublic('count(*[_id == "privacyPolicyPage"])', 1, "the privacy policy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
