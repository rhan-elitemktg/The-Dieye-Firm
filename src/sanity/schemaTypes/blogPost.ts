import { defineType, defineField, defineArrayMember } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";

/* A blog post. Sixteen of them, at /blog/<slug>/.
 *
 * ═══ Categories are a fixed list, not documents — for now ═══
 *
 * The four slugs are baked into more than the schema: the Blog index filters on
 * them client-side, FilterBoot generates a CSS rule per slug at build time, and
 * cards carry them in a `data-cats` attribute. Turning them into referenced
 * documents would ripple through eight components and the filter's generated
 * stylesheet for very little — the four labels are stable and derive cleanly
 * from the slug.
 *
 * The display labels therefore still live in src/components/blog/blog.ts, which
 * falls back to title-casing an unknown slug, so adding a fifth category here
 * works without a code change even though its label would be derived. Promote
 * this to a `blogCategory` document if the firm ever needs to rename one.
 *
 * ═══ Dates ═══
 *
 * `date` is a date, not a datetime, and everything that formats it must pass
 * `timeZone: "UTC"`. A bare date is parsed as UTC midnight, and formatting that
 * in a US local zone renders the day before. That bug is why blog.ts says so
 * twice.
 */
export const blogPost = defineType({
  name: "blogPost",
  title: "Blog Posts",
  type: "document",
  icon: DocumentTextIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  orderings: [
    {
      title: "Newest first",
      name: "newest",
      by: [
        { field: "date", direction: "desc" },
        { field: "_createdAt", direction: "desc" },
      ],
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Headline",
      type: "string",
      description: "The <h1> at the top of the post, and the default search-result title.",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL",
      type: "slug",
      description:
        "The last part of the address: /blog/<this>/. Changing it on a published post breaks every existing link to it.",
      options: { source: "title", maxLength: 96 },
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Published",
      type: "date",
      description: "Shown on the post and used to order the archive.",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      initialValue: "The Dieye Firm",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      description:
        "Drives the archive filter and the label on the post's card. The first one is the label that shows.",
      group: "content",
      of: [
        defineArrayMember({
          type: "string",
          options: {
            list: [
              { title: "Divorce", value: "divorce" },
              { title: "Child Custody", value: "child-custody" },
              { title: "Child Support", value: "child-support" },
              { title: "Domestic Violence", value: "domestic-violence" },
            ],
          },
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "featured",
      title: "Feature on the archive",
      type: "boolean",
      description:
        "Puts this post in the large panel at the top of /blog/. Only one post can hold it; with none set, the newest post is used. Deliberately a choice rather than just the newest — the newest post is sometimes the one without artwork, and that panel renders its image about 600px tall.",
      initialValue: false,
      group: "content",
    }),
    defineField({
      name: "image",
      title: "Featured image",
      type: "image",
      description:
        "Shown on the post's card, in the archive panel, and when the post is shared. Leave empty and the firm's generic blog artwork is used instead.",
      options: { hotspot: true },
      group: "content",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "What the image shows, for screen readers and for when it fails to load. Leave empty only if it is purely decorative.",
        }),
      ],
    }),
    defineField({
      name: "keyTakeaways",
      title: "Key takeaways",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      description:
        "The short summary box above the article. Each line should stand on its own. Leave empty to omit the box.",
      group: "content",
    }),
    defineField({
      name: "body",
      title: "Post content",
      type: "blockContent",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "legacyPath",
      title: "Original URL",
      type: "string",
      description:
        "Where this post lived on the previous site. The redirect for it is in vercel.json; this is the record of why.",
      group: "seo",
      readOnly: true,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "title", date: "date", media: "image", featured: "featured" },
    prepare({ title, date, media, featured }) {
      return {
        title: title ?? "Untitled",
        subtitle: [featured ? "★ Featured" : null, date].filter(Boolean).join("  ·  "),
        media,
      };
    },
  },
});
