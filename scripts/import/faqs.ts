/* One-time import: the nine FAQs.
 *
 *   npx sanity exec scripts/import/faqs.ts --with-user-token
 *
 * TWO WORDINGS, ONE DOCUMENT. `answer` is the client's published answer from
 * /faq/, verbatim - curly apostrophes, "$5,000.00", "20 percent" and all.
 * `shortAnswer` is our condensed version for the homepage section, which cannot
 * hold answers that run to 136 words. Six of the nine carry both. The two sets
 * are deliberately different and AGENTS.md forbids unifying them: the long ones
 * carry the search equity, and a homepage repeating /faq/ word for word would
 * make the two pages duplicates.
 *
 * Both sets were extracted from the source files rather than retyped, so the
 * transcription is exact by construction: pages/faq.astro for the nine,
 * components/home/Faq.astro for the six.
 *
 * ONE answer departs from the live page. It travels with the document in its
 * `note` field and is logged as correction 3 in docs/live-site-corrections.md.
 *
 * ORDER is /faq/'s published order, given as explicit ranks. The homepage
 * renders its six in the same sequence, which is why it needs no order of its
 * own - it is a filter over this one.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

type Row = {
  id: string;
  question: string;
  answer: string;
  showOnHomepage?: boolean;
  shortAnswer?: string;
  note?: string;
};

const FAQS: Row[] = [
  {
    id: "faq-contested-vs-uncontested",
    question: "What is the difference between a contested and an uncontested case?",
    answer: "Contested cases mean that the spouses cannot agree on something (or sometimes, on anything). Depending on how contentious the case is, this might require a formal exchange of documents, multiple hearings, and attempts at mediation before the case can be finalized. An uncontested divorce means the couple has agreed on everything, from the division of their property to children’s issues. These divorce cases are usually disposed of quickly.",
    showOnHomepage: true,
    shortAnswer: "A contested case means the spouses can't agree on one or more issues, which may require document exchanges, hearings, and mediation before it's finalized. An uncontested case means you've agreed on everything, from property to children's issues, and is usually resolved quickly.",
  },
  {
    id: "faq-property-split",
    question: "Is marital property always divided 50/50?",
    answer: "Not necessarily. The property will be divided in a way that is fair and equitable, which does not necessarily mean a 50/50 split. Usually, courts will divide property in a way that is close to the 50/50 mark, but often one spouse will receive slightly more. Splits of 45-55 are very common, while it would be highly unusual for a court to divide an estate in a more lopsided way, such as 30-70.",
    note: "TWO EDITS, and the only place these nine depart from the live page. The live question is \"What factors does the court look at in determining the division of assets?\", which its own answer does not answer: the answer opens \"Not necessarily.\" and is plainly replying to a question about a 50/50 split that appears nowhere on the page. The question is recast to the one the answer is already giving. The answer's third sentence, \"All the factors mentioned above are considered to determine how the property will be divided.\", is dropped for the same reason - no factors are mentioned above it. Nothing else is touched. Logged as correction 3 in docs/live-site-corrections.md so the firm can fix the live page too.",
  },
  {
    id: "faq-joint-vs-sole-custody",
    question: "What is the difference between joint custody and sole custody?",
    answer: "In Texas, joint managing conservatorship is the default position of the courts. Usually, it is in the best interest of the child to have both parents equally involved in their lives. Joint managing conservatorship means both parents will have joint rights and duties as it relates to the children although some rights may be given exclusively to one parent (education and medical for example). Sole custody means that only one parent will get the exclusive right to make most decisions for the children but the other parent will still have visitation rights. In order to get sole managing conservatorship, a party must demonstrate that it will not be in the best interest of the child to have joint custody. Usually, this involves showing the court that there has been some abuse or neglect by a parent.",
    showOnHomepage: true,
    shortAnswer: "In Texas, joint managing conservatorship is the default: both parents share rights and duties, though some rights may go to one parent. Sole custody gives one parent the exclusive right to make most decisions, and is only granted when joint custody wouldn't serve the child's best interest.",
  },
  {
    id: "faq-spousal-support-entitlement",
    question: "When is a party entitled to receive spousal support?",
    answer: "In Texas, courts are generally reluctant to award spousal support. A party will only receive court-ordered spousal support if the marriage has lasted ten years or longer and the spouse made diligent efforts to either earn sufficient income or to develop necessary skills while the divorce is pending to meet his or her minimum reasonable needs; or the other spouse has committed family violence; or the requesting spouse has an incapacitating disability that arose during marriage; or a child of the marriage (of any age) has a physical or mental disability that prevents the spouse who cares for and supervises the child from earning sufficient income.",
    showOnHomepage: true,
    shortAnswer: "Texas courts are generally reluctant to award spousal support. It's typically available only when the marriage lasted ten years or longer and the requesting spouse can't meet their minimum reasonable needs, or in cases involving family violence or a qualifying disability.",
  },
  {
    id: "faq-custody-factors",
    question: "What factors does the court look at when awarding custody?",
    answer: "The paramount consideration for the court is always the best interest of the child, but this can be a nebulous concept. Courts will look at a multitude of factors: the age of the child, the relationship the child has with each parent, the ability of the parents to cooperate, the existence of any abuse or neglect, and even the child’s preference. There is no limit as to what the court can consider when it comes to determining custody.",
    showOnHomepage: true,
    shortAnswer: "The paramount consideration is always the best interest of the child. Courts weigh the child's age, the relationship with each parent, the parents' ability to cooperate, any abuse or neglect, and even the child's preference. There's no fixed limit on what they may consider.",
  },
  {
    id: "faq-spousal-support-amount",
    question: "How much spousal support will the court order?",
    answer: "While the amount and duration of spousal support will always depend on the facts of your case, there are certain limitations the court has when ordering spousal support. First, it cannot be over 20 percent of a paying party’s gross income, or $5,000.00 each month, whichever is lower. Next, the duration of support will depend on the length of the marriage. For marriages of 10-20 years, spousal support can be up to five years. Marriages between 20-30 years could have seven years of support, while marriages over 30 years could have spousal support ordered for up to ten years.",
    showOnHomepage: true,
    shortAnswer: "Support can't exceed 20% of the paying spouse's gross income or $5,000 per month, whichever is lower. Duration depends on the length of the marriage: up to five years for marriages of 10 to 20 years, seven years for 20 to 30 years, and up to ten years for marriages over 30 years.",
  },
  {
    id: "faq-standard-possession-order",
    question: "What is the Standard Possession Order?",
    answer: "This is the default schedule that courts use when determining a visitation schedule. It’s a great place for couples to start if they’d like to customize their own schedule. The non-primary parent will get the children every first, third and fifth Friday of the month until the following Sunday. They will usually get a midweek period of possession, Thursday, and it can be overnight. The couples will swap holidays. The parent who gets Thanksgiving will not get Christmas, but this will alternate every year. Finally, the non-primary conservator usually gets the whole month of July, although there are some variations to this schedule.",
  },
  {
    id: "faq-spousal-support-factors",
    question: "What are the factors a court considers when determining spousal support?",
    answer: "The overriding principle is the needs of the recipient party balanced with the ability of the other spouse's ability to pay. There is no exhaustive list for a judge to use, but they should consider the financial situation of both spouses, the contribution of each spouse to the marriage (including whether or not one party sacrificed their career to raise children), the age, employment history, education, health and earning capacity of the spouse requesting support, spousal violence, and any fault in the break-up of the marriage.",
  },
  {
    id: "faq-child-support-amount",
    question: "How much is child support if it is ordered?",
    answer: "Texas uses a specific formula to determine the amount of child support. It is based on a parent's gross income and the number of children that the parent has. The possession schedule has no bearing on child support, nor does the recipient spouse's income. That is because child support is the right of the child and not the other parent. It is important to remember that the formula is merely a guideline.",
    showOnHomepage: true,
    shortAnswer: "Texas uses a formula based on the paying parent's gross income and the number of children. The possession schedule and the other parent's income don't factor in, because child support is the right of the child, and the formula is a guideline.",
  },
];

/* Zero-padded and spaced so a question dragged between two needs no
   renumbering, matching how the plugin writes ranks itself. */
const rank = (i: number) => `0|${String((i + 1) * 100000).padStart(6, "0")}:`;

async function run() {
  const tx = client.transaction();

  FAQS.forEach((faq, i) => {
    const { id, ...fields } = faq;
    tx.createOrReplace({
      _id: id,
      _type: "faq",
      orderRank: rank(i),
      showOnHomepage: false,
      ...fields,
    });
  });

  await tx.commit();
  console.log(`\u2713 ${FAQS.length} faqs written (${FAQS.filter((f) => f.showOnHomepage).length} on the homepage)`);

  await waitForPublic('count(*[_type == "faq"])', FAQS.length, "the FAQs");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
