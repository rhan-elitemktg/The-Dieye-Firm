/* Behaviour check for the two enquiry forms on a blog post.
 *
 * A blog post is the first page with more than one form: Layout renders the
 * site-wide consultation form, and the post sidebar adds a case-evaluation
 * card. The failure this guards against is subtle — the original script bound
 * with a single document.querySelector, so whichever form came second would
 * have been dead: submitting it would navigate and silently lose the enquiry.
 *
 * Also checks that duplicated ids haven't broken <label for> anywhere on the
 * page, since that would quietly detach every label in the document.
 *
 *   npm run probe -- scripts/checks/blog-forms.js \
 *     --url http://localhost:4321/blog/preparing-emotionally-for-mediation/
 */
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const forms = [...document.querySelectorAll("[data-lead-form]")];
  if (forms.length < 2) return { error: `expected 2 lead forms, found ${forms.length}` };

  const urlBefore = location.href;
  const results = { formCount: forms.length, forms: [] };

  // --- ids are unique across the whole document ---
  const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);

  // --- every label points at something that exists ---
  const orphanLabels = [...document.querySelectorAll("label[for]")]
    .filter((l) => !document.getElementById(l.htmlFor))
    .map((l) => l.htmlFor);

  for (const form of forms) {
    const status = form.parentElement.querySelector("[data-lead-status]");
    const email = form.querySelector('input[type="email"]');
    const phone = form.querySelector("[data-phone-input]");
    const entry = { id: form.closest("[class]")?.className ?? "?" };

    entry.hasStatus = !!status;
    entry.hasEmail = !!email;

    // 1. invalid submit must not navigate, and must surface an inline message
    if (email) {
      email.value = "not-an-email";
      email.dispatchEvent(new Event("input", { bubbles: true }));
    }
    form.requestSubmit();
    await wait(60);
    entry.badSubmit = {
      navigated: location.href !== urlBefore,
      invalidClass: form.classList.contains("is-invalid"),
      statusShown: status ? !status.hidden : false,
      statusText: status ? status.textContent.trim() : "",
    };

    // 2. phone masking is live on this specific form
    if (phone) {
      phone.value = "5551234567";
      phone.dispatchEvent(new Event("input", { bubbles: true }));
      await wait(30);
      entry.phoneMasked = phone.value;
    }

    // 3. valid submit confirms inline and clears, still without navigating
    if (email) {
      email.value = "someone@example.com";
      email.dispatchEvent(new Event("input", { bubbles: true }));
    }
    form.requestSubmit();
    await wait(60);
    entry.goodSubmit = {
      navigated: location.href !== urlBefore,
      statusText: status ? status.textContent.trim() : "",
      emailCleared: email ? email.value === "" : null,
    };

    results.forms.push(entry);
  }

  const ok = [];
  const fail = [];
  const check = (name, pass) => (pass ? ok : fail).push(name);

  check("exactly two lead forms on the page", results.formCount === 2);
  check("no duplicate element ids", dupes.length === 0);
  check("no orphaned label[for]", orphanLabels.length === 0);

  results.forms.forEach((f, i) => {
    const n = `form ${i + 1}`;
    check(`${n} has its own status region`, f.hasStatus);
    check(`${n} bad submit does not navigate`, !f.badSubmit.navigated);
    check(`${n} bad submit marks invalid`, f.badSubmit.invalidClass);
    check(`${n} bad submit shows an inline error`, f.badSubmit.statusShown);
    check(`${n} phone mask applied`, f.phoneMasked === "(555) 123-4567");
    check(`${n} valid submit does not navigate`, !f.goodSubmit.navigated);
    check(`${n} valid submit confirms`, /be in touch/i.test(f.goodSubmit.statusText));
    check(`${n} valid submit clears email`, f.goodSubmit.emailCleared === true);
  });

  return {
    passed: ok.length,
    failed: fail.length,
    failures: fail,
    duplicateIds: dupes,
    orphanLabels,
    detail: results,
  };
})();
