import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

/* The consultation section's copy.
 *
 * Read by Contact.astro, which Layout renders on 93 of 95 pages — so this is
 * the single most-fetched document on the site and the PROD promise cache
 * matters more here than anywhere else. Skipping the cache in dev is what lets
 * a Studio edit show on refresh.
 */

const CONSULT_FORM_QUERY = defineQuery(`
  *[_id == "consultForm"][0]{
    header{ eyebrow, headingLead, headingAccent, leadLines },
    form{ cardTitle, cardIntro, submitLabel, privacyNote }
  }
`);

export type ConsultForm = {
  header: {
    eyebrow: string;
    headingLead: string;
    headingAccent?: string;
    leadLines: string[];
  };
  form: {
    cardTitle: string;
    cardIntro: string;
    submitLabel: string;
    privacyNote: string;
  };
};

let cache: Promise<ConsultForm> | undefined;

async function fetchConsultForm(): Promise<ConsultForm> {
  const doc = (await sanityClient.fetch(CONSULT_FORM_QUERY)) as ConsultForm | null;
  /* Fail loudly. This renders on nearly every page, so a missing document would
     otherwise ship 93 pages closing with an unlabelled form. */
  if (!doc?.form?.submitLabel) {
    throw new Error(
      "The consultForm document is missing or incomplete. Import it with:\n" +
        "  npx sanity exec scripts/import/consult-form.ts --with-user-token",
    );
  }
  return doc;
}

export function getConsultForm(): Promise<ConsultForm> {
  if (!import.meta.env.PROD) return fetchConsultForm();
  cache ??= fetchConsultForm();
  return cache;
}
