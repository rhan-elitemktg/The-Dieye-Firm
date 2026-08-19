import { defineType, defineField, defineArrayMember } from "sanity";
import { FolderIcon } from "@sanity/icons/Folder";

/* /client-portal/ — the three things existing clients come here to do.
 *
 * A SINGLETON. Every string on this page is authored by us: there is no comp
 * behind it and the live site has no equivalent, which is why it is on the
 * "authored, no comp" list in HANDOFF.md. Modelling it is what makes those
 * strings the firm's to change.
 *
 * The MyCase links are fields for a reason beyond editing: they point at two
 * DIFFERENT subdomains, `dieylaw` and `dieyelaw`, one of which looks like a
 * typo and controls an OAuth callback. That question is still open with the
 * firm — see HANDOFF.md — and having both in one document is what makes them
 * comparable at a glance.
 */
export const clientPortalPage = defineType({
  name: "clientPortalPage",
  title: "Client Portal Page",
  type: "document",
  icon: FolderIcon,
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
        defineField({ name: "kicker", title: "Kicker", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "deck", title: "Standfirst", type: "text", rows: 2, validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "groups",
      title: "Groups",
      type: "array",
      group: "content",
      description: "One block per audience — new clients, existing clients.",
      validation: (rule) => rule.required().min(1),
      of: [
        defineArrayMember({
          type: "object",
          name: "group",
          fields: [
            defineField({ name: "heading", title: "Heading", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "blurb", title: "Text", type: "text", rows: 4, validation: (rule) => rule.required() }),
            defineField({
              name: "actions",
              title: "Buttons",
              type: "array",
              validation: (rule) => rule.required().min(1),
              of: [
                defineArrayMember({
                  type: "object",
                  name: "action",
                  fields: [
                    defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
                    defineField({ name: "note", title: "Note", type: "string", description: "The small line under the button.", validation: (rule) => rule.required() }),
                    defineField({ name: "href", title: "Link", type: "string", validation: (rule) => rule.required() }),
                    defineField({
                      name: "style",
                      title: "Style",
                      type: "string",
                      options: {
                        list: [
                          { title: "Gold (primary)", value: "btn--gold" },
                          { title: "Outline (secondary)", value: "btn--outline" },
                        ],
                        layout: "radio",
                      },
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: "external",
                      title: "Opens in a new tab",
                      type: "boolean",
                      initialValue: false,
                      description: "On for anything off this site — it adds the new-tab target and the rel pair together, so one cannot be set without the other.",
                    }),
                    defineField({
                      name: "download",
                      title: "Downloads a file",
                      type: "boolean",
                      initialValue: false,
                      description: "Only for a file served from this site, such as the intake PDF.",
                    }),
                  ],
                  preview: { select: { title: "label", subtitle: "note" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "heading", subtitle: "blurb" } },
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Client Portal Page" }) },
});
