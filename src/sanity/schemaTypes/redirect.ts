import { defineType, defineField } from "sanity";
import { TransferIcon } from "@sanity/icons/Transfer";
import { STATIC_PATHS, normalizePath } from "../../lib/routePaths";

/* A single 301/302, editable by the SEO team without a developer.
 *
 * These are collected at build time by src/pages/bulk-redirects.json.ts and
 * handed to Vercel as BULK REDIRECTS, which run at the edge BEFORE the
 * filesystem. That ordering is the entire reason for the validation below: a
 * source pointing at a page that still exists would black-hole a working page.
 * The build drops those outright — this is the earlier, friendlier warning.
 *
 * ═══ Errors are SAFE here, unlike on the page `seo` object ═══
 *
 * `seo.ts` keeps its length rules at `.warning()` because publishing fires the
 * Vercel deploy hook and a blocking error over a 62-character title would stop
 * the whole site rebuilding. An invalid REDIRECT blocks publishing one
 * document and nothing else, so the ambiguous cases are errors and the merely
 * unwise ones are warnings.
 *
 * ⚠️ This file imports ../../lib/routePaths, which must stay free of
 * `sanity:client`: the Sanity CLI parses schema files during `npm run typegen`,
 * where that Vite virtual module does not resolve.
 *
 * Every message is written for a non-developer. `docs/redirects-for-editors.md`
 * is the long-form version.
 */

const API_VERSION = "2025-08-15";

/** Field values arrive as `unknown` — trimmed string or "". */
const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Both id forms of the document being edited — a draft and its published
    version are one document, and neither should collide with itself. */
const selfIds = (id?: string) => {
  const published = id?.replace(/^drafts\./, "");
  return { id: published, draftId: `drafts.${published}` };
};

const SOURCES_QUERY = `*[_type == "redirect" && !(_id in [$id, $draftId])].source`;

/* Every routed document's real path. Exact rather than approximate, because on
   this site a slug IS the path: a practice area's slug is its nested path under
   /family-law/, a location page's slug is its path from the site root, and a
   post's is its path under /blog/. The one exception is the practice-area
   section root, whose slug is "family-law" and which renders AT /family-law/
   rather than under it. */
const LIVE_PATHS_QUERY = `{
  "practiceAreas": *[_type == "practiceArea" && defined(slug.current)]{
    "path": select(
      slug.current == "family-law" => "/family-law",
      "/family-law/" + slug.current
    )
  }.path,
  "locations": *[_type == "locationPage" && defined(slug.current)]{
    "path": "/" + slug.current
  }.path,
  "posts": *[_type == "blogPost" && defined(slug.current)]{
    "path": "/blog/" + slug.current
  }.path
}`;

export const redirect = defineType({
  name: "redirect",
  title: "Redirect",
  type: "document",
  icon: TransferIcon,
  fields: [
    defineField({
      name: "source",
      title: "Old URL",
      type: "string",
      description:
        'The path that should redirect, starting with a slash — e.g. "/old-page-name". Just the path, not the full web address. Capitalisation and a trailing slash don\'t matter.',
      validation: (rule) => [
        rule.required(),
        rule.custom((value) => {
          const raw = str(value);
          if (!raw) return true;
          if (/^https?:\/\//i.test(raw))
            return 'Enter just the path, not the full web address — e.g. "/old-page-name".';
          if (/\s/.test(raw)) return "A URL can't contain spaces.";
          if (!raw.startsWith("/"))
            return 'The old URL has to start with a slash — e.g. "/old-page-name".';
          if (normalizePath(raw) === "/")
            return "The homepage can't be redirected. Ask a developer if you genuinely need this.";
          if (raw.includes("?"))
            return "Leave off the ? and anything after it — query strings are carried across automatically.";
          if (raw.includes("*"))
            return "Wildcards aren't supported here. Ask a developer — those live in the site's own config.";
          return true;
        }),
        /* Two redirects claiming one URL is ambiguous: whichever the build wrote
           last would win, and which that is depends on document order. Blocked. */
        rule.custom(async (value, context) => {
          const raw = str(value);
          if (!raw) return true;
          const client = context.getClient({ apiVersion: API_VERSION });
          const others = await client.fetch<(string | null)[]>(
            SOURCES_QUERY,
            selfIds(context.document?._id),
          );
          const target = normalizePath(raw);
          return (
            !(others ?? []).some(
              (other) => other && normalizePath(other) === target,
            ) ||
            "Another redirect already uses this old URL. Edit that one instead of adding a second."
          );
        }),
        /* The authoritative live-page check runs at BUILD time, where the whole
           route list is in hand. This is the same check early enough to be
           useful, so an editor learns before publishing rather than from a
           build log they never see. */
        rule
          .custom(async (value, context) => {
            const raw = str(value);
            if (!raw) return true;
            const target = normalizePath(raw);

            if (STATIC_PATHS.map(normalizePath).includes(target))
              return `Warning: "${target}" is a page that still exists. This redirect will be ignored when the site builds, so the page keeps working.`;

            const client = context.getClient({ apiVersion: API_VERSION });
            const live = await client.fetch<{
              practiceAreas: (string | null)[] | null;
              locations: (string | null)[] | null;
              posts: (string | null)[] | null;
            }>(LIVE_PATHS_QUERY);

            const all = [
              ...(live?.practiceAreas ?? []),
              ...(live?.locations ?? []),
              ...(live?.posts ?? []),
            ];
            if (all.some((path) => path && normalizePath(path) === target))
              return `Warning: "${target}" is a page that still exists. This redirect will be ignored when the site builds, so the page keeps working.`;

            return true;
          })
          .warning(),
      ],
    }),
    defineField({
      name: "destination",
      title: "Redirect to",
      type: "string",
      description:
        'Where visitors should land instead. A path on this site — e.g. "/family-law/divorce/" — or a full web address starting with https:// to send them off-site.',
      validation: (rule) => [
        rule.required(),
        rule.custom((value, context) => {
          const raw = str(value);
          if (!raw) return true;
          if (/\s/.test(raw)) return "A URL can't contain spaces.";
          if (!raw.startsWith("/") && !/^https?:\/\//i.test(raw))
            return 'Use a path starting with a slash — e.g. "/about-us/" — or a full address starting with https://.';

          const source = str(
            (context.document as { source?: unknown } | undefined)?.source,
          );
          if (
            source &&
            !/^https?:\/\//i.test(raw) &&
            normalizePath(raw) === normalizePath(source)
          )
            return "This redirects the page to itself, which would loop forever.";
          return true;
        }),
        /* Chains (A→B→C) still resolve, but they leak link equity and burn
           crawl budget — worth flagging to an SEO team, not worth blocking. */
        rule
          .custom(async (value, context) => {
            const raw = str(value);
            if (!raw || /^https?:\/\//i.test(raw)) return true;
            const client = context.getClient({ apiVersion: API_VERSION });
            const sources = await client.fetch<(string | null)[]>(
              SOURCES_QUERY,
              selfIds(context.document?._id),
            );
            const target = normalizePath(raw);
            return (
              !(sources ?? []).some(
                (source) => source && normalizePath(source) === target,
              ) ||
              "Warning: this points at a URL that is itself redirected, creating a chain. Point it straight at the final page instead."
            );
          })
          .warning(),
      ],
    }),
    defineField({
      name: "permanent",
      title: "Permanent",
      type: "boolean",
      initialValue: true,
      description:
        "Leave ON for a page that has moved or been replaced for good — this tells Google to pass the old page's ranking to the new one (a 301). Turn it OFF only for a temporary detour you intend to remove (a 302), which passes no ranking.",
    }),
  ],
  preview: {
    select: {
      source: "source",
      destination: "destination",
      permanent: "permanent",
    },
    prepare: ({ source, destination, permanent }) => ({
      title: source || "(no old URL set)",
      subtitle: `→ ${destination || "(nowhere)"}${permanent === false ? "  ·  temporary" : ""}`,
    }),
  },
});
