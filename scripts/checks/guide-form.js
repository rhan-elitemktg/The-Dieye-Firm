/* Behaviour check for the guide-request email capture.
 *
 * The endpoint is not wired yet, so the one thing that must never regress is
 * that submitting does NOT navigate away and lose the address. Also covers
 * validation, the inline status message, and the reset-on-retype.
 *
 *   npm run probe -- scripts/checks/guide-form.js
 */
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const form = document.querySelector("[data-guide-form]");
  const status = document.querySelector("[data-guide-status]");
  const input = document.querySelector("#guide-email");
  if (!form || !status || !input) return { error: "guide form not found" };

  const urlBefore = location.href;
  const state = () => ({
    statusShown: !status.hidden,
    statusText: status.textContent.trim(),
    invalidClass: form.classList.contains("is-invalid"),
    value: input.value,
    navigated: location.href !== urlBefore,
  });

  const results = {};

  // --- markup contract ---
  results.markup = {
    inputType: input.type,
    required: input.required,
    autocomplete: input.getAttribute("autocomplete"),
    hasLabel: !!document.querySelector('label[for="guide-email"]'),
    describedBy: input.getAttribute("aria-describedby"),
    statusLive: status.getAttribute("aria-live"),
    // No action yet — but the submit must be cancelled, never left to post.
    action: form.getAttribute("action"),
  };

  // --- 1. empty submit is rejected, does not navigate ---
  input.value = "";
  form.requestSubmit();
  await wait(60);
  results.emptySubmit = state();

  // --- 2. malformed address is rejected ---
  input.value = "not-an-email";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  form.requestSubmit();
  await wait(60);
  results.badSubmit = state();

  // --- 3. typing clears the error ---
  input.value = "someone@example.com";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await wait(60);
  results.afterRetype = state();

  // --- 4. valid submit confirms and clears the field ---
  form.requestSubmit();
  await wait(60);
  results.goodSubmit = state();

  const ok = [];
  const fail = [];
  const check = (name, pass) => (pass ? ok : fail).push(name);

  check("input is type=email", results.markup.inputType === "email");
  check("input is required", results.markup.required);
  check("has autocomplete=email", results.markup.autocomplete === "email");
  check("has a real label", results.markup.hasLabel);
  check("status is a live region", results.markup.statusLive === "polite");
  check("empty submit does not navigate", !results.emptySubmit.navigated);
  check("empty submit shows an error", results.emptySubmit.statusShown);
  check("empty submit marks invalid", results.emptySubmit.invalidClass);
  check("bad address does not navigate", !results.badSubmit.navigated);
  check("bad address marks invalid", results.badSubmit.invalidClass);
  check("bad address keeps the value", results.badSubmit.value === "not-an-email");
  check("retyping clears the error", !results.afterRetype.invalidClass);
  check("retyping hides the status", !results.afterRetype.statusShown);
  check("valid submit does not navigate", !results.goodSubmit.navigated);
  check("valid submit confirms", /on the way/i.test(results.goodSubmit.statusText));
  check("valid submit clears the field", results.goodSubmit.value === "");

  return { passed: ok.length, failed: fail.length, failures: fail, detail: results };
})();
