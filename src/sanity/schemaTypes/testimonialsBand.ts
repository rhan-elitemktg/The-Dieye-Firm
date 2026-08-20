import { defineType, defineField } from "sanity";
import { CommentIcon } from "@sanity/icons/Comment";
import { capButton, capEyebrow, capHeading, capHeadingAccent } from "./limits";

/* The testimonials band — review cards in a carousel, under a heading. A SINGLETON.
 *
 * ═══ Why this is a record and not the homepage's copy ═══
 *
 * It renders on the homepage AND on /about-us/, with no props and no
 * differences, so by the rule the page singletons follow —
 *
 *     renders on more than one page  ->  a record in Site Settings
 *     renders on exactly one page    ->  that page's own document
 *
 * — it belongs here. It spent one commit inside `homePage` because that is
 * where phase 2 put the six picks, and because the homepage is where you first
 * meet the band. An editor opening "Home Page" to change a heading that also
 * shows on /about-us/ has been told something untrue about the site.
 *
 * The FAQ section is the near miss worth knowing about: it also renders on two
 * pages, but /faq/ passes `head={false}` and supplies its own nine questions, so
 * the eyebrow and heading modelled on `homePage` really do appear on one page
 * only. Count the pages the FIELDS reach, not the pages the component does.
 */
export const testimonialsBand = defineType({
  name: "testimonialsBand",
  title: "Testimonials Band",
  type: "document",
  icon: CommentIcon,
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
    defineField({ name: "lead", title: "Lead", type: "text", rows: 2, validation: (rule) => rule.required() }),
    defineField({
      name: "cardKicker",
      title: "Card kicker",
      type: "string",
      description: "The small line at the top of every card.",
      validation: (rule) => capEyebrow(rule.required()),
    }),
    defineField({
      name: "picks",
      title: "Reviews to show",
      type: "array",
      of: [{ type: "reference", to: [{ type: "testimonial" }], options: { disableNew: true } }],
      description:
        "The reviews, in the order they should appear. Six or more — the carousel shows three at a time on desktop, two on tablet, one on mobile, and pages through the rest, so six is two full pages at the widest. There is no upper limit. Prefer ones whose pull quote isn't repeated word-for-word inside the review: on three cards side by side that repetition is the first thing the eye catches.",
      /* Six is a FLOOR, not a count — it was exactly six until 2026-08-20. The
         carousel never needed a number, since it derives its page width from
         the slides; what six buys is two full pages at three-per-view, so the
         last page is never a lone card beside two gaps. `unique` stays, because
         the same review twice in one carousel is always a mistake. */
      validation: (rule) => rule.required().min(6).unique(),
    }),
    defineField({
      name: "ctaLabel",
      title: "Button label",
      type: "string",
      description: "Under the cards. It points at /testimonials/.",
      validation: (rule) => capButton(rule.required()),
    }),
  ],
  preview: { prepare: () => ({ title: "Testimonials Band" }) },
});
