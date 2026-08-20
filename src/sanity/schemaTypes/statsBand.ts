import { defineType, defineField, defineArrayMember } from "sanity";
import { BarChartIcon } from "@sanity/icons/BarChart";
import { capFigure } from "./limits";

/* The "By the Numbers" strip — four figures on a bone band. A SINGLETON.
 *
 * It renders on /about-us/ and on /practice-areas/, with no props, so by the
 * rule the page singletons live by it is a record:
 *
 *     renders on more than one page  ->  a record in Site Settings
 *     renders on exactly one page    ->  that page's own document
 *
 * It spent one commit inside `aboutPage`, which is the SECOND time that mistake
 * was made in two days — the Success Stories band did the same thing inside
 * `homePage`. Both times the page being migrated looked self-contained, because
 * the component that gave it away was imported by a page nobody was reading at
 * the time. `npm run check:page-copy` now walks the import graph and fails on
 * it, which is the only version of this rule that has ever held.
 */
export const statsBand = defineType({
  name: "statsBand",
  title: "By the Numbers Band",
  type: "document",
  icon: BarChartIcon,
  fields: [
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      description:
        "Four, in a row. A fifth wraps onto a second line on its own. These are claims about the firm — keep them true.",
      validation: (rule) => rule.required().length(4),
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "value", title: "Figure", type: "string", validation: (rule) => capFigure(rule.required()) }),
            defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "By the Numbers Band" }) },
});
