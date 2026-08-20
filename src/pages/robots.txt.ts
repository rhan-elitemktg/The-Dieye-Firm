/* robots.txt, generated so the "Discourage this site from being crawled" switch
 * in Global SEO Settings can block crawlers sitewide.
 *
 * When the switch is ON, every page also carries a `noindex` meta tag (Layout);
 * the Disallow here is the belt to that suspenders. When OFF, this is the normal
 * allow-all file pointing at the sitemap.
 *
 * A DYNAMIC endpoint rather than a static public/robots.txt, because a static
 * file has nowhere for the toggle to take effect — and a static one would
 * SHADOW this route, so there must never be both.
 */
import type { APIRoute } from "astro";
import { getGlobalSeo } from "../sanity/globalSeo";

export const GET: APIRoute = async ({ site }) => {
  const origin = (site?.href ?? "https://www.dieyelaw.com").replace(/\/+$/, "");
  const globalSeo = await getGlobalSeo();

  const body = globalSeo?.discourageCrawling
    ? // Keep the whole site out of search while it is on its temporary address.
      "User-agent: *\nDisallow: /\n"
    : [
        "User-agent: *",
        "Allow: /",
        "",
        "# The embedded Sanity Studio — an editor tool, not content.",
        "Disallow: /admin",
        "",
        `Sitemap: ${origin}/sitemap.xml`,
        "",
      ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
