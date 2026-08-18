/* Regression test for /video-center/'s nine tiles against the shared modal.
 *
 * The sibling check, video-modal.js, is bound to the HOMEPAGE's selectors
 * (.video-card and .reel) and can't reach this page. The thing worth guarding
 * here is the same one: every tile must open ITS OWN video at ITS OWN aspect,
 * and nothing may load from Wistia before a click. Six of these nine are 9:16
 * shorts sitting in 16:9 cards, so the card's shape and the video's shape
 * disagree on purpose — a regression that used the card's ratio would letterbox
 * every short in the modal and look plausible.
 *
 *   npm run probe -- scripts/checks/video-center.js --url http://localhost:PORT/video-center/
 */
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const modal = document.querySelector("[data-video-modal]");
  const dialog = modal?.querySelector("[data-video-dialog]");
  if (!modal || !dialog) return { error: "no modal found" };

  const state = () => {
    const iframe = modal.querySelector("iframe");
    const src = iframe?.getAttribute("src") ?? null;
    return {
      open: !modal.hidden,
      videoId: src ? (src.match(/iframe\/([^?]+)/) || [])[1] : null,
      aspect: getComputedStyle(modal).getPropertyValue("--video-ar").trim() || null,
      ariaLabel: dialog.getAttribute("aria-label"),
      scrollLocked: document.documentElement.style.overflow === "hidden",
      iframeCount: modal.querySelectorAll("iframe").length,
    };
  };

  const tiles = [...document.querySelectorAll(".vc-tile[data-video-open]")];
  const results = { tileCount: tiles.length };

  results.modalsOnPage = document.querySelectorAll("[data-video-modal]").length;
  /* The facade assertion, stated as "no WISTIA iframe" rather than the sibling
     check's "no iframes at all". This page renders the sitewide Contact
     section, whose Google map is a bare iframe — the one embed that predates
     the click-to-load rule, tracked in HANDOFF. Counting it here is what keeps
     the two facts apart: the map is a known holdout, and a Wistia frame
     appearing before a click would be a new regression. (The homepage check
     still asserts the stricter form and fails on the same map; that failure is
     pre-existing and not this page's to fix.) */
  results.wistiaIframesBeforeAnyClick =
    [...document.querySelectorAll("iframe")].filter((f) =>
      (f.getAttribute("src") || "").includes("wistia")).length;
  results.mapIframes =
    [...document.querySelectorAll("iframe")].filter((f) =>
      (f.getAttribute("src") || "").includes("maps.google")).length;

  // Every tile, in order: open it, record what the modal actually did, close it.
  results.opened = [];
  for (const tile of tiles) {
    tile.click();
    await wait(120);
    const s = state();
    results.opened.push({
      expectedId: tile.dataset.wistiaId,
      expectedAspect: tile.dataset.videoAspect,
      expectedTitle: tile.dataset.videoTitle,
      ...s,
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await wait(120);
  }

  results.afterLastEscape = {
    ...state(),
    focusReturnedToTrigger: document.activeElement === tiles[tiles.length - 1],
  };

  // Backdrop and close button close too, on a tile that isn't the first.
  const third = tiles[2];
  third.click();
  await wait(120);
  modal.querySelector(".video-modal__backdrop").click();
  await wait(120);
  results.afterBackdrop = { ...state(), focusReturnedToTrigger: document.activeElement === third };

  const last = tiles[tiles.length - 1];
  last.click();
  await wait(120);
  modal.querySelector(".video-modal__close").click();
  await wait(120);
  results.afterCloseButton = state();

  // --- verdicts ---
  const ok = [];
  const fail = [];
  const check = (name, pass) => (pass ? ok : fail).push(name);
  const ratio = (v) => { const [w, h] = v.split("/").map(Number); return w / h; };

  check("nine tiles", results.tileCount === 9);
  check("one modal on page", results.modalsOnPage === 1);
  check("no wistia iframe before click", results.wistiaIframesBeforeAnyClick === 0);
  check("the only pre-click iframe is the known map", results.mapIframes === 1);
  check("all nine ids unique", new Set(results.opened.map((o) => o.expectedId)).size === 9);
  check("six shorts declared 9/16",
    results.opened.filter((o) => o.expectedAspect === "9/16").length === 6);
  check("three studio declared 16/9",
    results.opened.filter((o) => o.expectedAspect === "16/9").length === 3);

  results.opened.forEach((o, i) => {
    check(`tile ${i + 1} plays its own id`, o.videoId === o.expectedId);
    check(`tile ${i + 1} aspect reaches modal`,
      Math.abs(parseFloat(o.aspect) - ratio(o.expectedAspect)) < 0.01);
    check(`tile ${i + 1} labels the dialog`, o.ariaLabel === o.expectedTitle);
    check(`tile ${i + 1} locks scroll`, o.scrollLocked === true);
    check(`tile ${i + 1} has exactly one iframe`, o.iframeCount === 1);
  });

  check("escape closes", !results.afterLastEscape.open);
  check("escape tears down iframe", results.afterLastEscape.iframeCount === 0);
  check("escape unlocks scroll", !results.afterLastEscape.scrollLocked);
  check("escape restores focus", results.afterLastEscape.focusReturnedToTrigger);
  check("backdrop closes", !results.afterBackdrop.open);
  check("backdrop restores focus", results.afterBackdrop.focusReturnedToTrigger);
  check("close button closes", !results.afterCloseButton.open);
  check("close tears down iframe", results.afterCloseButton.iframeCount === 0);

  return { passed: ok.length, failed: fail.length, failures: fail };
})();
