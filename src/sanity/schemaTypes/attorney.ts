import { defineType, defineField } from "sanity";
import { UserIcon } from "@sanity/icons/User";

/* The firm's attorney — Papa Dieye. A SINGLETON: this firm has one.
 *
 * ═══ Why a singleton, not a collection ═══
 *
 * It started as a collection on the reasoning that a second attorney is a
 * realistic hire. That was designing for a firm that doesn't exist yet, at the
 * cost of the one that does: an editor got a list with a single row in it and a
 * "＋" that could spawn a second Papa nobody would ever see, because every
 * consumer takes the first record. One firm, one attorney, one document.
 *
 * If the firm ever hires, this becomes a collection again — but that change
 * should come with the real question it raises, which is whose byline goes on
 * which article. A list of one answers nothing in advance.
 *
 * ═══ Every field here is read by the site ═══
 *
 * That is a rule, not an observation. The first version of this type carried a
 * `photo` and a `rating` that nothing consumed — an editor could upload a new
 * headshot, publish, and watch the site not change. A field that does nothing
 * is worse than an absent one: it looks like the CMS is broken, and the only
 * way to find out otherwise is to read the code.
 *
 * Consumers, so this stays checkable:
 *   name    -> AuthorCard (85 pages)
 *   role    -> AuthorCard (85 pages)
 *   photo   -> AuthorCard, MeetPapa (/about-us/), GuideRequest (homepage)
 *   rating  -> MeetPapa (/about-us/)
 *
 * ═══ ONE role, resolved ═══
 *
 * The site described him as "Founding Attorney" on 2 pages and "Principal &
 * Founder" on 85 — the marketing pages and the article byline had drifted
 * apart, each hardcoded where it was used. Rhan's call, 2026-08-18: it is
 * "Founding Attorney" everywhere. The byline changes on 85 pages as a result,
 * which is the point of asking rather than preserving both.
 *
 * ═══ The rating is a factual claim with a shelf life ═══
 *
 * "5.0" and "Over 150 five-star Google reviews" are numbers that go stale and
 * that a law firm should not overstate. They are fields so the firm can keep
 * them true without a deploy, and the descriptions say so.
 */
export const attorney = defineType({
  name: "attorney",
  title: "Attorney",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "As it should appear everywhere on the site.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Title",
      type: "string",
      description:
        'Shown under the name on the article byline. One value, used everywhere: the site previously said "Founding Attorney" in some places and "Principal & Founder" in others.',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      description:
        "Used on the article byline (every blog post, practice area and location page), on the About page, and beside the guide offer on the homepage. A SQUARE crop works best — the byline renders it as a 160px circle.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Leave empty where the name is already beside the photo.",
        }),
      ],
    }),
    defineField({
      name: "rating",
      title: "Google rating",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "score",
          title: "Score",
          type: "string",
          description: 'As shown — e.g. "5.0". Keep it matching the firm\'s actual Google rating.',
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description:
            'The line beside the score — e.g. "Over 150 five-star Google reviews". A claim about a number that keeps growing, so it is worth revisiting rather than leaving to age.',
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
    prepare: ({ title, subtitle, media }) => ({
      title: title ?? "Attorney",
      subtitle,
      media,
    }),
  },
});
