import { defineType, defineField, defineArrayMember } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";

/* Firm Details — the single source of truth for facts that appear in more than
 * one place: the header info bar, the main nav, the contact section and the
 * footer all read from this one document.
 *
 * A singleton. The fixed document ID is pinned in src/sanity/structure.ts, not
 * here — Sanity has no `singleton: true` schema option.
 *
 * Note what is deliberately absent: social icon paths, the `tel:` and `mailto:`
 * prefixes, and the one-line address. Those are presentation, derived in
 * src/sanity/firmDetails.ts. Editors type a phone number, not a URI scheme.
 */
export const firmDetails = defineType({
  name: "firmDetails",
  title: "Firm Details",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "contact", title: "Contact" },
    { name: "navigation", title: "Navigation" },
  ],
  fields: [
    defineField({
      name: "firmName",
      title: "Firm name",
      description: "Used in the footer copyright line and logo alt text.",
      type: "string",
      group: "identity",
      validation: (rule) =>
        rule.required().max(60).warning("Long names wrap in the footer copyright line."),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      description:
        "One sentence, shown under the logo in the footer. The column is capped at roughly 32 characters per line, so keep it short.",
      type: "text",
      rows: 2,
      group: "identity",
      validation: (rule) =>
        rule.max(120).warning("Long taglines wrap awkwardly in the footer."),
    }),

    defineField({
      name: "phone",
      title: "Phone number",
      description:
        "As it should read on screen, for example (832) 299-1990. The click-to-call link is generated from it.",
      type: "string",
      group: "contact",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (typeof value !== "string") return true;
          const digits = value.replace(/\D/g, "");
          return digits.length === 10
            ? true
            : "Enter a 10-digit US number, for example (832) 299-1990.";
        }),
    }),
    defineField({
      name: "email",
      title: "Email address",
      type: "string",
      group: "contact",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "address",
      title: "Office address",
      type: "object",
      group: "contact",
      options: { columns: 2 },
      fields: [
        defineField({
          name: "street",
          title: "Street and suite",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "locality",
          title: "City",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "region",
          title: "State",
          type: "string",
          validation: (rule) => rule.required().max(2),
        }),
        defineField({
          name: "postalCode",
          title: "ZIP code",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "hours",
      title: "Office hours",
      type: "object",
      group: "contact",
      options: { columns: 2 },
      fields: [
        defineField({
          name: "days",
          title: "Days",
          description: "For example: Monday – Friday",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "time",
          title: "Hours",
          description: "For example: 9:00 AM – 5:00 PM",
          type: "string",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "socials",
      title: "Social profiles",
      description:
        "Shown in the header info bar and the footer, in this order. The icon comes from the platform you pick.",
      type: "array",
      group: "contact",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialProfile",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              options: {
                list: [
                  { title: "Facebook", value: "facebook" },
                  { title: "Instagram", value: "instagram" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "X", value: "x" },
                  { title: "YouTube", value: "youtube" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Profile URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "platform", subtitle: "url" },
          },
        }),
      ],
      validation: (rule) =>
        rule.unique().custom((items) => {
          if (!Array.isArray(items)) return true;
          const platforms = items.map(
            (item) => (item as { platform?: string })?.platform
          );
          const duplicated = platforms.filter(
            (platform, index) => platform && platforms.indexOf(platform) !== index
          );
          return duplicated.length
            ? `Each platform should appear once. Duplicated: ${[...new Set(duplicated)].join(", ")}.`
            : true;
        }),
    }),

    defineField({
      name: "serviceAreas",
      title: "Service areas",
      description:
        "Feeds the Service Areas dropdown in the main nav. The short name is what the dropdown shows.",
      type: "array",
      group: "navigation",
      of: [
        defineArrayMember({
          type: "object",
          name: "serviceArea",
          fields: [
            defineField({
              name: "label",
              title: "Full name",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "navLabel",
              title: "Short name",
              description: "Shown in the nav dropdown, where the full name is unwieldy.",
              type: "string",
              validation: (rule) =>
                rule.required().max(24).warning("The nav dropdown is narrow — keep the short name short."),
            }),
            defineField({
              name: "href",
              title: "Page path",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "href" },
          },
        }),
      ],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "footerNav",
      title: "Footer columns",
      description:
        "The link columns beside the footer logo. Three columns is what the layout is built for.",
      type: "array",
      group: "navigation",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerColumn",
          fields: [
            defineField({
              name: "heading",
              title: "Column heading",
              type: "string",
              validation: (rule) =>
                rule.required().max(30).warning("Long column headings wrap and unbalance the footer."),
            }),
            defineField({
              name: "links",
              title: "Links",
              type: "array",
              of: [defineArrayMember({ type: "navLink" })],
              validation: (rule) => rule.min(1),
            }),
          ],
          preview: {
            select: { title: "heading", links: "links" },
            prepare({ title, links }) {
              const count = Array.isArray(links) ? links.length : 0;
              return {
                title,
                subtitle: `${count} link${count === 1 ? "" : "s"}`,
              };
            },
          },
        }),
      ],
      validation: (rule) =>
        rule
          .max(3)
          .warning("The footer grid is built for three columns."),
    }),
    defineField({
      name: "legalLinks",
      title: "Legal bar links",
      description: "The small print beside the copyright line.",
      type: "array",
      group: "navigation",
      of: [defineArrayMember({ type: "navLink" })],
    }),
  ],
  preview: {
    select: { title: "firmName" },
    prepare({ title }) {
      return { title: title ?? "Firm Details", subtitle: "Firm Details" };
    },
  },
});
