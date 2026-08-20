/* JSON-LD builders.
 *
 * ═══ Why this is a helper and not a sitewide emit from Layout ═══
 *
 * The reference build emits the business schema from Layout on every page. That
 * is wrong for THIS site, and following it would have made the markup worse: 65
 * of the 93 pages already emit their own `LegalService` — the location pages and
 * practice areas scope it with a page-specific `areaServed` and `url` — and a
 * second, sitewide one would describe the same firm twice on every one of them.
 *
 * So the entity is built here and emitted where it is MISSING, starting with the
 * homepage, which is where a firm entity most belongs and was conspicuously
 * without one.
 *
 * The `@id` is the seam for finishing the job: give every emitter the same
 * `@id` and the duplicates collapse into one node that consumers merge, at
 * which point a sitewide emit becomes safe. See HANDOFF.md.
 */
import type { FirmDetails } from "../sanity/firmDetails";

/** The one stable identifier for the firm as an entity, across every page. */
export const FIRM_ID = (origin: string) => `${origin.replace(/\/+$/, "")}/#firm`;

/**
 * The firm as a `LegalService`, built from the Firm Details singleton.
 *
 * Every value comes from Sanity — nothing about the firm is retyped here, so a
 * phone number changed in the Studio changes the structured data too.
 */
export function legalServiceSchema(
  firm: FirmDetails,
  { origin }: { origin: string },
) {
  const base = origin.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "@id": FIRM_ID(base),
    name: firm.firmName,
    url: `${base}/`,
    telephone: firm.phone.display,
    email: firm.email.display,
    address: {
      "@type": "PostalAddress",
      streetAddress: firm.address.street,
      addressLocality: firm.address.locality,
      addressRegion: firm.address.region,
      postalCode: firm.address.postalCode,
      addressCountry: "US",
    },
    areaServed: firm.serviceAreas.map((serviceArea) => ({
      "@type": "Place",
      name: serviceArea.label,
    })),
    /* `href` is the absolute profile URL; `path` is the icon key. sameAs wants
       the URL. */
    ...(firm.socials?.length
      ? { sameAs: firm.socials.map((social) => social.href) }
      : {}),
  };
}
