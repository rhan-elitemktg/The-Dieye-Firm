import { defineCliConfig } from "sanity/cli";
import { loadEnv } from "vite";

/* The CLI runs outside Astro's env loading, so it reads the same PUBLIC_ vars
   through Vite's loadEnv — exactly as astro.config.mjs does. Without this file
   `sanity dataset list`, `sanity documents create` and friends fail with
   ENOENT because they have no project to resolve against. */
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  ""
);

export default defineCliConfig({
  api: {
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: PUBLIC_SANITY_DATASET,
  },
});
