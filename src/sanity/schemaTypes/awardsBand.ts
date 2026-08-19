import { defineType, defineField } from "sanity";
import { DiamondIcon } from "@sanity/icons/Diamond";

/* The heading above the awards strip. A SINGLETON, on 3 pages.
 *
 * One field, deliberately. The badges are their own collection because they are
 * added and reordered; the line above them is a section heading, which is a
 * reader-facing part of the firm's voice and belongs with the content rather
 * than in a component. Keeping it here rather than on each of the three pages
 * is what stops those three drifting into three slightly different headings.
 *
 * It is a separate document from `award` rather than a field on one of them,
 * because a heading that lived on "whichever badge sorts first" would vanish
 * the day an editor deleted that badge.
 */
export const awardsBand = defineType({
  name: "awardsBand",
  title: "Awards Band",
  type: "document",
  icon: DiamondIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      description: "The line above the badges, on the homepage, /about-us/ and /thank-you/.",
      validation: (rule) =>
        rule.required().max(60).warning("Headings read best under about 60 characters."),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Awards Band" }),
  },
});
