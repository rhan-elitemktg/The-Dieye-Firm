import { defineType, defineArrayMember, defineField } from "sanity";

/* The text toolbar, as a fresh array member each call.
 *
 * A factory rather than a shared const: @sanity/schema memoises compiled array
 * members in a Map keyed by the definition object's *identity*, so one shared
 * literal would hand every array that used it the same compiled instance. That
 * is harmless today but couples types together through an undocumented internal,
 * and a fresh object costs nothing.
 *
 * Every body-copy field on the site uses this — practice areas, location pages,
 * blog posts, FAQ answers, legal pages. One toolbar everywhere, so an editor
 * (and the SEO team after them) learns it once. Do not invent a second
 * rich-text type for one field.
 *
 * NO H1. Every page's <h1> is already rendered by its header — InteriorHeader on
 * the interior template, the hero elsewhere — so a body H1 would make a second
 * one on the page. Headings start at H2. Don't add it back without moving the
 * page heading first.
 *
 * Italic and Quote are in the toolbar even though the 80 ingested pages contain
 * zero of either. `inlineToMd` in scripts/lib/html.mjs can emit `*em*`, so the
 * ingest is capable of producing italics; and the SEO team writes new copy
 * against this toolbar, not against what the scrape happened to find.
 *
 * Deliberately no `of:`. That slot is Sanity's INLINE-object list, and leaving
 * it empty is what guarantees an editor cannot drop a card or a banner into the
 * middle of a sentence. Block-level layout objects, if they are ever wanted, go
 * in a `pageBody` superset that reuses this same factory — see the note in
 * docs/sanity-integration.md.
 */
export const bodyBlockMember = () =>
  defineArrayMember({
    type: "block",
    styles: [
      { title: "Normal", value: "normal" },
      { title: "Heading 2", value: "h2" },
      { title: "Heading 3", value: "h3" },
      { title: "Heading 4", value: "h4" },
      { title: "Quote", value: "blockquote" },
    ],
    lists: [
      { title: "Bulleted", value: "bullet" },
      { title: "Numbered", value: "number" },
    ],
    marks: {
      /* Toggles, carrying no data of their own. */
      decorators: [
        { title: "Bold", value: "strong" },
        { title: "Italic", value: "em" },
      ],
      /* Marks that carry data. */
      annotations: [
        defineArrayMember({
          name: "link",
          type: "object",
          title: "Link",
          fields: [
            defineField({
              name: "href",
              title: "URL",
              type: "url",
              description:
                'A site path such as /family-law/divorce/, or a full https:// address.',
              validation: (rule) =>
                rule.required().uri({
                  allowRelative: true,
                  scheme: ["http", "https", "mailto", "tel"],
                }),
            }),
          ],
        }),
      ],
    },
  });

/* The standard rich-text type.
 *
 * Renderers must wrap it in `.prose`, which lives UNSCOPED in global.css. That
 * is not an oversight — Astro scopes a component's styles by stamping a hash
 * onto the elements in that component's own template, and markup rendered by a
 * child component (which is what Portable Text is) never receives it. A scoped
 * rule would match none of this. global.css says so at the top of the .prose
 * block, and it was written for exactly this migration.
 *
 * The corollary is the rule for what belongs here at all, also from that
 * comment: only genuinely freeform copy. Anything with custom rendering — the
 * About checklist with its gold ticks, a pull-quote with a headshot, Key
 * Takeaways — stays a structured field with its own component rather than being
 * flattened into a rich-text blob.
 */
export const blockContent = defineType({
  name: "blockContent",
  title: "Content",
  type: "array",
  of: [bodyBlockMember()],
});
