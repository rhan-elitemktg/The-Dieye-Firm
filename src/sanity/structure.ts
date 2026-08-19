import type { StructureResolver } from "sanity/structure";
import { icons } from "@sanity/icons";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

/* The Studio sidebar.
 *
 * Three folders — Pages, Collections, Site Settings — so it reads as a site map
 * rather than an alphabetical dump of document types. An editor looking for the
 * homepage looks under Pages; an editor adding a review looks under Collections.
 *
 * ── Icons ────────────────────────────────────────────────────────────────────
 * `@sanity/icons` v5 removed the NAMED root exports (`import { HomeIcon } from
 * "@sanity/icons"` gives you `undefined`), but the `icons` MAP is still there
 * and is the ergonomic choice for a file that needs two dozen glyphs. Schema
 * files, which need one each, use the per-icon subpath instead
 * (`@sanity/icons/Home`). Both are correct; don't unify them.
 *
 * No two rows share an icon, and no sidebar row shares an icon with a document
 * type — a duplicate makes two different things look like the same thing at a
 * glance, which is most of what an icon is for.
 *
 * ── Growth ───────────────────────────────────────────────────────────────────
 * This file is extended by every phase of the Sanity migration as its types
 * land, so the sidebar is never out of step with the schema. The catch-all at
 * the bottom is the safety net: a type nobody placed shows up at the root rather
 * than being silently unreachable.
 */

/* Types with exactly one document, pinned by fixed id below. Pinning the id is
   what makes a type a singleton — Sanity has no schema option for it. This list
   also drives the "＋ Create" filter in sanity.config.ts, so none can be
   duplicated into an orphan the sidebar can't reach. */
export const SINGLETONS = [
  "firmDetails",
  "homePage",
  "aboutPage",
  "practiceAreasPage",
  "blogPage",
  "testimonialsPage",
  "contactPage",
  "faqPage",
  "videoCenterPage",
  "clientPortalPage",
  "sitemapPage",
  "thankYouPage",
  "notFoundPage",
  "hiringGuidePage",
  "privacyPolicyPage",
  "consultForm",
  "caseEvaluationForm",
  "attorney",
  "whatDrivesUs",
  "awardsBand",
  "testimonialsBand",
  "statsBand",
];

/* Repeatable types with a curated list below. Kept beside SINGLETONS so the
   catch-all knows what has already been placed. */
const COLLECTIONS = ["blogPost", "practiceArea", "locationPage", "testimonial", "award", "faq", "video"];

/* Everything placed explicitly. Anything NOT here falls through to the
   catch-all. */
const PLACED = [...SINGLETONS, ...COLLECTIONS];

/** A pinned singleton: one sidebar row opening one fixed document. */
const page = (
  S: Parameters<StructureResolver>[0],
  id: string,
  title: string,
  icon: (typeof icons)[keyof typeof icons],
) =>
  S.listItem()
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(id).documentId(id).title(title));

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Website Content")
    .items([
      // ── Pages ───────────────────────────────────────────────────────────────
      // One row per page of the site, in roughly the order the nav lists them.
      S.listItem()
        .title("Pages")
        .icon(icons["master-detail"])
        .child(
          S.list()
            .title("Pages")
            .items([
              page(S, "homePage", "Home Page", icons.home),
              page(S, "aboutPage", "About Page", icons.users),
              page(S, "practiceAreasPage", "Practice Areas Page", icons["th-large"]),
              page(S, "blogPage", "Blog Page", icons.documents),
              page(S, "testimonialsPage", "Testimonials Page", icons["star-filled"]),
              page(S, "contactPage", "Contact Page", icons["mobile-device"]),
              page(S, "faqPage", "FAQ Page", icons["info-outline"]),
              page(S, "videoCenterPage", "Video Center Page", icons["document-video"]),
              page(S, "hiringGuidePage", "Choosing an Attorney Page", icons["bulb-outline"]),
              page(S, "clientPortalPage", "Client Portal Page", icons.folder),
              page(S, "privacyPolicyPage", "Privacy Policy Page", icons.lock),
              page(S, "sitemapPage", "Site Map Page", icons["th-list"]),
              page(S, "thankYouPage", "Thank You Page", icons["checkmark-circle"]),
              page(S, "notFoundPage", "404 Page", icons["error-outline"]),
            ]),
        ),

      // ── Collections ─────────────────────────────────────────────────────────
      // The repeatable records: reviews, practice areas, blog posts. Drag to
      // reorder where the order is what the site renders.
      S.listItem()
        .title("Collections")
        .icon(icons.stack)
        .child(
          S.list()
            .title("Collections")
            .items([
              /* Ordered by date, newest first — the archive orders itself, so a
                 drag handle would set an order nothing reads. */
              S.documentTypeListItem("blogPost")
                .title("Blog Posts")
                .icon(icons["document-text"]),
              /* Not drag-ordered: the sidebar menu sorts alphabetically on the
                 short name, with parent rows first, so a manual order would have
                 nowhere to show up. */
              S.documentTypeListItem("practiceArea")
                .title("Practice Areas")
                .icon(icons.tag),
              /* "Location Pages", not "Service Areas" — Firm Details already has
                 a Service Areas field holding the four nav entries, and two rows
                 with one name would be worse than a slightly longer one. */
              S.documentTypeListItem("locationPage")
                .title("Location Pages")
                .icon(icons.pin),
              /* Drag-ordered: /testimonials/ renders the wall in this order, and
                 as a plain list the sequence would be one no editor could reach. */
              orderableDocumentListDeskItem({
                type: "testimonial",
                title: "Testimonials",
                icon: icons.blockquote,
                S,
                context,
              }),
              /* Drag-ordered for the same reason: the strip's sequence is
                 editorial and nothing about a badge would reproduce it. */
              orderableDocumentListDeskItem({
                type: "award",
                title: "Awards",
                icon: icons.star,
                S,
                context,
              }),
              /* Drag-ordered too: /faq/ publishes these in the client's own
                 sequence, and the homepage renders its six as a filter over it
                 rather than carrying an order of its own. */
              orderableDocumentListDeskItem({
                type: "faq",
                title: "FAQs",
                icon: icons["help-circle"],
                S,
                context,
              }),
              /* Drag-ordered, and the order carries the poster with it — the
                 grid's sequence exists to keep repeated photographs apart at
                 three column counts. VideoGrid.astro holds the working. */
              orderableDocumentListDeskItem({
                type: "video",
                title: "Videos",
                icon: icons.play,
                S,
                context,
              }),
            ]),
        ),

      // ── Site Settings ───────────────────────────────────────────────────────
      // Site-wide configuration, kept away from page content.
      S.listItem()
        .title("Site Settings")
        .icon(icons.controls)
        .child(
          S.list()
            .title("Site Settings")
            .items([
              page(S, "firmDetails", "Firm Details", icons.cog),
              page(S, "attorney", "Attorney", icons.user),
              /* Site-wide sections live here rather than under Pages: they are
                 not a page, they are something every page ends with. */
              page(S, "consultForm", "Consultation Section", icons.envelope),
              page(S, "caseEvaluationForm", "Sidebar Enquiry Card", icons.case),
              page(S, "whatDrivesUs", "What Drives Us Band", icons.heart),
              page(S, "awardsBand", "Awards Band", icons.diamond),
              page(S, "testimonialsBand", "Success Stories Band", icons.blockquote),
              page(S, "statsBand", "By the Numbers Band", icons["bar-chart"]),
              /* Global SEO Settings lands here as a FOLDER when the SEO layer
                 does — sitewide defaults alongside the editor-managed redirect
                 list. Reserved as a folder from the start because adding one
                 later moves the singleton's Studio URL. */
            ]),
        ),

      // Safety net: surface any document type not placed above, so a newly added
      // type is never silently orphaned.
      ...S.documentTypeListItems().filter(
        (li) => !PLACED.includes(li.getId() as string),
      ),
    ]);
