import { defineType, defineField, defineArrayMember } from "sanity";
import { UsersIcon } from "@sanity/icons/Users";
import { capButton, capEyebrow, capFigure, capHeading, capHeadingAccent } from "./limits";

/* /about-us/ — the firm's story and Papa's bio in one page.
 *
 * A SINGLETON, built to the conventions the `homePage` header sets out: every
 * section a collapsed object, Content and SEO as tabs, section names matching
 * the components in src/components/about/ one for one.
 *
 * ═══ Nine bands, six of them here ═══
 *
 * The other three are records, by the rule:
 *
 *     renders on more than one page  ->  a record in Site Settings
 *     renders on exactly one page    ->  that page's own document
 *
 * The awards strip (3 pages), the Success Stories band (2, this page and the
 * homepage), the By the Numbers strip (2, this page and /practice-areas/) and
 * the What Drives Us band (8) are all shared. This page caught Success Stories
 * sitting in `homePage`; /practice-areas/ then caught By the Numbers sitting
 * HERE, one commit after it went in. `npm run check:page-copy` walks the import
 * graph and fails on the next one.
 *
 * Papa's name and title are not here either — those are `attorney`, and they
 * render in four places on this page alone.
 *
 * ═══ Headings here have a TAIL ═══
 *
 * The homepage's accents all close their heading ("Family Law, *Explained*").
 * Two on this page sit mid-sentence — "Treated like a *neighbor*, not a case
 * number." — so those carry a third part. The component decides the spacing:
 * a tail opening with punctuation is butted straight against the italic, and
 * anything else gets a space. That is why the field can be trimmed safely,
 * which a leading space in a Studio text box cannot.
 *
 * ═══ The Google rating is deliberately NOT here ═══
 *
 * "5.0" and "Over 150 five-star Google reviews" stay hardcoded in MeetPapa. They
 * were modelled once, on the `attorney` record, and removed at Rhan's direction
 * on 2026-08-19 — a claim about a number that keeps moving, on one page, that
 * the firm was not going to retune from the Studio. Moving it into this document
 * instead would be the same decision taken again with a different answer.
 */
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  icon: UsersIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => capEyebrow(rule.required()),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => capHeading(rule.required()) }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic. Leave empty for none.",
          validation: (rule) => capHeadingAccent(rule),
        }),
        defineField({
          name: "headingTail",
          title: "Heading — after the italic",
          type: "string",
          description:
            'The rest of the line. Start it with punctuation to butt it against the italic (", not a case number.") or with a word to have a space added.',
          validation: (rule) => capHeading(rule),
        }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 3, validation: (rule) => rule.required() }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "The gold button. It points at /contact-us/.",
          validation: (rule) => capButton(rule.required()),
        }),
      ],
    }),
    defineField({
      name: "whoWeAre",
      title: "Who We Are",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => capEyebrow(rule.required()),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => capHeading(rule.required()) }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string", validation: (rule) => capHeadingAccent(rule) }),
        defineField({ name: "headingTail", title: "Heading — after the italic", type: "string", validation: (rule) => capHeading(rule) }),
        defineField({
          name: "paragraphs",
          title: "Paragraphs",
          type: "paragraphRun",
          validation: (rule) => rule.required().min(1),
        }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "It points at /practice-areas/.",
          validation: (rule) => capButton(rule.required()),
        }),
      ],
    }),
    defineField({
      name: "promise",
      title: "The Promise",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "quoteLead",
          title: "Quote",
          type: "text",
          rows: 3,
          description: "Papa's words, up to the italic part.",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "quoteAccent", title: "Quote — italic part", type: "string" }),
        defineField({
          name: "quoteTail",
          title: "Quote — after the italic",
          type: "string",
          description: "Start with punctuation to butt it against the italic, or with a word to have a space added.",
        }),
      ],
    }),
    defineField({
      name: "meetPapa",
      title: "Meet the Attorney",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "His name and title are not here — they come from Site Settings → Attorney.",
          validation: (rule) => capEyebrow(rule.required()),
        }),
        defineField({
          name: "chips",
          title: "Chips",
          type: "array",
          description: "The three pills under his name.",
          validation: (rule) => rule.required().length(3),
          of: [
            defineArrayMember({
              type: "object",
              name: "chip",
              fields: [
                defineField({
                  name: "icon",
                  title: "Icon",
                  type: "string",
                  /* Drawn inline in MeetPapa rather than imported from
                     src/assets/icons/, which is why this list is here and not in
                     iconOptions.ts. */
                  options: {
                    list: [
                      { title: "Scales", value: "scales" },
                      { title: "Star", value: "star" },
                      { title: "Heart", value: "heart" },
                    ],
                    layout: "radio",
                  },
                  validation: (rule) => rule.required(),
                }),
                defineField({ name: "value", title: "Figure", type: "string", validation: (rule) => capFigure(rule.required()) }),
                defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
              ],
              preview: { select: { title: "value", subtitle: "label" } },
            }),
          ],
        }),
        defineField({
          name: "paragraphs",
          title: "Biography",
          type: "paragraphRun",
          validation: (rule) => rule.required().min(1),
        }),
        defineField({
          name: "milestones",
          title: "Then / Now strip",
          type: "array",
          description: "The four-part strip closing the section.",
          validation: (rule) => rule.required().length(4),
          of: [
            defineArrayMember({
              type: "object",
              name: "milestone",
              fields: [
                defineField({
                  name: "when",
                  title: "When",
                  type: "string",
                  description: 'The small gold word — "Then", "Now", "Always", "With You".',
                  validation: (rule) => rule.required(),
                }),
                defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
                defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.required() }),
              ],
              preview: { select: { title: "title", subtitle: "when" } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "whyFamilyLaw",
      title: "Why Family Law",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => capEyebrow(rule.required()),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => capHeading(rule.required()) }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string", validation: (rule) => capHeadingAccent(rule) }),
        defineField({ name: "headingTail", title: "Heading — after the italic", type: "string", validation: (rule) => capHeading(rule) }),
        defineField({
          name: "paragraphs",
          title: "Paragraphs",
          type: "paragraphRun",
          validation: (rule) => rule.required().min(1),
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
