import { sanityClient } from "sanity:client";
import { defineQuery } from "groq";

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
  *[_type == "attorney"] | order(name asc)[0]{
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
  photo?: { asset?: { _ref?: string }; alt?: string; dimensions?: { aspectRatio: number } };
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
  /* Takes the first attorney by name, which is total while there is one. A
     second hire makes "whose byline is this" a real question rather than a
     default — at which point the article byline should reference an attorney
     rather than assume one, and this helper should stop existing. */
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
