import { defineType, defineField } from "sanity";
import { LockIcon } from "@sanity/icons/Lock";

/* /privacy-policy/ — the firm's published policy.
 *
 * A SINGLETON. The body is PORTABLE TEXT, unlike every other page document in
 * phase 5, and this is the one page where that is the right answer: the prose
 * carries bold inside sentences, so a plain string field would hand a lawyer a
 * box with `<strong>` tags in it and a way to break the page by mistyping one.
 *
 * ONE field for the whole policy, headings included. It was an `intro` plus
 * eight {heading, body} sections until 2026-08-20, split that way because
 * Portable Text headings go through ProseHeading and would have gained ids
 * these eight never had. That is handled at the call site now — the page passes
 * `headingIds={false}` to ProseBody, so the h2s render bare exactly as before.
 *
 * `contactNote` stays OUT of the body, and that one is not cosmetic: the phone
 * number and postal address in that sentence are rendered from `firmDetails`.
 * As rich text an editor would be typing a number the Studio could never keep
 * current, which is the drift this whole page's model exists to prevent.
 *
 * ═══ The one interpolated sentence ═══
 *
 * The closing paragraph gives the phone number and the postal address, and both
 * come from `firmDetails` rather than being typed here — the same rule the rest
 * of the site follows, and the reason a wrong number in a comp never reached
 * the site. `contactNote` is the sentence BEFORE them; the page appends the NAP.
 */
export const privacyPolicyPage = defineType({
  name: "privacyPolicyPage",
  title: "Privacy Policy Page",
  type: "document",
  icon: LockIcon,
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
        defineField({ name: "kicker", title: "Kicker", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      group: "content",
      description:
        "The whole policy under the header. Use Heading 2 for the section headings. The closing contact sentence is the separate field below, because the phone number and address in it are rendered live from Firm Details.",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "contactNote",
      title: "Closing sentence with the firm's contact details",
      type: "string",
      group: "content",
      description:
        "Rendered in bold as the last paragraph of the page. Write the sentence UP TO the phone number — the number and the postal address are added from Firm Details, so they can never go stale here. This is NOT part of the body above for exactly that reason: as rich text an editor would be typing a phone number that the Studio could never keep current.",
    }),
    defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Privacy Policy Page" }) },
});
