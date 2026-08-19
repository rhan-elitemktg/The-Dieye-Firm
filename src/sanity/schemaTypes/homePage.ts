import { defineType, defineField, defineArrayMember } from "sanity";
import { HomeIcon } from "@sanity/icons/Home";
import { iconList } from "./iconOptions";

/* The homepage.
 *
 * A singleton — the fixed document id is pinned in src/sanity/structure.ts,
 * since Sanity has no `singleton: true` schema option.
 *
 * ═══ Two conventions this document establishes for every page type ═══
 *
 * 1. EVERY SECTION IS A COLLAPSED OBJECT. Each visible band on the page is an
 *    `object` field with `options: { collapsible: true, collapsed: true }` and
 *    NO `description` on the object itself — the title says what it is, and
 *    anything that needs explaining is explained on the field inside, where an
 *    editor is actually looking. The page then opens as a tidy list of closed
 *    accordions in roughly the order the sections appear on the page, instead of
 *    a wall of eighty fields.
 *
 *    This applies to list-only sections too. `collapsible` is an ObjectOptions
 *    flag and arrays have no equivalent, so a section that is really just a list
 *    still gets the object wrapper.
 *
 * 2. CONTENT AND SEO ARE TABS. `groups` puts search metadata behind its own tab
 *    so it never sits between two pieces of copy. Two things to know: an
 *    UNGROUPED field is invisible in every named tab (only "All fields" shows
 *    it), so every top-level field must carry a `group`; and Sanity prepends its
 *    own "All fields" tab, so the count is always one higher than declared.
 *
 * ═══ What is here, and what deliberately is not ═══
 *
 * The homepage composes twelve bands. Eleven of them are below. The twelfth is
 * the awards strip, and it is NOT here on purpose: it renders on three pages, so
 * it is a shared record (`awardsBand` + the `award` collection) rather than this
 * page's copy. That is the line for every page singleton —
 *
 *     renders on more than one page  ->  a record in Site Settings
 *     renders on exactly one page    ->  that page's own document
 *
 * — and it is why the consultation prompt, the sidebar enquiry card and the
 * What Drives Us band are all absent too. Two documents describing one line is
 * the failure this avoids: they disagree eventually, and the page picks one.
 *
 * The Success Stories band is absent for the same reason and was moved out
 * after one commit here: it renders on /about-us/ too, so it is
 * `testimonialsBand`. Count the pages the FIELDS reach, not the pages the
 * component does — the FAQ section below renders on two pages as well, but
 * /faq/ passes `head={false}`, so this eyebrow and heading really do appear
 * once.
 *
 * Facts about the FIRM rather than the page are also absent. The attorney's name
 * and title come from the `attorney` record even though they render here, and
 * the phone number comes from `firmDetails` — modelling either again would
 * recreate the drift that put two different job titles on one site.
 *
 * Section names below match the components in src/components/home/ one for one,
 * so "which box edits this band" has an answer you can grep.
 */
export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  icon: HomeIcon,
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
          description: "The small gold line above the heading.",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({
          name: "headingLines",
          title: "Heading",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          description:
            "One entry per line — they are joined with a line break. The italic part below is added to the END of the last line, so \"changes,\" plus \"we\u2019re with you.\" reads as one sentence across two lines.",
          validation: (rule) => rule.required().min(1),
        }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic at the end of the last line. Leave empty for none.",
        }),
        defineField({
          name: "lead",
          title: "Lead",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "The gold button. It always points at /contact-us/; the second button is the phone number from Firm Details.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "stats",
          title: "Stats",
          type: "array",
          description: "Three, and three only — they sit in a row under the buttons and a fourth wraps.",
          validation: (rule) => rule.required().length(3),
          of: [
            defineArrayMember({
              type: "object",
              name: "stat",
              fields: [
                defineField({ name: "value", title: "Figure", type: "string", validation: (rule) => rule.required() }),
                defineField({ name: "label", title: "Label", type: "string", validation: (rule) => rule.required() }),
              ],
              preview: { select: { title: "value", subtitle: "label" } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "about",
      title: "About section",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic. Leave empty for none.",
        }),
        defineField({
          name: "videoLabel",
          title: "Video card — label",
          type: "string",
          description: "On the video tile in the left column.",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "videoCaption", title: "Video card — caption", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "lead",
          title: "Opening paragraph",
          type: "text",
          rows: 5,
          description: "Set larger than the rest of the section.",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "intro", title: "Second paragraph", type: "text", rows: 5, validation: (rule) => rule.required() }),
        defineField({ name: "helpHeading", title: "\"How we help\" — heading", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "helpIntro", title: "\"How we help\" — paragraph", type: "text", rows: 3, validation: (rule) => rule.required() }),
        defineField({
          name: "checklist",
          title: "Checklist",
          type: "array",
          description: "The ticked list under that paragraph. Each row opens with its bold lead-in and runs on into the sentence.",
          validation: (rule) => rule.required().min(1),
          of: [
            defineArrayMember({
              type: "object",
              name: "item",
              fields: [
                defineField({
                  name: "lead",
                  title: "Bold lead-in",
                  type: "string",
                  description: "Shown bold, then the text below continues on the same line.",
                  validation: (rule) => rule.required(),
                }),
                defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.required() }),
              ],
              preview: { select: { title: "lead", subtitle: "text" } },
            }),
          ],
        }),
        defineField({
          name: "pullQuote",
          title: "Pull quote",
          type: "reference",
          to: [{ type: "testimonial" }],
          description:
            "The review quoted beside the video. Pick a SHORT one — past about 50 words it pushes the video tile below the fold. Choose one that isn't also in Success Stories below, or the same words appear twice on this page.",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "whyHeading", title: "\"Why you need a lawyer\" — heading", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "whyParagraphs",
          title: "\"Why you need a lawyer\" — paragraphs",
          type: "array",
          of: [defineArrayMember({ type: "text", rows: 5 })],
          validation: (rule) => rule.required().min(1),
        }),
        defineField({ name: "servingHeading", title: "\"Serving families\" — heading", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "servingParagraph", title: "\"Serving families\" — paragraph", type: "text", rows: 5, validation: (rule) => rule.required() }),
        defineField({ name: "ctaLabel", title: "Button label", type: "string", validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "practiceAreas",
      title: "Practice Areas",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic. Leave empty for none.",
        }),
        defineField({ name: "intro", title: "Lead", type: "text", rows: 3, validation: (rule) => rule.required() }),
        defineField({
          name: "areas",
          title: "Cards",
          type: "array",
          description: "Six cards, in a three-by-two grid. Their text is written for this page — it is not the practice area's own summary.",
          validation: (rule) => rule.required().length(6),
          of: [
            defineArrayMember({
              type: "object",
              name: "area",
              fields: [
                defineField({
                  name: "icon",
                  title: "Icon",
                  type: "string",
                  options: { list: iconList("divorce", "child-custody", "family-law", "child-support", "property-division", "modifications") },
                  validation: (rule) => rule.required(),
                }),
                defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
                defineField({
                  name: "href",
                  title: "Link",
                  type: "string",
                  description: "A path on this site, with both slashes — e.g. /family-law/divorce/.",
                  validation: (rule) => rule.required().regex(/^\/.*\/$/, { name: "site path" }).error("Start and end with a slash."),
                }),
                defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.required() }),
              ],
              preview: { select: { title: "title", subtitle: "text" } },
            }),
          ],
        }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "Under the cards. It points at /practice-areas/.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "featuredAttorney",
      title: "Meet the Attorney",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "His name and title are not here — they come from Site Settings → Attorney, so one change moves every page that names him.",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({
          name: "quote",
          title: "Pull quote",
          type: "text",
          rows: 3,
          description: "Papa's own words, in quotation marks. Include the marks — they are part of the line.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "paragraphs",
          title: "Paragraphs",
          type: "array",
          of: [defineArrayMember({ type: "text", rows: 5 })],
          validation: (rule) => rule.required().min(1),
        }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "Under the card. It points at /about-us/.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "badgeYears",
          title: "Badge — number",
          type: "number",
          description: "The figure on the gold badge over the photo. The \"+\" is added by the page.",
          validation: (rule) => rule.required().min(1).integer(),
        }),
        defineField({
          name: "badgeLabelLines",
          title: "Badge — label",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          description: "One entry per line, joined with a line break. Two short lines fit the badge; one long one overflows it.",
          validation: (rule) => rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "sellingPoints",
      title: "Why Hire Us",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic. Leave empty for none.",
        }),
        defineField({
          name: "points",
          title: "Cards",
          type: "array",
          description: "Four cards in a row.",
          validation: (rule) => rule.required().length(4),
          of: [
            defineArrayMember({
              type: "object",
              name: "point",
              fields: [
                defineField({
                  name: "icon",
                  title: "Icon",
                  type: "string",
                  options: { list: iconList("compassionate-approach", "client-focused", "experienced", "flexible-payments") },
                  validation: (rule) => rule.required(),
                }),
                defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
                defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.required() }),
              ],
              preview: { select: { title: "title", subtitle: "text" } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "The questions themselves are not here — they are Collections → FAQs, because /faq/ publishes the same nine at full length.",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic. Leave empty for none.",
        }),
      ],
    }),
    defineField({
      name: "videoReels",
      title: "Video Reels",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "The videos are not here — they are Collections → Videos, ordered by their homepage position.",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic. Leave empty for none.",
        }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "Under the carousel. It points at /video-center/.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "community",
      title: "Community",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic. Leave empty for none.",
        }),
        defineField({
          name: "paragraphs",
          title: "Paragraphs",
          type: "array",
          of: [defineArrayMember({ type: "text", rows: 4 })],
          validation: (rule) => rule.required().min(1),
        }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "Under the copy. It points at /about-us/.",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "tileTitle", title: "Photo tile — title", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "tileText", title: "Photo tile — text", type: "text", rows: 2, validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "guideRequest",
      title: "Guide Offer",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic. Leave empty for none.",
        }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 3, validation: (rule) => rule.required() }),
        defineField({
          name: "offer",
          title: "What is on offer",
          type: "string",
          description: "The bold line above the email box.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "blog",
      title: "Blog",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "The posts are not here — the three most recent are chosen by date.",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: "Rendered in gold italic. Leave empty for none.",
        }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "Under the cards. It points at /blog/.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home Page" }),
  },
});
