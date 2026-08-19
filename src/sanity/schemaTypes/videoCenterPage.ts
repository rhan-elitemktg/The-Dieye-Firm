import { defineType, defineField } from "sanity";
import { DocumentVideoIcon } from "@sanity/icons/DocumentVideo";

/* Video Center Page — the page's own opening.
 *
 * A SINGLETON of the same shape as `blogPage`: a kicker, a title and a
 * standfirst, rendered by the shared `BlogHeader`. Everything below that
 * opening is data or a shared record, so nothing else belongs here.
 *
 * See the type's header comment in blogPage.ts for why the kicker is a field
 * rather than a default prop on that component.
 */
export const videoCenterPage = defineType({
  name: "videoCenterPage",
  title: "Video Center Page",
  type: "document",
  icon: DocumentVideoIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "header",
      title: "Page header",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "The small gold line above the title.",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "intro",
          title: "Standfirst",
          type: "text",
          rows: 3,
          description: "The centred line under the title.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Video Center Page" }) },
});
