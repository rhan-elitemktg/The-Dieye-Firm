/* One-time migration: firmDetails' navigation fields + the hardcoded main-nav
 * children -> the `navigation` singleton.
 *
 * ═══ What moves, and from where ═══
 *
 *   serviceAreas, footerNav, legalLinks   <- firmDetails (verbatim, keys and all)
 *   practiceAreaLinks                     <- FAMILY_LAW_NAV in MainNav.astro
 *   aboutLinks, resourcesLinks            <- the `nav` array in MainNav.astro
 *
 * The three moved arrays are copied with their `_key`s intact, so the Studio
 * sees the same rows rather than a fresh set — drag order and any future
 * references survive.
 *
 * The practice-area rows become REFERENCES. The hardcoded list keyed on
 * collection ids, so the ids resolve to documents here; if one does not, this
 * throws rather than writing a menu with a hole in it.
 *
 * ═══ Order matters, and this script is step one ═══
 *
 * Run this BEFORE removing the fields from the firmDetails schema. A field the
 * schema does not declare is pruned the next time an editor saves that
 * document, so the data has to be somewhere else first. The unset of the old
 * fields is step two, and lives at the bottom behind --cleanup, so it cannot
 * run before the code that reads the new location has been deployed.
 *
 *   npx sanity exec scripts/import/navigation.ts --with-user-token
 *   npx sanity exec scripts/import/navigation.ts --with-user-token -- --apply
 *   npx sanity exec scripts/import/navigation.ts --with-user-token -- --cleanup
 */

import { getCliClient } from "sanity/cli";

const apply = process.argv.includes("--apply");
const cleanup = process.argv.includes("--cleanup");
const client = getCliClient({ apiVersion: "2025-08-15" });

/* Lifted verbatim from FAMILY_LAW_NAV in MainNav.astro. Order is editorial. */
const PRACTICE_AREA_LINKS: { id: string; label?: string }[] = [
  { id: "divorce" },
  { id: "child-custody" },
  { id: "family-law" },
  { id: "child-support" },
  { id: "domestic-violence" },
  { id: "protective-restraining-orders", label: "Protective Orders" },
];

/* Lifted verbatim from the `nav` array in MainNav.astro. */
const ABOUT_LINKS = [
  {
    label: "Choosing a Family Law Attorney",
    href: "/about-us/choosing-a-family-law-attorney/",
  },
];
const RESOURCES_LINKS = [
  { label: "FAQs", href: "/faq/" },
  { label: "Videos", href: "/video-center/" },
];

const key = (prefix: string, i: number) => `${prefix}${i}`;

async function main() {
  if (cleanup) return runCleanup();

  const firm = await client.fetch<{
    serviceAreas?: unknown[];
    footerNav?: unknown[];
    legalLinks?: unknown[];
  } | null>(`*[_id == "firmDetails"][0]{ serviceAreas, footerNav, legalLinks }`);

  if (!firm) throw new Error("No firmDetails document — nothing to migrate from.");

  /* Resolve the practice-area ids to real documents. A miss is fatal: a menu
     with a hole in it is worse than a failed script. */
  const ids = PRACTICE_AREA_LINKS.map((link) => link.id);
  const found = await client.fetch<{ _id: string; slug: string; navLabel: string }[]>(
    `*[_type == "practiceArea" && slug.current in $ids]{ _id, "slug": slug.current, navLabel }`,
    { ids },
  );
  const bySlug = new Map(found.map((doc) => [doc.slug, doc]));
  const missing = ids.filter((id) => !bySlug.has(id));
  if (missing.length) {
    throw new Error(
      `No practiceArea document for: ${missing.join(", ")}. ` +
        `Either the slug changed or the page is gone.`,
    );
  }

  const doc = {
    _id: "navigation",
    _type: "navigation" as const,
    practiceAreaLinks: PRACTICE_AREA_LINKS.map((link, i) => ({
      _key: key("pa", i),
      _type: "practiceAreaLink",
      area: { _type: "reference", _ref: bySlug.get(link.id)!._id },
      ...(link.label ? { label: link.label } : {}),
    })),
    serviceAreas: firm.serviceAreas ?? [],
    aboutLinks: ABOUT_LINKS.map((link, i) => ({ _key: key("about", i), ...link })),
    resourcesLinks: RESOURCES_LINKS.map((link, i) => ({ _key: key("res", i), ...link })),
    footerNav: firm.footerNav ?? [],
    legalLinks: firm.legalLinks ?? [],
  };

  console.log("Would write the `navigation` singleton:");
  console.log(`  practiceAreaLinks : ${doc.practiceAreaLinks.length} (references)`);
  doc.practiceAreaLinks.forEach((link, i) => {
    const src = PRACTICE_AREA_LINKS[i];
    console.log(
      `      ${src.id}${src.label ? `  →  "${src.label}"` : `  (uses "${bySlug.get(src.id)!.navLabel}")`}`,
    );
  });
  console.log(`  serviceAreas      : ${doc.serviceAreas.length}  (moved from firmDetails)`);
  console.log(`  aboutLinks        : ${doc.aboutLinks.length}`);
  console.log(`  resourcesLinks    : ${doc.resourcesLinks.length}`);
  console.log(`  footerNav         : ${doc.footerNav.length}  (moved)`);
  console.log(`  legalLinks        : ${doc.legalLinks.length}  (moved)`);

  if (!apply) {
    console.log("\nDRY RUN — nothing written. Pass -- --apply to commit.");
    return;
  }

  await client.createOrReplace(doc);
  console.log("\n✔ Wrote the `navigation` singleton.");
  console.log(
    "firmDetails still holds its copies. Update the code to read from\n" +
      "`navigation`, verify, deploy — THEN run this again with -- --cleanup.",
  );
}

/**
 * Step two, run only after the site reads from `navigation`.
 *
 * The old fields are left on firmDetails by the migration on purpose: until the
 * deployed code reads the new location, they are the live values, and unsetting
 * them would take the nav and footer off the site.
 */
async function runCleanup() {
  const nav = await client.fetch<{ serviceAreas?: unknown[] } | null>(
    `*[_id == "navigation"][0]{ serviceAreas }`,
  );
  if (!nav?.serviceAreas?.length) {
    throw new Error(
      "The `navigation` singleton has no serviceAreas — run the migration first.",
    );
  }

  if (!apply) {
    console.log(
      "Would unset serviceAreas, footerNav and legalLinks on firmDetails.\n" +
        "DRY RUN — pass -- --cleanup --apply to commit.",
    );
    return;
  }

  await client
    .patch("firmDetails")
    .unset(["serviceAreas", "footerNav", "legalLinks"])
    .commit({ visibility: "sync" });
  console.log("✔ Removed the moved fields from firmDetails.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
