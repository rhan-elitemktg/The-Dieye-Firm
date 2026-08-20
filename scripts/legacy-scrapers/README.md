# legacy-scrapers/

**Nothing in here runs as part of the site.** These are the tools that ingested
the client's published prose from dieyelaw.com into markdown, and then proved
that markdown converted losslessly into Sanity. Both jobs are finished: Sanity
is the source of truth now, and `src/content/` was deleted in phase 7.

They are kept because they are the record of *how* 47 documents and ~76,000
words of the client's own writing got here, and because a re-ingest is not
inconceivable — if the firm publishes new pages on the old site before it is
switched off, this is the machinery that would pull them.

## What is here

| File | Was | Did |
|---|---|---|
| `scrape-blog.mjs` | `npm run scrape:blog` | 16 posts → `src/content/blog/`, plus `blog-redirects.json` |
| `scrape-practice-areas.mjs` | `npm run scrape:practice-areas` | 32 pages, ~34,900 words |
| `scrape-locations.mjs` | `npm run scrape:locations` | 32 pages, ~41,400 source words |
| `add-takeaways.mjs` | ran after a blog scrape | wrote `keyTakeaways` back into frontmatter, which the scrape wipes |
| `blog-redirects.json` | scraper artifact | 16 redirects, read by `scrape-practice-areas.mjs` to rewrite links |
| `md-to-pt.mjs` | `npm run check:md-to-pt` | proved the markdown → Portable Text conversion lost nothing, 80/80 |

The four npm scripts that pointed at these (`scrape:blog`,
`scrape:practice-areas`, `scrape:locations`, `check:md-to-pt`) were removed from
`package.json` in the same commit. Run them by path if you need them.

## To run any of them again, restore the content first

Every one of these reads or writes `src/content/`, which no longer exists. It is
not lost — it is in git, and `becaca2` is the last commit that carries all 80
files:

```bash
git checkout becaca2 -- src/content
```

`md-to-pt.mjs` additionally needs `.baseline/`, the frozen pre-migration build.
That directory is **gitignored and has only ever existed on Rhan's machine**, so
that check was always local and one-time — it could never have run in CI. If it
is gone, `scripts/diff-baseline.mjs` explains how the baseline was made.

## What did NOT move, and why

- **`../lib/html.mjs`** — the shared HTML parsing kit. The scrapers are its only
  callers today, but it is a general tool and `../lib/` is where it is looked
  for.
- **`../lib/md-to-pt.mjs`** — still used in production by three importers
  (`import/blog.ts`, `import/locations.ts`, `import/practice-areas.ts`).
- **`../import/*.ts`** — the Sanity importers stayed put. They are one-time
  scripts too, but they write to Sanity rather than reading the live site, and
  most of them never touched `src/content/` at all. The three named above are
  the exception and need the restore above before they will run.

## The rule that mattered most while these were live

**Every override table is keyed by SLUG, and in `scrape-locations.mjs` it must
be the FULL slug, not the leaf.** "child-custody" is a leaf under all four
locations and "divorce" under three, so a leaf-keyed Pasadena repair lands on
Sugar Land silently. `AGENTS.md` carries the rest of the ingest rules, including
why the live site is scraped rather than the SiteSucker mirror.
