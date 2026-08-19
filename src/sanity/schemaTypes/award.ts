import { defineType, defineField } from "sanity";
import { StarIcon } from "@sanity/icons/Star";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/* One accreditation badge in the trust strip under the hero.
 *
 * Seven today, on 3 pages (/, /about-us/, /thank-you/). This is the type most
 * likely to gain a document without a developer: the firm earns a rating, the
 * badge arrives as a PNG from Martindale or Avvo, and it should go up the same
 * afternoon. That is the whole reason the strip is modelled rather than left as
 * seven imports.
 *
 * ═══ The strip sizes itself, up to a point ═══
 *
 * On desktop the carousel only engages once the badges overflow the container,
 * so seven sit as a static centred row and an eighth quietly turns it into a
 * carousel. That is by design in home/Awards.astro and needs no field.
 *
 * ═══ `width` is a file cap, not a layout instruction ═══
 *
 * The badges render at their natural size up to 190px tall; `width` caps the
 * file Sanity generates at roughly 2x the largest rendered size. It exists
 * because the Texas Bar lockup ships at 1024px wide for a badge that never
 * renders above 190, and serving that is a quarter of a megabyte for nothing.
 * An editor should rarely touch it; the description says so.
 */
export const award = defineType({
  name: "award",
  title: "Awards",
  type: "document",
  icon: StarIcon,
  orderings: [orderRankOrdering],
  fields: [
    /* Drag order in Collections → Awards is the order they appear in the strip.
       The current sequence is editorial - Martindale first, the Texas Bar
       lockup last - and nothing about the badges themselves would reproduce
       it. */
    orderRankField({ type: "award" }),
    defineField({
      name: "image",
      title: "Badge",
      type: "image",
      description:
        "The badge as supplied by the awarding body. A PNG with a transparent background sits best on both the white and bone versions of the strip.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description:
        "What the badge says, for a reader who cannot see it — the award, the rating and the year if the badge carries one. This is a factual claim about the firm, so keep it to what the badge actually shows.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "width",
      title: "Maximum width (px)",
      type: "number",
      initialValue: 256,
      description:
        "A cap on the file size Sanity generates, not the size it renders at. Leave it alone unless a new badge looks soft — then set it to about twice the width it renders at.",
      validation: (rule) => rule.required().min(60).max(800),
    }),
  ],
  preview: {
    select: { title: "alt", media: "image" },
    prepare: ({ title, media }) => ({ title: title ?? "Award", media }),
  },
});
