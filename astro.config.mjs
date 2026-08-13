import { defineConfig, fontProviders } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import react from "@astrojs/react";

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  ""
);

// https://astro.build/config
export default defineConfig({
  /* Drives absolute canonical and og:url values, and the image URL in each
     post's BlogPosting JSON-LD.

     Confirmed with Rhan 2026-08-13: the rebuilt site launches on this domain.
     The `www` is load-bearing — the apex 301s to it, and the live site's own
     canonical is the www form, so dropping it would point every canonical at
     a URL that redirects. Only revisit if the site is parked on a temporary
     subdomain before launch, which would aim canonicals at the old site while
     the new one is live. */
  site: "https://www.dieyelaw.com",

  /* Fonts are self-hosted and preloaded by Astro rather than pulled from
     Google's CDN at runtime. `optimizedFallbacks` generates a metric-matched
     local fallback for each family, so the swap to the real face causes no
     reflow — which is what removes the flash of unstyled text. */
  fonts: [
    {
      name: "Source Serif 4",
      cssVariable: "--font-serif",
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      display: "swap",
      optimizedFallbacks: true,
      fallbacks: ["Georgia", "Times New Roman", "serif"],
    },
    {
      name: "Geist",
      cssVariable: "--font-sans",
      provider: fontProviders.google(),
      weights: [300, 400, 500, 600, 700, 800],
      styles: ["normal"],
      subsets: ["latin"],
      display: "swap",
      optimizedFallbacks: true,
      fallbacks: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
    },
    /* Decorative only — the signature lockup in the Featured Attorney card.
       One weight, one style, and deliberately not preloaded in Layout.astro
       so it never competes with the two families that carry real copy. */
    {
      name: "Yellowtail",
      cssVariable: "--font-script",
      provider: fontProviders.google(),
      weights: [400],
      styles: ["normal"],
      subsets: ["latin"],
      display: "swap",
      fallbacks: ["Brush Script MT", "cursive"],
    },
  ],

  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false, // false for static builds
      studioBasePath: "/admin", // embeds Sanity Studio at /admin
    }),
    react(),
  ],
});
