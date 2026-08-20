import { defineType, defineField } from "sanity";

/* A label/href pair. Shared by the footer columns and the legal bar so the two
   can't drift into different shapes. Kept deliberately dumb — no icon, no
   styling hints — because it is used in more than one visual context. */
export const navLink = defineType({
  name: "navLink",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (rule) =>
        rule.required().max(40).warning("Long labels wrap in the footer columns."),
    }),
    defineField({
      name: "href",
      title: "URL or path",
      description:
        "A site path such as /family-law/divorce/ or a full https:// address.",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "label", subtitle: "href" },
  },
});
