import { defineType, defineField } from "sanity";
import { DocumentsIcon } from "@sanity/icons/Documents";

/* /blog/ — the index.
 *
 * A SINGLETON, built to the conventions in the `homePage` header. The thinnest
 * page document on the site, and that is the point: almost everything on /blog/
 * is DATA or CHROME, so almost nothing belongs here.
 *
 *   the posts, their order, the featured pin  ->  the `blogPost` collection
 *   the category chips                        ->  derived from the posts' slugs
 *   "All Posts", "Load More Posts", "Featured Post", "Select Category"
 *                                             ->  chrome, and it stays in code
 *
 * What is left is the page's own opening: a kicker, a title and a standfirst.
 *
 * ═══ The eyebrow used to be a default in a shared component ═══
 *
 * `BlogHeader` is borrowed by /faq/ and /video-center/, which pass their own
 * kicker; /blog/ passed none and took the component's default. That made one
 * page's copy live in a component three pages render — invisible to
 * `npm run check:page-copy`, because a default is not a read of a page
 * singleton. The prop is required now and all three pass it, so the header
 * holds no copy at all and the check can see what it needs to.
 */
export const blogPage = defineType({
  name: "blogPage",
  title: "Blog Page",
  type: "document",
  icon: DocumentsIcon,
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
          description: 'Also the first half of the browser tab, before "| The Dieye Firm".',
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
  preview: { prepare: () => ({ title: "Blog Page" }) },
});
