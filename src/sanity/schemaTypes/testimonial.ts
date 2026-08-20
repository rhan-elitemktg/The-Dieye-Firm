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
      name: "kind",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Written review", value: "text" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "text",
      description:
        "A written review shows as a card. A video shows as a play tile, on the wall and in the homepage band alike.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lead",
      title: "Pull quote",
      type: "text",
      rows: 3,
      description:
        "The sentence shown large at the top of the card. Take it from the review itself — don't write a new one.",
      hidden: ({ parent }) => parent?.kind === "video",
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.document as any)?.kind === "video" || value
            ? true
            : "A written review needs a pull quote."),
    }),
    defineField({
      name: "body",
      title: "Full review",
      type: "text",
      rows: 8,
      description:
        "The client's review in full, exactly as they wrote it. Typos included — these are their words.",
      hidden: ({ parent }) => parent?.kind === "video",
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.document as any)?.kind === "video" || value
            ? true
            : "A written review needs the full text."),
    }),
    defineField({
      name: "name",
      title: "Client name",
      type: "string",
      description:
        'As the review is signed on the live site — a first name, initials, or "Former Client" where it was published unattributed.',
      /* Optional for a VIDEO, and that is a rule rather than a convenience.
         The tile on /testimonials/ carries a stock portrait of nobody connected
         to the firm; putting a client name under it would claim the face is a
         client, which is the exact thing this type exists to prevent. Give a
         video a name only once a real client is behind it. */
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.document as any)?.kind === "video" || value
            ? true
            : "A written review needs the client's name."),
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
      hidden: ({ parent }) => parent?.kind === "video",
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.document as any)?.kind === "video" || value
            ? true
            : "A written review needs a matter."),
    }),
    defineField({
      name: "wistiaId",
      title: "Wistia ID",
      type: "string",
      description: "The ten-character id from the video's Wistia URL.",
      hidden: ({ parent }) => parent?.kind !== "video",
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.document as any)?.kind !== "video") return true;
          if (!value) return "A video testimonial needs a Wistia ID.";
          return /^[a-z0-9]{10}$/.test(value) || "A Wistia ID is ten lowercase letters or digits.";
        }),
    }),
    defineField({
      name: "poster",
      title: "Poster",
      type: "image",
      options: { hotspot: true },
      description:
        "The still behind the play button, shown square. A photograph, not Wistia's auto-generated frame.",
      hidden: ({ parent }) => parent?.kind !== "video",
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.document as any)?.kind !== "video" || value
            ? true
            : "A video testimonial needs a poster."),
    }),
    defineField({
      name: "label",
      title: "Tile label",
      type: "string",
      description: 'The small gold line above the caption - "Video Testimonial".',
      hidden: ({ parent }) => parent?.kind !== "video",
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.document as any)?.kind !== "video" || value
            ? true
            : "A video testimonial needs a tile label."),
    }),
    defineField({
      name: "caption",
      title: "Tile caption",
      type: "string",
      description:
        'The line under the label, set large - "Watch their story". This is also the title the video modal announces.',
      hidden: ({ parent }) => parent?.kind !== "video",
      validation: (rule) =>
        rule.custom((value, context) =>
          (context.document as any)?.kind !== "video" || value
            ? true
            : "A video testimonial needs a tile caption."),
    }),
  ],
  preview: {
    select: {
      kind: "kind", lead: "lead", name: "name", matter: "matter",
      caption: "caption", media: "poster",
    },
    prepare({ kind, lead, name, matter, caption, media }) {
      /* A video row shows its poster and says so. Without the media a video and
         a written review look identical in a 15-row list, which is the whole
         reason this collection needed a type in the first place. */
      if (kind === "video") {
        return {
          title: caption ?? "Video testimonial",
          subtitle: ["Video", name].filter(Boolean).join(" · "),
          media,
        };
      }
      return {
        title: lead?.length > 60 ? `${lead.slice(0, 60)}…` : (lead ?? "Untitled"),
        subtitle: [name, matter].filter(Boolean).join(" · "),
      };
    },
  },
});
