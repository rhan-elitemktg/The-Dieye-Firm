import { defineType, defineField, defineArrayMember } from "sanity";
import { EnvelopeIcon } from "@sanity/icons/Envelope";

/* The consultation section — "Take the First Step".
 *
 * ═══ This renders on 93 of the site's 95 pages ═══
 *
 * Layout puts it at the foot of everything except /thank-you/ (where inviting a
 * second enquiry from someone who just sent one reads as though the first
 * didn't register) and the 404. So it is a singleton, not a per-page section:
 * copies on 93 page documents would be 93 chances to drift, and the dynamic
 * routes have no page document to copy it onto in the first place.
 *
 * /contact-us/ renders the same record in a different arrangement — no header,
 * a photo instead of the map, flattened to white — which is a `variant` prop on
 * the component, not different content. One record, one form, one place the
 * words live.
 *
 * ═══ The heading is three strings, not rich text ═══
 *
 * It renders as `Take the <em>First Step</em>`, and that <em> is styled by a
 * SCOPED rule in Contact.astro. Rich text would move the <em> into a renderer,
 * where Astro's scope hash never reaches it — the gold italic would silently
 * become plain black roman on all 93 pages, with the markup still looking
 * correct. Splitting the line into lead/accent/tail keeps the <em> in the
 * component's own template, which is byte-identical by construction and a
 * clearer Studio field than a rich-text box with one button in it.
 */
export const consultForm = defineType({
  name: "consultForm",
  title: "Consultation Section",
  type: "document",
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: "header",
      title: "Heading",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "The small gold line above the heading.",
          validation: (rule) =>
            rule.required().max(40).warning("Eyebrows read best under about 40 characters."),
        }),
        defineField({
          name: "headingLead",
          title: "Heading",
          type: "string",
          description: 'The plain first part — e.g. "Take the".',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "headingAccent",
          title: "Heading — italic part",
          type: "string",
          description: 'Rendered in gold italic — e.g. "First Step". Leave empty for none.',
        }),
        defineField({
          name: "leadLines",
          title: "Lead",
          type: "array",
          of: [defineArrayMember({ type: "string" })],
          description:
            "One entry per line. They are joined with a line break, so this is how the sentence is deliberately split across two lines.",
          validation: (rule) => rule.required().min(1),
        }),
      ],
    }),
    defineField({
      name: "details",
      title: "Contact details",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "callLabel",
          title: "Phone label",
          type: "string",
          description:
            "The number itself comes from Site Settings → Firm Details, so it is never typed twice.",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "emailLabel",
          title: "Email label",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "addressLabel",
          title: "Address label",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "hoursLabel",
          title: "Hours label",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "form",
      title: "The form",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "cardTitle",
          title: "Form heading",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "cardIntro",
          title: "Form intro",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "firstName", title: "First name", type: "formField", validation: (r) => r.required() }),
        defineField({ name: "lastName", title: "Last name", type: "formField", validation: (r) => r.required() }),
        defineField({ name: "email", title: "Email", type: "formField", validation: (r) => r.required() }),
        defineField({ name: "phone", title: "Phone", type: "formField", validation: (r) => r.required() }),
        defineField({ name: "message", title: "Message", type: "formField", validation: (r) => r.required() }),
        defineField({
          name: "submitLabel",
          title: "Button",
          type: "string",
          validation: (rule) =>
            rule.required().max(30).warning("Button labels read best under about 30 characters."),
        }),
        defineField({
          name: "privacyNote",
          title: "Reassurance line",
          type: "string",
          description: "The line with the padlock under the button.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Consultation Section" }),
  },
});
