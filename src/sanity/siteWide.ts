import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";
import type { SanityImage } from "./image";

/* Records that belong to the site rather than to any page.
 *
 * Both of these render on most of the site — the sidebar enquiry card on 85
 * pages, the attorney on those same 85 plus the marketing bands — so both are
 * promise-cached in PROD, and both skip the cache in dev so a Studio edit shows
 * on refresh.
 *
 * They share a file because they share a lifecycle: neither is a page, neither
 * is a collection anyone browses, and a caller usually wants one line from each.
 */

const SITE_WIDE_CASE_EVALUATION_QUERY = defineQuery(`
  *[_id == "caseEvaluationForm"][0]{ heading, intro, submitLabel, privacyNote }
`);

const SITE_WIDE_ATTORNEY_QUERY = defineQuery(`
  *[_id == "attorney"][0]{
    name,
    role,
    photo{ asset, alt, "dimensions": asset->metadata.dimensions },
    rating{ score, caption }
  }
`);

export type CaseEvaluationForm = {
  heading: string;
  intro: string;
  submitLabel: string;
  privacyNote: string;
};

export type Attorney = {
  name: string;
  role: string;
  /* Optional so a dataset without a photo still builds: every consumer falls
     back to the headshot in src/assets. The field is wired in all three of
     them — AuthorCard, MeetPapa and GuideRequest — so uploading one in the
     Studio changes the site. It did not always, which is the whole reason this
     comment exists. */
  photo?: SanityImage;
  rating?: { score?: string; caption?: string };
};

let caseCache: Promise<CaseEvaluationForm> | undefined;
let attorneyCache: Promise<Attorney> | undefined;

async function fetchCaseEvaluation(): Promise<CaseEvaluationForm> {
  const doc = (await sanityClient.fetch(SITE_WIDE_CASE_EVALUATION_QUERY)) as CaseEvaluationForm | null;
  if (!doc?.heading) {
    throw new Error(
      "The caseEvaluationForm document is missing. Import it with:\n" +
        "  npx sanity exec scripts/import/site-wide.ts --with-user-token",
    );
  }
  return doc;
}

export function getCaseEvaluationForm(): Promise<CaseEvaluationForm> {
  if (!import.meta.env.PROD) return fetchCaseEvaluation();
  caseCache ??= fetchCaseEvaluation();
  return caseCache;
}

async function fetchAttorney(): Promise<Attorney> {
  const doc = (await sanityClient.fetch(SITE_WIDE_ATTORNEY_QUERY)) as Attorney | null;
  if (!doc?.name) {
    throw new Error(
      "No attorney document in Sanity. Import it with:\n" +
        "  npx sanity exec scripts/import/site-wide.ts --with-user-token",
    );
  }
  return doc;
}

export function getAttorney(): Promise<Attorney> {
  if (!import.meta.env.PROD) return fetchAttorney();
  attorneyCache ??= fetchAttorney();
  return attorneyCache;
}
