/* Behaviour check for the Blog index filter and paging.
 *
 * The grid holds every post at once and filtering is a visibility pass, so
 * the failures worth guarding are all state ones: a stale Load More, a
 * featured post that gets swept up by a filter it sits outside of, or a
 * pre-filtered arrival that paints the full archive first.
 *
 *   npm run probe -- scripts/checks/blog-index.js --url http://localhost:4321/blog/
 *   npm run probe -- scripts/checks/blog-index.js --url "http://localhost:4321/blog/?category=divorce"
 *
 * NOT covered here: the scroll-to-chips on a filtered arrival. `probe` calls
 * browser.settle(), whose lazy-iframe sweep ends in window.scrollTo(0, 0) —
 * and this page has an iframe (the video modal), so any scroll the page set
 * for itself is wiped before this file ever runs. It reads as a dead feature
 * and is not one. To check that behaviour, drive launch() directly and skip
 * settle().
 */
(async () => {
  const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const q = (s) => document.querySelector(s);
  const all = (s) => [...document.querySelectorAll(s)];

  const grid = q("[data-blog-grid]");
  const more = q("[data-blog-more]");
  const chips = all("[data-blog-chips] [data-cat]");
  if (!grid || !more || !chips.length) return { error: "blog index controls not found" };

  const items = all(".pg__item");
  const shown = () => items.filter((el) => !el.classList.contains("is-hidden"));
  const visible = (el) => !!el && el.getBoundingClientRect().height > 0;
  const moreVisible = () => visible(more) && getComputedStyle(more).display !== "none";

  const results = { total: items.length, chips: chips.map((c) => c.dataset.cat || "all") };

  // --- boot handoff: the pre-paint rules must be inert once the module runs ---
  results.bootAttrCleared = !document.documentElement.hasAttribute("data-blog-boot");
  results.moreReady = more.hasAttribute("data-blog-ready");

  // --- initial state ---
  // The batch size comes from the markup, not from what happens to be on
  // screen: arriving at ?category=<slug> shows the filtered count instead, and
  // reading that as the batch size makes every later comparison wrong.
  results.batch = items.filter((el) => el.dataset.rest === undefined).length;
  results.arrivedFiltered = !!new URLSearchParams(location.search).get("category");
  results.initialShown = shown().length;
  results.initialMoreVisible = moreVisible();

  // --- the featured post is outside the filter ---
  const featured = q(".fp__panel");
  const featuredTitle = q(".fp__title")?.textContent?.trim();
  results.featuredPresent = visible(featured);
  // and must never be duplicated into the grid below it
  results.featuredInGrid = items.some(
    (el) => el.querySelector(".pc__name")?.textContent?.trim() === featuredTitle,
  );

  // --- filter by each category ---
  results.perCategory = [];
  for (const chip of chips.filter((c) => c.dataset.cat)) {
    // Clicking the chip that is already selected is a deliberate no-op, so it
    // must not re-animate. Only true on a pre-filtered arrival, where the
    // first chip this loop reaches is the one already applied.
    const wasActive = chip.hasAttribute("aria-current");
    chip.click();
    await frame();
    await frame();

    const slug = chip.dataset.cat;
    const on = shown();
    const expected = items.filter((el) => (el.dataset.cats || "").split(" ").includes(slug));

    results.perCategory.push({
      slug,
      shown: on.length,
      matching: expected.length,
      // every visible card actually belongs to the selected category
      allMatch: on.every((el) => (el.dataset.cats || "").split(" ").includes(slug)),
      // nothing that matched got left out (no category exceeds the initial batch)
      noneMissed: on.length === Math.min(expected.length, results.batch),
      moreVisible: moreVisible(),
      chipMarked: chip.getAttribute("aria-current") === "true",
      soleMarkedChip: chips.filter((c) => c.hasAttribute("aria-current")).length === 1,
      urlHasParam: new URLSearchParams(location.search).get("category") === slug,
      featuredStillThere: visible(featured),
      wasActive,
      // the entry animation ran on the newly filtered set
      animated:
        wasActive || (on.length > 0 && on.every((el) => el.classList.contains("is-entering"))),
    });
  }

  // --- back to All, then page through ---
  chips[0].click();
  await frame();
  await frame();
  results.allShown = shown().length;
  results.allMoreVisible = moreVisible();

  let clicks = 0;
  while (moreVisible() && clicks < 10) {
    more.click();
    await frame();
    await frame();
    clicks++;
  }
  results.loadMoreClicks = clicks;
  results.shownAfterLoadAll = shown().length;
  results.moreHiddenAtEnd = !moreVisible();

  // --- the pre-paint rules, tested on their own ---
  // FilterBoot's generated CSS is what stops a pre-filtered arrival painting
  // the whole archive first. The module removes its key attribute on boot, so
  // the only way to see those rules work is to put the page back into the
  // state they were written for: attribute on, module classes off.
  const root = document.documentElement;
  items.forEach((el) => el.classList.remove("is-hidden", "is-entering"));
  root.setAttribute("data-blog-boot", "");

  const hiddenByCss = () =>
    items.filter((el) => getComputedStyle(el).display === "none").length;

  root.removeAttribute("data-blog-cat");
  results.bootCapsUnfiltered = items.length - hiddenByCss() === results.batch;

  results.bootFilters = [];
  for (const chip of chips.filter((c) => c.dataset.cat)) {
    const slug = chip.dataset.cat;
    root.setAttribute("data-blog-cat", slug);
    const on = items.filter((el) => getComputedStyle(el).display !== "none");
    results.bootFilters.push({
      slug,
      shown: on.length,
      correct:
        on.length ===
          items.filter((el) => (el.dataset.cats || "").split(" ").includes(slug)).length &&
        on.every((el) => (el.dataset.cats || "").split(" ").includes(slug)),
    });
  }
  root.removeAttribute("data-blog-boot");
  root.removeAttribute("data-blog-cat");

  // --- report ---
  const ok = [];
  const fail = [];
  const check = (name, cond) => (cond ? ok : fail).push(name);

  check("boot attribute handed off to the module", results.bootAttrCleared);
  check("load more is script-gated", results.moreReady);
  check("featured post renders", results.featuredPresent);
  check("featured post is not repeated in the grid", !results.featuredInGrid);
  check("initial batch is capped", results.batch < results.total);
  // Only meaningful on an unfiltered arrival: every category fits in one
  // batch, so landing pre-filtered correctly shows no Load More at all.
  check(
    "load more offered when posts remain",
    results.arrivedFiltered || results.initialMoreVisible,
  );

  results.perCategory.forEach((c) => {
    check(`${c.slug}: only matching posts shown`, c.allMatch);
    check(`${c.slug}: no matching post withheld`, c.noneMissed);
    check(`${c.slug}: featured post still shown`, c.featuredStillThere);
    check(`${c.slug}: load more hidden with nothing left`, c.moreVisible === false);
    check(`${c.slug}: chip marked current`, c.chipMarked);
    check(`${c.slug}: exactly one chip current`, c.soleMarkedChip);
    check(`${c.slug}: url carries the filter`, c.urlHasParam);
    check(`${c.slug}: cards animate in`, c.animated);
  });

  check("pre-paint css caps the unfiltered grid", results.bootCapsUnfiltered);
  results.bootFilters.forEach((b) => {
    check(`${b.slug}: pre-paint css filters without js`, b.correct);
  });

  check("all posts restores the full set", results.allShown === results.batch);
  check("paging reveals every post", results.shownAfterLoadAll === results.total);
  check("load more disappears at the end", results.moreHiddenAtEnd);

  return { passed: ok.length, failed: fail.length, failures: fail, detail: results };
})();
