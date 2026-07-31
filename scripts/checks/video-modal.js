/* Regression test for the shared video modal.
 *
 * Both the About section and the reels carousel open the SAME modal, each
 * supplying its own Wistia id and aspect ratio. Before the modal was extracted,
 * the script bound `document.querySelectorAll("[data-video-open]")` and read a
 * single id baked into the modal — so any second video section would have
 * played the About video. This asserts that can't regress.
 *
 *   npm run probe -- scripts/checks/video-modal.js
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

  const results = {};

  // --- modal count: exactly one, rendered from Layout ---
  results.modalsOnPage = document.querySelectorAll("[data-video-modal]").length;

  // --- before any click: zero Wistia requests (click-to-load facade) ---
  results.iframesBeforeAnyClick = document.querySelectorAll("iframe").length;

  // --- 1. About trigger -> 16:9, About's id ---
  const aboutTrigger = document.querySelector(".video-card[data-video-open]");
  aboutTrigger.click();
  await wait(120);
  results.about = { expected: "z79lx3x00o", ...state() };

  // Escape closes, focus returns to the trigger
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  await wait(120);
  results.afterEscape = {
    ...state(),
    focusReturnedToTrigger: document.activeElement === aboutTrigger,
  };

  // --- 2. A reel trigger -> 9:16, that reel's own id ---
  const reels = [...document.querySelectorAll(".reel[data-video-open]")];
  const third = reels[2];
  const expectedId = third.dataset.wistiaId;
  third.click();
  await wait(120);
  results.reel = { expected: expectedId, ...state() };

  // Backdrop click closes
  modal.querySelector(".video-modal__backdrop").click();
  await wait(120);
  results.afterBackdrop = {
    ...state(),
    focusReturnedToTrigger: document.activeElement === third,
  };

  // --- 3. A different reel gets a different id (not a cached first one) ---
  const last = reels[reels.length - 1];
  last.click();
  await wait(120);
  results.lastReel = { expected: last.dataset.wistiaId, ...state() };
  modal.querySelector(".video-modal__close").click();
  await wait(120);
  results.afterCloseButton = state();

  // --- verdicts ---
  const ok = [];
  const fail = [];
  const check = (name, pass) => (pass ? ok : fail).push(name);

  check("one modal on page", results.modalsOnPage === 1);
  check("no iframes before click", results.iframesBeforeAnyClick === 0);
  check("about plays z79lx3x00o", results.about.videoId === "z79lx3x00o");
  check("about is 16:9", Math.abs(parseFloat(results.about.aspect) - 16 / 9) < 0.01);
  check("about labelled", results.about.ariaLabel === "Meet Papa Dieye");
  check("escape closes", !results.afterEscape.open);
  check("escape tears down iframe", results.afterEscape.iframeCount === 0);
  check("escape unlocks scroll", !results.afterEscape.scrollLocked);
  check("escape restores focus", results.afterEscape.focusReturnedToTrigger);
  check("reel plays its own id", results.reel.videoId === results.reel.expected);
  check("reel is NOT the about video", results.reel.videoId !== "z79lx3x00o");
  check("reel is 9:16", Math.abs(parseFloat(results.reel.aspect) - 9 / 16) < 0.01);
  check("backdrop closes", !results.afterBackdrop.open);
  check("backdrop restores focus", results.afterBackdrop.focusReturnedToTrigger);
  check("last reel plays its own id", results.lastReel.videoId === results.lastReel.expected);
  check("close button closes", !results.afterCloseButton.open);
  check("close tears down iframe", results.afterCloseButton.iframeCount === 0);

  return { passed: ok.length, failed: fail.length, failures: fail, detail: results };
})();
