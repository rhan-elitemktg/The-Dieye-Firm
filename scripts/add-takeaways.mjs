/* add-takeaways.mjs — one-off: write keyTakeaways into each post's frontmatter.
 *
 * These are EXTRACTIVE. Every bullet restates something the post itself already
 * says; none introduces a legal assertion the article does not make. They still
 * summarise legal content, so they are pending attorney review before launch
 * (tracked in HANDOFF.md).
 *
 * Kept as a script rather than hand-edited files so the wording is reviewable
 * in one place and can be regenerated after a re-scrape.
 *
 *   node scripts/add-takeaways.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/content/blog"
);

const TAKEAWAYS = {
  "10-reasons-why-shared-child-custody-might-be-a-better-idea": [
    "Joint Managing Conservatorship is the presumption in Texas, so a parent seeking sole custody has to rebut it.",
    "Children who lose access to one parent after a divorce are more likely to become withdrawn, depressed or anxious.",
    "Studies associate joint custody with better physical health, academic achievement and emotional well-being.",
    "Shared parenting also eases the load on parents, reducing conflict over support and freeing time for work or study.",
  ],
  "addressing-false-allegations-defending-yourself-against-unfounded-domestic": [
    "False domestic violence allegations can affect custody, property division and criminal exposure, not only reputation.",
    "Gather tangible evidence such as text messages, emails and photographs, and build a detailed timeline of events.",
    "Keep a record of every interaction with the accuser, and collect statements from witnesses.",
    "Expert input and experienced representation can be decisive in rebutting an unfounded claim.",
  ],
  "do-you-still-have-to-pay-child-support-if-you-have-shared-custody": [
    "Shared custody does not remove a child support obligation, but it can change the amount.",
    "The calculation weighs both parents' income, the number of children and how parenting time is divided.",
    "Support can be modified when circumstances change substantially, such as a job loss or a shift in parenting time.",
    "Non-payment is enforceable through the court, which can hold a parent in contempt and compel payment.",
  ],
  "does-remarriage-affect-child-support-obligations": [
    "Texas bases child support on the biological parents' obligations, so a new spouse's income does not automatically change it.",
    "Remarriage on its own is generally not grounds for modifying a support order.",
    "Related changes can qualify, including new dependent children, changed living expenses, career moves or health coverage.",
    "Courts weigh the child's welfare first, treating remarriage as an opportunity for review rather than an automatic adjustment.",
  ],
  "how-does-spousal-support-enforcement-work-in-texas": [
    "A Texas family court can order maintenance payments, or spouses can agree to support through a property settlement.",
    "Unpaid court-ordered maintenance can be enforced by contempt, which may carry a fine or jail time.",
    "The court can enter a judgment for amounts owed and order withholding from the payor's employer.",
    "A payor may defend against enforcement by showing they could not pay, sell assets or borrow to cover the debt.",
  ],
  "how-long-does-it-take-to-get-a-divorce-in-texas": [
    "You or your spouse must have lived in Texas for six months and in the filing county for 90 days.",
    "An uncontested divorce is typically faster and less expensive than a contested one.",
    "Texas imposes a mandatory 60-day waiting period from filing before a divorce can be finalised.",
    "Gathering documents early and using mediation or collaborative divorce can shorten the timeline.",
  ],
  "how-the-2025-texas-fit-parent-presumption-affects-your-custody-rights": [
    "SB 2052 took effect on September 1, 2025, codifying a presumption that a fit parent acts in their child's best interest.",
    "It applies to suits affecting the parent-child relationship filed on or after that date.",
    "A nonparent challenging a fit parent now has to clear a considerably higher bar than before.",
    "The law adds an affidavit requirement that operates as a gate before a hearing takes place.",
  ],
  "mediation-for-high-conflict-divorces-is-it-still-possible": [
    "Mediation remains a viable option in high-conflict divorces, though it is harder to run well.",
    "High-conflict cases are marked by persistent hostility and an inability to compromise, which prolongs the process.",
    "The emotional toll reaches children, who may experience confusion and insecurity.",
    "Choosing the right mediator and preparing properly are the main factors in whether mediation succeeds.",
  ],
  "mediation-vs-litigation-choosing-the-right-path-for-your-divorce": [
    "Mediation uses a neutral third party who guides couples toward agreement but does not decide the outcome.",
    "It is usually more cost-effective, quicker and more private, and tends to preserve post-divorce relationships.",
    "Litigation places decisions with the court, which can suit cases with complex assets or little cooperation.",
    "The right path depends on the complexity of the divorce, the level of communication and your personal priorities.",
  ],
  "modifications-and-enforcement-adapting-to-life-changes-post-divorce": [
    "Significant changes in income, relocation or a child's needs are common grounds for modifying a divorce order.",
    "A modification requires demonstrating to the court that circumstances have changed substantially.",
    "Divorce decrees are enforceable, and legal remedies exist when a former spouse does not comply.",
    "Mediators and arbitrators can resolve many post-divorce disputes without a return to full litigation.",
  ],
  "new-year-new-beginnings-is-divorce-part-of-your-resolution-for-a-fresh-start": [
    "Divorce in Texas addresses property, finances and, where relevant, arrangements for children.",
    "The process varies depending on whether spouses agree on terms or need the court to resolve them.",
    "Property division, child custody and support are the main areas to understand before filing.",
    "Mediation and alternative dispute resolution can settle terms without going to a courtroom.",
  ],
  "preparing-emotionally-for-mediation": [
    "Texas courts often require mediation before a divorce case goes to trial.",
    "The mediator does not decide anything for you, and any agreement reached is voluntary.",
    "Emotion is unavoidable; the goal is enough self-awareness to keep it from driving your decisions.",
    "Knowing your priorities and what you can live with beforehand protects you when the session gets difficult.",
  ],
  "seasonal-relocation-challenges-in-custody-cases": [
    "Custody laws vary widely by state, and the UCCJEA governs which court keeps jurisdiction after a move.",
    "Jurisdiction turns on the child's home state, length of residence and proximity to evidence or witnesses.",
    "Relocation generally requires modifying the existing custody order.",
    "Beyond the legal questions, a move carries financial, educational and emotional consequences for the child.",
  ],
  "understanding-child-custody-laws-in-pearland-texas": [
    "Texas uses the term conservatorship for what most people call custody.",
    "Conservatorship separates two questions: who makes decisions for the child, and where the child lives.",
    "A possession order sets out the parenting schedule.",
    "Parents can agree on custody without going to court, and an order can be modified after divorce.",
  ],
  "understanding-child-custody-laws": [
    "Legal custody covers major decisions about a child's education, medical care and religious upbringing.",
    "Physical custody determines where the child lives and may be sole or joint.",
    "Courts decide on the best interests of the child, weighing parental fitness and, at times, the child's preference.",
    "Custody arrangements can be modified, and failing to comply with an order carries consequences.",
  ],
  "what-to-do-when-your-ex-stops-paying-child-support-in-texas": [
    "Start by contacting your ex, since the cause may be a misunderstanding or a change in their finances.",
    "If that does not resolve it, file a Motion to Enforce asking the court to compel payment.",
    "The Attorney General's office can assist with child support enforcement.",
    "Document everything; a clear record supports enforcement and any later court action.",
  ],
};

let written = 0;

for (const [slug, items] of Object.entries(TAKEAWAYS)) {
  const file = path.join(DIR, `${slug}.md`);
  const src = await readFile(file, "utf8");

  if (src.includes("\nkeyTakeaways:")) {
    console.log(`· ${slug} (already has takeaways)`);
    continue;
  }

  const block =
    "keyTakeaways:\n" + items.map((i) => `  - ${JSON.stringify(i)}`).join("\n") + "\n";

  // Sits directly above legacyPath, the last frontmatter key the scraper emits.
  const out = src.replace(/^legacyPath:/m, block + "legacyPath:");
  if (out === src) throw new Error(`no legacyPath anchor in ${slug}`);

  await writeFile(file, out, "utf8");
  console.log(`✓ ${slug}`);
  written++;
}

console.log(`\n${written} posts updated.`);
