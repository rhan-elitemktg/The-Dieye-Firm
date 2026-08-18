import type { StudioTheme } from "sanity";

// Types for the generated (minified) Themer theme module, ./eliteTheme.js.
//
// Written as `declare const` + a separate `export`, not `export const theme:
// StudioTheme;`. Both mean the same thing to TypeScript, but the bare form is
// only legal inside a declaration file, and `npm run typegen` parses every file
// under src/ with Babel — which does not know this is one and rejects it as a
// const with no initializer. The error is cosmetic, but it prints on every run,
// which is how a real error gets missed.
declare const theme: StudioTheme;

export { theme };
