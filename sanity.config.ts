import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";
import { eliteTheme } from "./src/sanity/theme";
import { EliteMark } from "./src/sanity/components/EliteMark";

export default defineConfig({
  name: "the-dieye-firm",
  // Studio title — the name beside the emblem, in the browser tab, and in the
  // workspace menu.
  title: "Elite Legal Marketing",
  // The ELITE emblem in the navbar chip and on the login card. This is the
  // SUPPORTED way to brand the nav — `studio.components.logo` is deprecated and
  // a no-op in Studio 6.x.
  icon: EliteMark,
  // Elite brand palette (light-locked, teal accent, gold highlights).
  theme: eliteTheme,
  /* Vite replaces `import.meta.env.*` at build time, which is how the embedded
     Studio gets these. The Sanity CLI loads this same file under plain Node,
     where `import.meta.env` does not exist — without the process.env fallback
     every schema-aware CLI command (`schema extract`, `documents validate`,
     TypeGen) fails with "Invalid studio config format", because projectId
     resolves to undefined. */
  projectId:
    import.meta.env?.PUBLIC_SANITY_PROJECT_ID ??
    process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset:
    import.meta.env?.PUBLIC_SANITY_DATASET ?? process.env.PUBLIC_SANITY_DATASET,
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
  },
});
