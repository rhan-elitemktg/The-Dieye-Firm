import type { StringRule, TextRule } from "sanity";

/* House length caps for design-coupled short strings.
 *
 * ═══ Every cap is WARNING-only, and that is the point ═══
 *
 * Publishing fires the Vercel deploy hook, so a blocking error over a nitpick
 * would stop the whole site rebuilding. `seo.ts` carries the long-form version
 * of this rule; reserve `.error()` for things that would actually break a page,
 * such as a two-letter state code or a number range.
 *
 * ═══ The numbers are MEASURED, not guessed ═══
 *
 * A cap that fires on correct copy is worse than no cap at all: it teaches an
 * editor that the warnings are noise, and then the one that matters gets
 * ignored too. Each number below is roughly double the longest value the
 * published dataset actually held when it was set, so honest copy never trips
 * one and a warning always means something is genuinely out of band.
 *
 * Longest real values, measured 2026-08-20 across the 17 singletons:
 *
 *     button label      23   "Schedule a Consultation"
 *     split heading     38   "Family Law Isn't Just About Outcomes -"
 *     heading accent    30   "a steady hand for your family."
 *     card title        26   "Frequently Asked Questions"
 *     stat figure        9   "17+ Years"
 *     eyebrow           29   "Pearland & Houston Family Law"
 *     reassurance       49   "Everything you share is private and confidential."
 *
 * Re-measure before changing one, rather than nudging a number until a warning
 * goes away. Pull the singletons and take the longest value per key:
 *
 *     npx sanity documents query '*[_type in ["homePage","aboutPage",
 *       "consultForm","caseEvaluationForm","whatDrivesUs","testimonialsBand",
 *       "statsBand","firmDetails","attorney"]]'
 *
 * ═══ Usage ═══
 *
 * Each helper takes the rule chain, so required-ness stays visible at the call
 * site rather than being hidden in here:
 *
 *     validation: (rule) => capButton(rule.required())
 *     validation: (rule) => capHeadingAccent(rule)        // optional field
 */

type Rule = StringRule | TextRule;

/** The small gold kicker above a section heading. */
export const capEyebrow = <R extends Rule>(rule: R) =>
  rule.max(40).warning("Eyebrows read best under about 40 characters.") as R;

/** A button or submit label. */
export const capButton = <R extends Rule>(rule: R) =>
  rule.max(30).warning("Button labels read best under about 30 characters.") as R;

/** The plain first part of a split heading. */
export const capHeading = <R extends Rule>(rule: R) =>
  rule
    .max(60)
    .warning(
      "Section headings read best under about 60 characters — past that the line breaks land where the window ends rather than where the sentence does.",
    ) as R;

/** The gold-italic tail of a split heading. */
export const capHeadingAccent = <R extends Rule>(rule: R) =>
  rule
    .max(60)
    .warning("The italic part is appended to the last line — keep it under about 60 characters so the line still breaks where you meant it to.") as R;

/** A card or tile title. */
export const capCardTitle = <R extends Rule>(rule: R) =>
  rule.max(60).warning("Card titles read best under about 60 characters.") as R;

/**
 * A stat figure — the big number, not its label. These sit four to a row, so
 * a long one narrows the other three rather than wrapping on its own.
 */
export const capFigure = <R extends Rule>(rule: R) =>
  rule.max(24).warning("A figure this long squeezes the other stats in the row.") as R;

/** The small reassurance line under a form's submit button. */
export const capReassurance = <R extends Rule>(rule: R) =>
  rule.max(60).warning("The reassurance line is one line — past about 60 characters it wraps under the button.") as R;
