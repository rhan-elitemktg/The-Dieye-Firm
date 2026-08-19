import { defineType, defineField } from "sanity";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/* One question and answer, rendered in two places and two lengths.
 *
 * ═══ The two wordings are the feature, not a bug to fix ═══
 *
 * /faq/ carries the client's own published answers verbatim — nine of them,
 * running to 136 words each. The homepage carries six of the same nine
 * CONDENSED BY US, because a homepage section cannot hold 136 words and a
 * homepage that repeated /faq/ word for word would make the two pages
 * duplicates of each other. The long versions are the ones with the search
 * equity; the short ones exist so the homepage can have the section at all.
 *
 * One document with two answer fields records that better than two collections
 * would: the pairing is visible, and nobody can edit one wording believing they
 * have edited both. AGENTS.md forbids unifying them.
 *
 * ═══ The client's prose is left alone ═══
 *
 * Curly apostrophes, "$5,000.00", "20 percent" and all. It is theirs and it
 * carries the equity. The repo's spaced-hyphen rule governs copy we write, not
 * the firm's own published pages.
 *
 * ONE answer departs from the live page, and it says so on the document itself.
 * Log any further departure in docs/live-site-corrections.md the same way,
 * rather than editing a client sentence silently.
 *
 * ═══ Order ═══
 *
 * Drag order drives /faq/, and the homepage renders its six in the same
 * sequence. There is no other key that would reproduce it: alphabetical would
 * scatter the three spousal-support questions and the plan's own table forgot
 * to say how these sort, which is how a list ends up ordered by creation time
 * by accident.
 */
export const faq = defineType({
  name: "faq",
  title: "FAQs",
  type: "document",
  icon: HelpCircleIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "faq" }),
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      description: "As the client publishes it. The same question heads both the long and short answers.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Full answer",
      type: "text",
      rows: 8,
      description:
        "The client's published answer, word for word — this is the version on /faq/ and the one carrying the search equity. If you must change it, note why in docs/live-site-corrections.md.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "showOnHomepage",
      title: "Show on the homepage",
      type: "boolean",
      initialValue: false,
      description:
        "Six of the nine appear in the homepage section. Turning this on needs a short answer below.",
    }),
    defineField({
      name: "shortAnswer",
      title: "Short answer (homepage)",
      type: "text",
      rows: 4,
      description:
        "Our condensed version, for the homepage section only. Deliberately not the same wording as the full answer — if the two matched, the homepage and /faq/ would be duplicates of each other.",
      /* A homepage question with no short answer would render an empty <p> in
         the accordion. Caught here rather than in the component, because the
         person who can fix it is the one in the Studio. */
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as { showOnHomepage?: boolean } | undefined;
          if (doc?.showOnHomepage && !value) {
            return "This question is set to show on the homepage, so it needs a short answer.";
          }
          return true;
        }),
    }),
    defineField({
      name: "note",
      title: "Editorial note",
      type: "text",
      rows: 3,
      description:
        "Only for a question or answer that departs from the live site. Never rendered — it travels with the document so the reason is not lost.",
    }),
  ],
  preview: {
    select: { title: "question", home: "showOnHomepage" },
    prepare: ({ title, home }) => ({
      title,
      subtitle: home ? "/faq/ and the homepage" : "/faq/ only",
    }),
  },
});
