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
 *   name   -> AuthorCard (85 pages)
 *   role   -> AuthorCard (85 pages), About + FeaturedAttorney (homepage),
 *             MeetPapa + FirmPromise (/about-us/)
 *   photo  -> AuthorCard, MeetPapa (/about-us/), GuideRequest (homepage)
 *
 * The photo carries NO alt field. It is the same man in all three places and
 * his name sits beside it every time, so the description is derived from `name`
 * and `role` — which means it can never fall out of step with them, and there is
 * one less box asking an editor to describe a face.
 *
 * ═══ ONE role, resolved ═══
 *
 * The site described him as "Founding Attorney" on 2 pages and "Principal &
 * Founder" on 85 — the marketing pages and the article byline had drifted
 * apart, each hardcoded where it was used. Rhan's call, 2026-08-18: it is
 * "Founding Attorney" everywhere. The byline changed on 85 pages as a result,
 * which is the point of asking rather than preserving both.
 *
 * The drift is only actually closed if every surface reads this field, so all
 * five do. The four marketing spots were hardcoded for one commit longer than
 * the byline, which meant retitling him in the Studio would have moved 85 pages
 * and left the homepage and /about-us/ behind — the same disagreement, rebuilt
 * with a CMS behind half of it.
 *
 * Two places still say it in their own words, deliberately: the three
 * /about-us/ meta descriptions, which are page copy and belong to that page's
 * record, and one sentence of the client's published prose on
 * /family-law/divorce/uncontested-divorce/, which is not ours to template.
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
