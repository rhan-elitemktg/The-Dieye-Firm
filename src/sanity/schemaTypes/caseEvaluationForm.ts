import { defineType, defineField } from "sanity";
import { CaseIcon } from "@sanity/icons/Case";
import { capButton, capReassurance } from "./limits";

/* The sidebar enquiry card — "Get a Case Evaluation".
 *
 * ═══ This renders on 85 pages ═══
 *
 * Every practice area, every location page, every blog post, and the hiring
 * guide — four different sidebar components render it, which is why it is a
 * shared record rather than content on any one page.
 *
 * It is a SECOND, shorter form, distinct from the consultation section at the
 * foot of the same pages: five fields instead of six, its own heading, and its
 * own reassurance line ("Confidential & Privileged" against the other's
 * "Everything you share is private and confidential"). Both submit through the
 * same handler; neither is a variant of the other.
 *
 * ═══ Why this is modelled at all ═══
 *
 * The intro is the only place on the site that promises "Papa will personally
 * review your request" — a specific commitment, repeated on 85 pages, of
 * exactly the kind a firm may want to soften or strengthen without a deploy.
 *
 * Field labels and placeholders stay in the component, as they do on the
 * consultation section: they are input affordances, not the firm's voice.
 */
export const caseEvaluationForm = defineType({
  name: "caseEvaluationForm",
  title: "Sidebar Enquiry Card",
  type: "document",
  icon: CaseIcon,
  fields: [
    defineField({
      name: "heading",
      title: "Heading",
      type: "string",
      validation: (rule) =>
        rule.required().max(40).warning("The card is narrow — long headings wrap to three lines."),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "text",
      rows: 3,
      description:
        "The line under the heading. This is where the firm promises how the enquiry is handled, so it is a commitment as much as it is copy.",
      validation: (rule) =>
        rule
          .required()
          .max(160)
          .warning("Past about 160 characters the card grows taller than the article beside it."),
    }),
    defineField({
      name: "submitLabel",
      title: "Button",
      type: "string",
      validation: (rule) => capButton(rule.required()),
    }),
    defineField({
      name: "privacyNote",
      title: "Reassurance line",
      type: "string",
      description: "The small gold line under the button.",
      validation: (rule) => capReassurance(rule.required()),
    }),
  ],
  preview: {
    prepare: () => ({ title: "Sidebar Enquiry Card" }),
  },
});
