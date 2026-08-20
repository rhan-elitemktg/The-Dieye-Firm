/* dist/bulk-redirects.json — the redirect table Vercel loads at the edge.
 *
 * ═══ Why this file exists at all ═══
 *
 * The site is a static build, so a redirect can only be applied by Vercel's
 * edge — and `vercel.json` is read BEFORE the build runs, so nothing generated
 * during a build can land in it. Bulk redirects are the one exception:
 * `bulkRedirectsPath` points at a file the build writes ("the redirect files
 * can be generated at build time as long as they end up in the location
 * specified" — Vercel's vercel.json reference). That is what lets an editor add
 * a 301 without a developer.
 *
 * ⚠️ NEVER SET `bulkRedirectsPath` AGAINST AN EMPTY REDIRECT LIST.
 *
 * Vercel treats an empty bulk redirects file as a FATAL DEPLOY ERROR — not a
 * warning, and not a build error either: the build completes, 95 pages and all,
 * and then "Deploying outputs…" fails with
 *
 *     No redirects found in the provided files: bulk-redirects.json
 *
 * That broke production once, on 2026-08-20, because the key was set while
 * there were still no `redirect` documents. It is set again now that there is
 * one. If the collection is ever emptied back to zero, take the key OUT of
 * vercel.json in the same change — it cannot be automated, because vercel.json
 * is read BEFORE the build.
 *
 * Two things bulk redirects cannot do — wildcards and header matching — which
 * is why `vercel.json` keeps its own `redirects` block for those. There are no
 * wildcard rules on this site today, but the seam is where it belongs.
 *
 * ⚠️ NO LEADING UNDERSCORE in the filename. Astro excludes `src/pages/_*` from
 * routing, and the file would silently never be built.
 */
import type { APIRoute } from "astro";
import { normalizePath } from "../lib/routePaths";
import { getRedirects } from "../sanity/redirects";
import { getLivePaths } from "../sanity/routes";

/** https://vercel.com/docs/redirects/bulk-redirects — the fields we set. */
interface BulkRedirect {
  source: string;
  destination: string;
  statusCode: 301 | 302;
  preserveQueryParams: boolean;
}

export const GET: APIRoute = async () => {
  const [redirects, livePaths] = await Promise.all([
    getRedirects(),
    getLivePaths(),
  ]);

  const out: BulkRedirect[] = [];
  const claimed = new Set<string>();
  const skipped: string[] = [];

  for (const rule of redirects) {
    const rawSource = rule.source?.trim();
    const rawDestination = rule.destination?.trim();
    if (!rawSource || !rawDestination) continue;

    const source = normalizePath(rawSource);
    /* Destinations may be external, and an external URL must not be lowercased
       or slash-rewritten — only internal paths are normalized.

       An internal destination gets the site's TRAILING SLASH back. Every URL
       this site serves ends in one, so landing a visitor on "/faq" would cost
       a second hop to reach "/faq/" — a redirect that redirects, which is
       exactly what the chain warning exists to prevent. */
    const external = /^https?:\/\//i.test(rawDestination);
    const bare = external ? rawDestination : normalizePath(rawDestination);
    const destination = external || bare === "/" ? bare : `${bare}/`;

    /* ═══ The guard that matters ═══
       Bulk redirects are evaluated BEFORE the filesystem, so a source pointing
       at a live page would take that page off the site entirely. The Studio
       warns about this; here it is enforced, because a warning can be
       published past. */
    if (livePaths.has(source)) {
      skipped.push(`${source} → ${destination} (a page already lives at ${source})`);
      continue;
    }
    if (!external && source === bare) {
      skipped.push(`${source} → ${destination} (points at itself)`);
      continue;
    }
    /* Belt and braces: the Studio blocks duplicate sources, but two drafts
       published out of order could still race one through. */
    if (claimed.has(source)) {
      skipped.push(`${source} → ${destination} (another redirect already claims ${source})`);
      continue;
    }
    claimed.add(source);

    const statusCode: 301 | 302 = rule.permanent === false ? 302 : 301;

    /* BOTH slash forms. Bulk redirects are processed before any other route in
       the deployment — including trailing-slash normalization — and they match
       the path exactly, so "/old-page/" would otherwise miss. The legacy
       Scorpion URLs this site inherited are a mix of both forms, and
       vercel.json's own 46 hand-written rules are already 23 such pairs for
       exactly this reason. */
    out.push({ source, destination, statusCode, preserveQueryParams: true });
    out.push({ source: `${source}/`, destination, statusCode, preserveQueryParams: true });
  }

  /* Surfaces in the Vercel build log. An editor never sees this, which is why
     the Studio carries its own warning — but it is what a developer needs when
     someone asks why their redirect "didn't work". Never drop a rule silently. */
  if (skipped.length) {
    console.warn(
      `[bulk-redirects] skipped ${skipped.length} redirect(s):\n  ${skipped.join("\n  ")}`,
    );
  }
  console.info(
    `[bulk-redirects] wrote ${out.length} rule(s) from ${redirects.length} redirect(s)`,
  );

  return new Response(JSON.stringify(out, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
