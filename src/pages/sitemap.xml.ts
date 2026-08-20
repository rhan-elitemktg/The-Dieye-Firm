/* sitemap.xml, generated from the same helpers that build the routes.
 *
 * ⚠️ NOT /sitemap/ — that is the HTML index for humans, in sitemap.astro. This
 * is the machine one. The two have confusingly similar names and always will;
 * the live site's own HTML index is at /site-map/.
 *
 * Hand-rolled rather than @astrojs/sitemap because that integration's `filter`
 * is SYNCHRONOUS and cannot see the per-page `noIndex` toggle — a flagged page
 * would still be submitted to Google, making the toggle a half-feature.
 *
 * Route assembly lives in sanity/routes.ts, shared with bulk-redirects.json.ts.
 * This file's only job is to drop the hidden pages and render the XML.
 */
import type { APIRoute } from "astro";
import { canonicalize } from "../lib/seo";
import { getSiteEntries } from "../sanity/routes";
import { SITEMAP_EXCLUDED, normalizePath } from "../lib/routePaths";

const xmlEscape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const EXCLUDED = new Set(SITEMAP_EXCLUDED.map(normalizePath));

export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.href ?? "https://www.dieyelaw.com").replace(/\/+$/, "");
  const entries = await getSiteEntries();

  const urls = entries
    .filter((entry) => entry.noIndex !== true)
    .filter((entry) => !EXCLUDED.has(normalizePath(entry.path)))
    .map((entry) => {
      const loc = xmlEscape(canonicalize(`${origin}${entry.path}`));
      const lastmod = entry.lastmod
        ? `\n    <lastmod>${entry.lastmod}</lastmod>`
        : "";
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
    })
    .sort()
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
