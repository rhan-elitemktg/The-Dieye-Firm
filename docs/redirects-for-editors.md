# Redirects — a guide for the SEO team

When a page moves or is renamed, its old address has to send visitors to the new
one. Without that, anyone following an old link — from Google, from another
site, from a bookmark — lands on a "Page Not Found", and the ranking the old
page had earned is lost rather than passed on.

You can add these yourself in the Studio. No developer needed.

**Studio → Site Settings → Global SEO Settings → Redirects.**

---

## Adding one

Click **＋** and fill in three fields.

**Old URL** — the address that should redirect. Just the path, starting with a
slash:

    /old-page-name

Not `https://www.dieyelaw.com/old-page-name`. Capitalisation and a trailing
slash don't matter — `/Old-Page/` and `/old-page` are treated as the same thing,
and both spellings are handled automatically once you save.

**Redirect to** — where people should land instead. Either a path on this site:

    /family-law/divorce/

or a full address if you're sending them somewhere else entirely:

    https://example.com/some-page

**Permanent** — leave this **ON** in almost every case. It tells Google the move
is final and that the old page's ranking should transfer to the new one. Turn it
off only for a genuinely temporary detour you intend to remove; a temporary
redirect passes no ranking at all.

Then **Publish**. Nothing takes effect until you do — an unpublished redirect
cannot reach the live site, so a half-finished one is harmless.

The change goes live the next time the site rebuilds, which happens
automatically when you publish.

---

## What the warning messages mean

**"Another redirect already uses this old URL."**
Two rules for one address would be ambiguous — there'd be no way to say which
one wins. Find the existing rule and edit that one instead of adding a second.
This one blocks publishing.

**"This redirects the page to itself, which would loop forever."**
The old URL and the destination are the same address. Blocks publishing.

**"…is a page that still exists."**
This is the important one. A redirect takes priority over the real page, so
pointing one at an address that's still live would **take that page off the
site**. The site protects itself here: a rule like this is ignored when the site
builds, and the page keeps working. But the redirect won't do anything either,
so it's telling you something is wrong — usually a typo in the old URL, or a
page you thought had been deleted and hasn't been.

**"…points at a URL that is itself redirected, creating a chain."**
A sends to B, and B sends to C. It still works, but visitors take two hops
instead of one and a little ranking leaks at each. Point it straight at the
final page.

---

## What still needs a developer

- **Wildcards** — "redirect everything under `/old-section/` to
  `/new-section/`". These need a code change.
- **Redirecting the homepage** (`/`).
- **Anything conditional** — rules based on the visitor's country, language or
  device.
- **Removing a redirect that was published a long time ago.** You can delete it
  yourself, but check with a developer first: old links may still be relied on.

If you're unsure whether something is possible, ask — it usually is.

---

## A note on what NOT to redirect

A redirect is for a page that has **moved or been replaced**. It isn't a way to
hide a page you'd rather people didn't see.

If you want a page kept out of Google but still reachable by anyone with the
link, use the page's own **SEO tab → "Hide from search engines"** instead. That
removes it from search and from the sitemap while leaving the page working.
