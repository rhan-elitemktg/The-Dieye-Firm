import { defineType, defineField } from "sanity";
import { BlockquoteIcon } from "@sanity/icons/Blockquote";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/* A published client review.
 *
 * ═══ NOTHING HERE MAY BE INVENTED ═══
 *
 * Every one of these is a real, published review by a real client, harvested
 * verbatim from dieyelaw.com. A law firm attributing a fabricated quote to a
 * named person is a Texas Bar advertising problem before it is a content
 * problem. If a slot needs filling and no real review fits, the slot goes away,
 * not the rule.
 *
 * This is not hypothetical. Until August 2026 the homepage carried SIX invented
 * reviews attributed to six invented people, and the About section a seventh,
 * while the firm's fourteen real ones sat unused in a component nothing else
 * read. That is what this document type exists to prevent recurring, and it is
 * why `name` is required and why there is no "add a placeholder" affordance.
 *
 * ═══ Provenance ═══
 *
 * Fourteen reviews, and that is the COMPLETE corpus — a sweep of all 121 URLs in
 * the live sitemap turns up no fifteenth. /testimonials/ itself shows only nine
 * (its "1 / 2" pager splits those nine across two views; it is not hiding a
 * second batch); the other five are spread through the practice-area and About
 * pages.
 *
 * The clients' typos are theirs and are deliberately kept — the repo rule is to
 * leave the client's published prose alone. Three documented departures from
 * verbatim, carried over from the module this type replaced:
 *
 *   1. Where the live pull-quote is a whole sentence repeated verbatim in the
 *      body, that sentence is dropped from the body — the card would otherwise
 *      print it twice, at 30px and again at 17px. Only done where the sentence
 *      stands alone, and nothing is reworded.
 *   2. Larry's and the "Honest, Sincere" review are truncated mid-word in the
 *      firm's own CMS ("…what he can do. H", "…Mr. Papa was always h"). Each is
 *      cut back to its last complete sentence rather than shipping the fragment.
 *      The missing tail is not recoverable from the live site.
 *   3. Cyndy's is punctuated and de-garbled, at Rhan's instruction — the only
 *      one edited for readability rather than for a defect in the source.
 *
 * Add to that list rather than editing a quote silently.
 */
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  icon: BlockquoteIcon,
  orderings: [orderRankOrdering],
  fields: [
    /* Drag order in Collections → Testimonials drives the order on
       /testimonials/. The wall is laid out column-major to reproduce the design
       comp's three columns, so the sequence is editorial, not alphabetical. */
    orderRankField({ type: "testimonial" }),
    defineField({
      name: "lead",
      title: "Pull quote",
      type: "text",
      rows: 3,
      description:
        "The sentence shown large at the top of the card. Take it from the review itself — don't write a new one.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Full review",
      type: "text",
      rows: 8,
      description:
        "The client's review in full, exactly as they wrote it. Typos included — these are their words.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Client name",
      type: "string",
      description:
        'As the review is signed on the live site — a first name, initials, or "Former Client" where it was published unattributed.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "matter",
      title: "Matter",
      type: "string",
      description:
        "The practice area this review names in its own text. Ours, not the client's — never assign one the quote doesn't actually mention.",
      /* Becomes a reference to the practice-area document once that type exists;
         it is a string only because testimonials were migrated first, as the
         pilot. Kept as free text rather than a hardcoded list so the eventual
         swap is a data patch, not a schema argument. */
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { lead: "lead", name: "name", matter: "matter" },
    prepare({ lead, name, matter }) {
      return {
        title: lead?.length > 60 ? `${lead.slice(0, 60)}…` : (lead ?? "Untitled"),
        subtitle: [name, matter].filter(Boolean).join(" · "),
      };
    },
  },
});
