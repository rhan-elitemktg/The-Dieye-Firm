/* Block until the PUBLIC read path reflects a write.
 *
 * ── The trap this exists for ─────────────────────────────────────────────────
 *
 * There are two read paths into the dataset and they do not see the same thing.
 * `npx sanity exec` and the CLI read AUTHENTICATED; `npm run build` reads
 * ANONYMOUSLY, because the site ships no token. A document can be perfectly
 * healthy on the first and completely absent from the second — and nothing
 * anywhere reports an error.
 *
 * That is not hypothetical. The first run of the testimonial import used
 * document ids like `testimonial.01-kim`. A dot makes an id a PATH, and Sanity's
 * public read grant covers root-level ids only — it is the same mechanism that
 * keeps `drafts.foo` out of anonymous reads. So all fourteen documents were
 * written successfully, were visible in the Studio, were returned by `sanity
 * documents query`, and were invisible to the build. Every diagnostic pointed at
 * the write having worked, because it had.
 *
 * A dotted id is only the sharpest example. Anything that changes what an
 * unauthenticated reader sees — a dataset flipped private, a grant edited, a
 * document left as a draft — fails the same silent way.
 *
 * So every import script ends here, and does not report success until the site
 * can actually see what it wrote. Checking through the anonymous endpoint is the
 * whole point; authenticating would defeat it.
 */

const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.PUBLIC_SANITY_DATASET ?? "production";

/**
 * Poll the unauthenticated query endpoint until `query` returns `expected`.
 *
 * @param query     GROQ returning a comparable value — usually a count()
 * @param expected  the value to wait for
 * @param label     shown in progress output
 */
export async function waitForPublic(
  query: string,
  expected: number,
  label: string,
  { timeoutMs = 90_000, intervalMs = 3_000 } = {},
): Promise<void> {
  if (!PROJECT_ID) {
    console.warn("⚠ PUBLIC_SANITY_PROJECT_ID not set — skipping the public-read check.");
    return;
  }

  /* No token, deliberately: this has to be the same view the static build gets,
     so authenticating here would defeat the entire point of the check. */
  const url = `https://${PROJECT_ID}.api.sanity.io/v2025-08-15/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const started = Date.now();
  let last: unknown = null;
  let announced = false;

  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);
      const body = (await res.json()) as { result?: unknown; error?: unknown };
      if (body.error) throw new Error(JSON.stringify(body.error));
      last = body.result;
      if (last === expected) {
        if (announced) console.log(`   …${label} visible publicly after ${Math.round((Date.now() - started) / 1000)}s`);
        return;
      }
    } catch (err) {
      /* A transient failure shouldn't end the wait. */
      last = `error: ${(err as Error).message}`;
    }
    if (!announced) {
      console.log(`   waiting for the public read path to show ${label} (currently ${last})…`);
      announced = true;
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    `${label} never appeared on the public read path (last saw ${last}, wanted ${expected}).\n\n` +
      `The write itself succeeded — that is what makes this confusing. The documents are in the dataset\n` +
      `and the Studio will show them; the site cannot see them.\n\n` +
      `First thing to check: DOTS IN DOCUMENT IDS. A '.' makes an id a path, and only root-level ids are\n` +
      `publicly readable. Then: is the dataset still public, and were these written as drafts?`,
  );
}
