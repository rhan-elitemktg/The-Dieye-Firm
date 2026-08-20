import { defineType, defineField } from "sanity";
import { MobileDeviceIcon } from "@sanity/icons/MobileDevice";
import { capEyebrow, capHeading, capHeadingAccent } from "./limits";

/* /contact-us/ — the destination of the gold header CTA on every page.
 *
 * A SINGLETON, built to the conventions in the `homePage` header. Two bands are
 * here and they are the only two this page owns.
 *
 * ═══ The form in the middle is NOT here ═══
 *
 * The body of this page is the sitewide consultation section in its `page`
 * variant — `Layout` renders it and the page asks for the variant. Its copy is
 * `consultForm`, a record, because it renders on 93 pages. That is also why
 * this document has no form fields, no submit label and no privacy note: they
 * would be a second, disagreeing copy of the section every other page shows.
 *
 * ═══ Nor is the address ═══
 *
 * Find Us renders the map and the NAP from `firmDetails`. A comp once carried a
 * wrong phone number for this firm, which is exactly why the address, the phone
 * and the hours come from one record rather than from page copy.
 */
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  icon: MobileDeviceIcon,
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
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          description: "Centred type on white — there is no hero photo on this page.",
          validation: (rule) => rule.required(),
        }),
        defineField({ name: "lead", title: "Lead", type: "text", rows: 3, validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "findUs",
      title: "Find Us",
      type: "object",
      group: "content",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "eyebrow",
          title: "Eyebrow",
          type: "string",
          description: "The address and the map below come from Site Settings → Firm Details.",
          validation: (rule) => capEyebrow(rule.required()),
        }),
        defineField({ name: "headingLead", title: "Heading", type: "string", validation: (rule) => capHeading(rule.required()) }),
        defineField({ name: "headingAccent", title: "Heading — italic part", type: "string", validation: (rule) => capHeadingAccent(rule) }),
        defineField({
          name: "headingTail",
          title: "Heading — after the italic",
          type: "string",
          description:
            "The rest of the line, if the italic sits mid-sentence. Start it with punctuation to butt it against the italic, or with a word to have a space added.",
          validation: (rule) => capHeading(rule),
        }),
      ],
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Contact Page" }) },
});
