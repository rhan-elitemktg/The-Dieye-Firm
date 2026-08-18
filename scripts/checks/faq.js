/* Regression test for /faq/'s accordion.
 *
 * The nine answers are the CLIENT's own published prose and are the reason
 * this page exists, so the check asserts the text is really there and really
 * reachable — not just that nine <details> elements rendered. The two things
 * most likely to regress silently:
 *
 *   1. The FAQPage JSON-LD is generated from the same array as the markup.
 *      If someone ever hand-edits one, the two drift and Google is served a
 *      different answer than the visitor. Compared question-by-question here.
 *   2. <details name="faq"> makes the group EXCLUSIVE. Opening one closes the
 *      rest, which is the behaviour, but it also means a broken `name` would
 *      let all nine sit open at once and look merely "roomy" rather than
 *      wrong.
 *
 * Also guards the two things this page does differently from the homepage,
 * which renders the same component: the section head is suppressed (the page
 * header above it is already a kicker and an h1), and the section therefore
 * has to be labelled some other way or it becomes an unnamed region.
 *
 *   npm run probe -- scripts/checks/faq.js --url http://localhost:PORT/faq/
 */
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const section = document.querySelector("section.faq");
  if (!section) return { error: "no .faq section on the page" };

  const items = [...section.querySelectorAll("details.faq__item")];
  const q = (d) => d.querySelector("summary.faq__q span").textContent.trim();
  const a = (d) => d.querySelector(".faq__a p").textContent.trim();

  const results = { count: items.length };

  /* --- Page shape: one h1, and the component's own head suppressed --- */
  results.h1Count = document.querySelectorAll("h1").length;
  results.h1 = document.querySelector("h1")?.textContent.trim() ?? null;
  results.sectionHeadRendered = !!section.querySelector(".faq__head");
  results.flushModifier = section.classList.contains("faq--flush");
  results.sectionLabel =
    section.getAttribute("aria-label") ||
    document.getElementById(section.getAttribute("aria-labelledby") || "")?.textContent.trim() ||
    null;

  /* --- Markup vs structured data --- */
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map((s) => JSON.parse(s.textContent))
    .filter((d) => d["@type"] === "FAQPage");
  results.faqPageBlocks = ld.length;
  const entities = ld[0]?.mainEntity ?? [];
  results.schemaCount = entities.length;
  results.schemaMatchesMarkup = items.every((d, i) => {
    const e = entities[i];
    return e && e.name === q(d) && e.acceptedAnswer.text === a(d);
  });

  /* --- The prose is the point: nothing empty, nothing truncated --- */
  results.shortestAnswerWords = Math.min(...items.map((d) => a(d).split(/\s+/).length));
  results.emptyAnswers = items.filter((d) => !a(d)).length;
  /* The one answer we edited. Its live version opened on a dangling reference
     to "factors mentioned above" that appear nowhere on the page. */
  results.danglingReference = /factors mentioned above/i.test(document.body.textContent);

  /* --- Exclusivity, and that every panel can actually be reached --- */
  results.openOnLoad = items.filter((d) => d.open).length;
  results.namedGroup = items.every((d) => d.getAttribute("name") === "faq");

  /* Item 1 renders open, so clicking its summary would CLOSE it and the loop
     would report a failure that is the test's, not the page's. Collapse the
     group first so every click below is unambiguously an open. */
  items.forEach((d) => (d.open = false));
  await wait(40);

  results.reachable = [];
  for (const d of items) {
    d.querySelector("summary").click();
    await wait(40);
    results.reachable.push({
      open: d.open,
      othersOpen: items.filter((o) => o !== d && o.open).length,
      /* Exclusivity is a rendering behaviour, so measure the panel rather than
         trusting the attribute: a collapsed answer has no height. */
      answerVisible: d.querySelector(".faq__a").getBoundingClientRect().height > 0,
    });
  }

  /* --- The ask card is the page's only conversion path above Contact --- */
  const ask = section.querySelector(".faq__ask a");
  results.askHref = ask?.getAttribute("href") ?? null;

  const ok = [];
  const fail = [];
  const check = (name, pass) => (pass ? ok : fail).push(name);

  check("nine questions", results.count === 9);
  check("exactly one h1", results.h1Count === 1);
  check("section head suppressed", results.sectionHeadRendered === false);
  check("flush modifier applied", results.flushModifier === true);
  check("section is still labelled", !!results.sectionLabel);
  check("one FAQPage block", results.faqPageBlocks === 1);
  check("schema has nine entities", results.schemaCount === 9);
  check("schema matches markup verbatim", results.schemaMatchesMarkup === true);
  check("no empty answers", results.emptyAnswers === 0);
  check("client prose intact, not truncated", results.shortestAnswerWords >= 60);
  check("no dangling 'factors mentioned above'", results.danglingReference === false);
  check("one panel open on load", results.openOnLoad === 1);
  check("all nine share the exclusive group", results.namedGroup === true);
  check("ask card points at contact", results.askHref === "/contact-us/");

  results.reachable.forEach((r, i) => {
    check(`answer ${i + 1} opens`, r.open === true);
    check(`answer ${i + 1} is visible when open`, r.answerVisible === true);
    check(`answer ${i + 1} closes the other eight`, r.othersOpen === 0);
  });

  return { passed: ok.length, failed: fail.length, failures: fail, results };
})();
