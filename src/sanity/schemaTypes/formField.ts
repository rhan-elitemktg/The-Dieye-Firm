import { defineType, defineField } from "sanity";

/* One input's editorial text: the label above it and the hint inside it.
 *
 * Shared by the consultation form and the blog sidebar's case-evaluation card,
 * so the two can't drift into different shapes.
 *
 * Only the words are here. Which inputs exist, their order, their `name`, their
 * validation and their autocomplete hints all stay in the component — those are
 * the contract with src/scripts/lead-form.ts, which binds on `[data-lead-form]`,
 * `[data-phone-input]` and `[data-lead-status]`. An editor rewording a label
 * cannot break the form; an editor adding a field would need a developer, which
 * is the right side of that line for something that has to submit somewhere.
 */
export const formField = defineType({
  name: "formField",
  title: "Field",
  type: "object",
  options: { columns: 2 },
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "placeholder",
      title: "Placeholder",
      description: "The grey hint inside the box. Leave empty for none.",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "placeholder" },
  },
});
