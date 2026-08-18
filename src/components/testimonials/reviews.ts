/* The client reviews — the single source for every place the site quotes a
 * client. Extracted from ReviewWall.astro so the homepage carousel and the
 * About section read the SAME 14 rather than carrying invented stand-ins, which
 * is what they did until this was pulled out.
 *
 * WHERE THE COPY COMES FROM. These are the clients' own words, harvested
 * verbatim from dieyelaw.com — 14 distinct reviews, the complete set: a sweep of
 * all 121 URLs in the live sitemap turns up no fifteenth. /testimonials/ itself
 * carries only 9 (its "1 / 2" pager splits those 9 across two views, it does not
 * hide a second batch); the other 5 are sprinkled through the practice-area and
 * About pages. AGENTS.md's "leave the client's published prose alone" governs
 * them, so the typos are theirs and are deliberately kept.
 *
 * THREE DELIBERATE, MINIMAL EXCEPTIONS. Add to this list rather than editing a
 * quote silently:
 *   1. Where the live pull-quote is a whole sentence repeated verbatim from the
 *      body, that sentence is dropped from the body — the card would otherwise
 *      print it twice, once at 30px and once at 17px. Nothing is reworded, and
 *      it is only done where the sentence stands alone.
 *   2. Larry's and the "Honest, Sincere" review are truncated mid-word in the
 *      firm's own CMS ("…what he can do. H", "…Mr. Papa was always h"). Each is
 *      cut back to its last complete sentence rather than shipping the
 *      fragment. The missing tail is not recoverable from the live site.
 *   3. Cyndy's is punctuated and de-garbled, at Rhan's instruction — it is the
 *      only one edited for readability rather than for a defect in the source.
 *      See the note on the entry itself.
 *
 * `matter` is OURS, not the client's: it is the practice area each review names
 * in its own text, and nothing is assigned that the quote doesn't say. In the
 * Sanity sweep it becomes a reference to the practice-area document.
 *
 * NOTHING HERE MAY BE INVENTED. Every entry is a real, published review by a
 * real client. A law firm attributing a fabricated quote to a named person is a
 * Texas Bar advertising problem before it is a content problem — if a slot needs
 * filling and no real review fits, the slot goes away, not the rule.
 */

export type Review = {
  lead: string;
  body: string;
  name: string;
  matter: string;
};

/* Ordered as the comp orders them — column-major, so the multi-column layout
   below reproduces the comp's three columns at desktop while still rebalancing
   itself at two and one. `matter` is ours, not the client's: it is the practice
   area each review names in its own text, and nothing is assigned that the
   quote doesn't say. */
export const reviews: Review[] = [
  {
    lead: "If I EVER need an attorney for anything else (within his line of work) I will definitely be contacting Mr. Dieye again.",
    body: "I had a bad experience with a prior attorney who ended up dropping my divorce/custody case mid way and leaving me high and dry to figure it out for myself. I recieved Papa Dieye's (Jay) information from a family friend. Papa Jay is always on top of things and was very prompt with returning phone calls and keeping me in the loop. 2 days after I obtained his legal services we were already in court finalizing my divorce! I have already referred Papa Jay to a handful of people and if I EVER need an attorney for anything else (within his line of work) I will definitely be contacting Mr. Dieye again. Needless to say it was a very pleasant experience and Mr. Dieye is super nice.",
    name: "Kaylyn",
    matter: "Divorce",
  },
  {
    lead: "Professional, personable, and readily available for any questions or concerns.",
    body: "I was quite impressed and I will definitely recommend him to anyone I know!",
    name: "Kim",
    matter: "Family Law",
  },
  {
    lead: "I can't express how grateful I am to have come across this firm.",
    body: "A high level of care is what keeps clients coming back and making referrals. Thanks Papa!!!",
    name: "Former Client",
    matter: "Family Law",
  },
  {
    lead: "I would definitely recommend him to friends and family.",
    body: "He did an excellent job in my divorce. He would always get back with me when I had a question on my case.",
    name: "Osmin",
    matter: "Divorce",
  },
  {
    lead: "He was thoughtful, listened and I truly feel had my child's best interest at heart.",
    body: "He was easy to work with, easy to talk too and cared for the well being of my family. I would highly recommend Papa.",
    name: "Kate",
    matter: "Child Custody",
  },
  {
    lead: "He offers only the best advise and continues to maintain high standards in representing his clients.",
    body: "Well knowledgable of the law and proceedings in a court room, he offers only the best advise and continues to maintain high standards in representing his clients..",
    name: "K.",
    matter: "Family Law",
  },
  {
    lead: "He is most professional in his approach and manner, I would recommend Papa to anyone.",
    body: "I have had the pleasure of using Papa Dieye as my attorney a couple of times, he is most professional in his approach and manner, I would recommend Papa to anyone.",
    name: "Harry",
    matter: "Family Law",
  },
  {
    lead: "I am sure that they're a lot of good lawyers out there, but it is nice to found one who can listen to you.",
    body: "I will definitely recommend Papa Dieye, especially for the human aspect.",
    name: "Rosy",
    matter: "Family Law",
  },
  {
    lead: "Handled 2 of my cases in a very professional way.",
    /* The one review not left verbatim — see the note at the top of the file.
       The original is a single unpunctuated run-on with a garbled verb
       ("...great helped in every way possible he could and continous to has
       handled 2 of my cases..."). Punctuated and de-garbled only; no claim
       added, none dropped. The "2 cases, professionally" clause is gone from
       the body because it is word-for-word the pull-quote above it. */
    body: "My experience was great. He helped in every way possible and walked me through every step of the process. Would highly recommend.",
    name: "Cyndy",
    matter: "Family Law",
  },
  {
    lead: "The man deals with facts and does not stand on shaky grounds.",
    body: "His litigating skills leaves no doubts for my wife and I. He has represented us in our divorce cases and family matters with the court. The man deals with facts and does not stand on shaky grounds. Our family case trial was a real look at what he can do.",
    name: "Larry",
    matter: "Divorce",
  },
  {
    lead: "I would highly recommend Papa Dieye to anyone.",
    body: "He is obviously well respected amongst his peers too which was evident by the interactions I saw during the time waiting to go in front of the judge. I would highly recommend Papa Dieye to anyone (well except my ex of course!!) Thank you Papa.",
    name: "Sam",
    matter: "Family Law",
  },
  {
    lead: "He went above and beyond the call of duty to reunite me with my kids.",
    body: "Papa Dieye was an amazing attorney. He went above and beyond the call of duty to reunite me with my kids after [my spouse] fled the state with them. Not only did he get my kids back to me, he was able to get an order for child support.",
    name: "Former Client",
    matter: "Child Custody",
  },
  {
    lead: "Honest, Sincere, Dedicated & Thorough",
    body: "Mr. Papa Dieye represented me for my divorce case. He was always accessible to answer my questions and he always returned my calls. His preparation was perfect for the temporary orders hearing. Fortunately, our family got reunited.",
    name: "Former Client",
    matter: "Divorce",
  },
  {
    lead: "When I needed a lawyer - he was the only person that I called.",
    body: "I met Papa via a networking group, and I found him to be very personable and when I needed a lawyer - he was the only person that I called. Papa handled my divorce. I had a lot of questions and he answered them, in a very knowledgeable formation, which did not make me feel intimidated. Papa even was kind enough to give me replies to my ex-husbands questions as he lived in a different state and was not represented.",
    name: "Sharmain",
    matter: "Divorce",
  },
];
