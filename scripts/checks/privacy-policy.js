/* Regression test for /privacy-policy/.
 *
 * This page is a LEGAL DOCUMENT reproduced verbatim from the firm's own
 * published policy, so the failure modes worth guarding are not layout ones:
 *
 *   1. A sentence quietly changing. The eight headings and the body word count
 *      are asserted against the live source's own shape, so an edit that drops
 *      or reworks a clause shows up as a number rather than as nobody noticing.
 *   2. The NAP drifting. Deviation 2 in the page file renders the phone and
 *      street address from the firmDetails singleton precisely so a privacy
 *      policy cannot disagree with the footer. If someone ever hardcodes them
 *      back, the tel: href is the thing that disappears first.
 *   3. The list inside "Sharing" collapsing into prose. It sits BETWEEN two
 *      runs of paragraphs, and a naive flattening to <p> would lose the three
 *      disclosure conditions — the same defect PracticeAreaFaqs has today.
 *
 * It also pins the two deliberate omissions, so neither is "fixed" by accident:
 * no practice-area menu in the rail, and therefore no page-level JavaScript.
 *
 *   npm run probe -- scripts/checks/privacy-policy.js --url http://localhost:PORT/privacy-policy/
 */
(async () => {
  const results = {};
  const body = document.querySelector(".prose.pp__body");
  if (!body) return { error: "no .prose.pp__body on the page" };

  const text = (el) => el.textContent.replace(/\s+/g, " ").trim();
  const words = (s) => s.split(" ").filter(Boolean).length;

  /* --- Page shape --- */
  results.h1Count = document.querySelectorAll("h1").length;
  results.h1 = document.querySelector("h1")?.textContent.trim() ?? null;
  results.kicker = document.querySelector(".ih__kicker")?.textContent.trim() ?? null;
  results.kickerIsPlainLabel = !document.querySelector(".ih__kicker a");
  results.deckRendered = !!document.querySelector(".ih__deck");

  /* --- The client's eight headings, in the client's order --- */
  const EXPECTED = [
    "Information Collection", "Information Use", "Security", "Cookies",
    "Sharing", "Links", "Surveys & Contests", "Consent",
  ];
  const h2s = [...body.querySelectorAll("h2")].map((h) => h.textContent.trim());
  results.h2s = h2s;
  results.h2sMatchSource = JSON.stringify(h2s) === JSON.stringify(EXPECTED);

  /* --- The prose is the point --- */
  results.bodyWords = words(text(body));
  results.paragraphs = body.querySelectorAll("p").length;
  results.emptyParagraphs = [...body.querySelectorAll("p")].filter((p) => !text(p)).length;

  /* --- The Sharing list survived as a list, in the middle of the section --- */
  const lists = [...body.querySelectorAll("ul")];
  results.lists = lists.length;
  results.listItems = lists[0] ? lists[0].querySelectorAll("li").length : 0;
  const kids = [...body.children];
  const ulAt = kids.findIndex((n) => n.tagName === "UL");
  results.listHasProseBothSides =
    ulAt > 0 &&
    kids[ulAt - 1]?.tagName === "P" &&
    kids[ulAt + 1]?.tagName === "P";

  /* --- Deviation 2: the NAP comes from firmDetails, not from literal text --- */
  const telLinks = [...body.querySelectorAll('a[href^="tel:"]')];
  results.telLinksInBody = telLinks.length;
  results.telHref = telLinks[0]?.getAttribute("href") ?? null;
  results.telText = telLinks[0]?.textContent.trim() ?? null;
  const closing = text(body).slice(-260);
  results.closingMentionsPrivacyOfficer = /Attn: Privacy Officer/.test(closing);
  results.closingCarriesAddress = /Pearland, TX 77584/.test(closing);
  /* The old page's wording. If this reappears the interpolation was reverted. */
  results.hardcodedOldAddress = /12280 Broadway Street, Suite 3105/.test(text(body));

  /* --- Deviation 1: typography normalised throughout, not half-done --- */
  const raw = text(body);
  results.straightApostrophes = (raw.match(/'/g) || []).length;
  results.straightQuotes = (raw.match(/"/g) || []).length;
  results.curlyQuotePairs = (raw.match(/[“]/g) || []).length;

  /* --- Structured data --- */
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => JSON.parse(s.textContent));
  const page = ld.filter((d) => d["@type"] === "WebPage");
  results.webPageBlocks = page.length;
  results.schemaUrl = page[0]?.url ?? null;
  results.canonical = document.querySelector('link[rel="canonical"]')?.href ?? null;
  results.schemaMatchesCanonical = page[0]?.url === results.canonical;
  results.noArticleSchema = !ld.some((d) => d["@type"] === "Article");

  /* --- The two deliberate omissions --- */
  results.practiceAreaNavInRail = !!document.querySelector(".fl__nav, [data-pa-nav]");
  results.paBootStamped = document.documentElement.hasAttribute("data-pa-boot");
  results.moduleScripts = document.querySelectorAll('script[type="module"]').length;

  /* --- Two forms, unique ids (AGENTS.md's more-than-one-form rule) --- */
  const forms = [...document.querySelectorAll("form")];
  results.forms = forms.length;
  const ids = [...document.querySelectorAll("[id]")].map((n) => n.id);
  results.duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);

  return results;
})();
