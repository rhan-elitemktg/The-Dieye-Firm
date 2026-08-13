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
  /* Drives absolute canonical and og:url values. This is the domain the
     rebuilt site replaces, so canonicals should point at it from the start
     rather than at a preview URL — confirm before launch. */
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
