import { defineType, defineField } from "sanity";
import { StarFilledIcon } from "@sanity/icons/StarFilled";

/* /testimonials/ — the review wall.
 *
 * A SINGLETON, built to the conventions in the `homePage` header. Two bands are
 * here; the reviews themselves are the `testimonial` collection, and What
 * Drives Us is a shared record.
 *
 * ═══ Not the Success Stories band ═══
 *
 * `testimonialsBand` is the six-card band on the homepage and /about-us/. This
 * is the full wall on /testimonials/. Two documents, two surfaces, and their
 * copy is deliberately NOT identical — the band's lead has a comma where the
 * wall's has a spaced hyphen, and both are left as they were found. Do not
 * "fix" one to match the other; they are separate pages' words.
 *
 * ═══ The video tile is NOT modelled, on purpose ═══
 *
 * The wall opens with a video tile carrying a stock poster and a generic label,
 * standing in for a client video that does not exist yet. Its strings stay in
 * ReviewWall.astro with the comment explaining what they are. Modelling them
 * would put a "name" box in the Studio under a photograph of someone who is not
 * a client, which is an invitation to fill it in. It becomes a real field when
 * there is a real video and a real client behind it — see HANDOFF.md.
 */
export const testimonialsPage = defineType({
  name: "testimonialsPage",
  title: "Testimonials Page",
  type: "document",
  icon: StarFilledIcon,
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
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string" }),
        defineField({
          name: "headingTail",
          title: "Heading — after the italic",
          type: "string",
          description:
            "The rest of the line, if the italic sits mid-sentence. Start it with punctuation to butt it against the italic, or with a word to have a space added.",
        }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 3, validation: (rule) => rule.required() }),
        defineField({
          name: "ctaLabel",
          title: "Button label",
          type: "string",
          description: "The gold button. It points at /contact-us/.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "wall",
      title: "Review Wall",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "The reviews themselves are Collections → Testimonials, in their drag order.",
          validation: (rule) => rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string" }),
        defineField({ name: "headingTail", title: "Heading — after the italic", type: "string" }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 2, validation: (rule) => rule.required() }),
        defineField({
          name: "cardKicker",
          title: "Card kicker",
          type: "string",
          description: "The small line at the top of every review card.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Testimonials Page" }) },
});
