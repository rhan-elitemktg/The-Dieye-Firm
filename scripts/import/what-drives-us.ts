/* One-time import: the "What Drives Us" band.
 *
 *   npx sanity exec scripts/import/what-drives-us.ts --with-user-token
 *
 * Strings transcribed verbatim from about/WhatDrivesUs.astro, which is where
 * they were hardcoded. The band renders on 8 pages, so the diff against the
 * frozen baseline is the test that the transcription is exact.
 *
 * The icons are NOT uploaded. They are inlined SVGs that take their colour from
 * the card through `currentColor`; as uploaded assets they would come back as
 * <img> and lose it. The document names one of three glyphs the component
 * carries instead.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

async function run() {
  await client.createOrReplace({
    _id: "whatDrivesUs",
    _type: "whatDrivesUs",
    eyebrow: "What Drives Us",
    headingLead: "The standard",
    headingAccent: "we hold.",
    values: [
      {
        _type: "value",
        _key: "compassion",
        icon: "compassionate-approach",
        title: "Compassionate Approach",
        text: "We meet you with empathy first, because this is your life, not just a case. You are heard here before anything else.",
      },
      {
        _type: "value",
        _key: "personal",
        icon: "client-focused",
        title: "Direct, Personal Attention",
        text: "You work with Papa himself, the attorney who knows your name, your story, and your goals, not a rotating cast of associates.",
      },
      {
        _type: "value",
        _key: "honest",
        icon: "experienced",
        title: "Honest Counsel",
        text: "Realistic expectations and straight answers, so you can make informed decisions about your family's future. No false promises.",
      },
    ],
  });
  console.log("✓ whatDrivesUs written");

  await waitForPublic('count(*[_id == "whatDrivesUs"])', 1, "the What Drives Us band");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
