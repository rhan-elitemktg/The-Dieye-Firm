/* lead-form — shared behaviour for every enquiry form on the site.
 *
 * There is more than one form on a blog post: Layout renders the site-wide
 * consultation form on every page, and the post sidebar adds a case-evaluation
 * card. This module therefore binds per-form via querySelectorAll — a single
 * document.querySelector would leave whichever form came second dead.
 *
 * Each form scopes its own status element and phone field, so the two never
 * reach into one another.
 *
 * PLACEHOLDER: there is no endpoint yet, so submission is cancelled and
 * confirmed inline rather than posting to a dead URL and losing the enquiry.
 * Give the form an action, drop the preventDefault and drop novalidate to go
 * live.
 */

export function initLeadForms(root: ParentNode = document) {
  for (const form of root.querySelectorAll<HTMLFormElement>("[data-lead-form]")) {
    if (form.dataset.leadFormBound) continue;
    form.dataset.leadFormBound = "true";

    const status = form.parentElement?.querySelector<HTMLElement>("[data-lead-status]") ?? null;
    const phoneInput = form.querySelector<HTMLInputElement>("[data-phone-input]");

    /* The field carries a pattern for (555) 555-5555, so it has to actually
       produce that shape — otherwise anyone typing "5551234567" or
       "555.123.4567" is just told they're wrong. This formats digits as they're
       entered, which means the constraint is met by typing normally rather than
       by guessing the punctuation. */
    if (phoneInput) {
      phoneInput.addEventListener("input", () => {
        const digits = phoneInput.value.replace(/\D/g, "").slice(0, 10);
        if (!digits) {
          phoneInput.value = "";
          return;
        }
        const area = digits.slice(0, 3);
        const prefix = digits.slice(3, 6);
        const line = digits.slice(6);
        phoneInput.value =
          digits.length <= 3
            ? `(${area}`
            : digits.length <= 6
              ? `(${area}) ${prefix}`
              : `(${area}) ${prefix}-${line}`;
      });

      // Backspacing into the punctuation would otherwise re-add it and trap the
      // caret, so an all-punctuation value clears instead.
      phoneInput.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && /^\(\d{0,3}\)?\s?$/.test(phoneInput.value)) {
          phoneInput.value = "";
        }
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      // novalidate suppresses the browser bubble so the message can live
      // inline; the constraints themselves still drive this.
      if (!form.checkValidity()) {
        form.classList.add("is-invalid");
        const firstBad = form.querySelector<HTMLInputElement>(":invalid");
        if (status) {
          status.hidden = false;
          /* Name the actual offending field rather than always blaming email.
             Keyed off input type, not a hardcoded id, so this works for any
             form that adopts the module. */
          status.textContent =
            firstBad?.type === "tel"
              ? "Please enter a 10-digit phone number, or leave it blank."
              : "Please add a valid email address so we can reply.";
        }
        firstBad?.focus();
        return;
      }

      form.classList.remove("is-invalid");
      if (status) {
        status.hidden = false;
        status.textContent = "Thank you. We'll be in touch within one business day.";
      }
      form.reset();
    });

    form.addEventListener("input", () => {
      form.classList.remove("is-invalid");
      if (status) status.hidden = true;
    });
  }
}

