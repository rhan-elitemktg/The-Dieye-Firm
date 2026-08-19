import type { SchemaTypeDefinition } from "sanity";
import { firmDetails } from "./firmDetails";
import { navLink } from "./navLink";
import { seo } from "./seo";
import { blockContent } from "./blockContent";
import { homePage } from "./homePage";
import { testimonial } from "./testimonial";
import { practiceArea } from "./practiceArea";
import { locationPage } from "./locationPage";
import { blogPost } from "./blogPost";
import { consultForm } from "./consultForm";
import { caseEvaluationForm } from "./caseEvaluationForm";
import { attorney } from "./attorney";
import { whatDrivesUs } from "./whatDrivesUs";
import { awardsBand } from "./awardsBand";
import { award } from "./award";
import { faq } from "./faq";
import { video } from "./video";

/* Grouped the way the Studio sidebar groups them (see src/sanity/structure.ts),
   so a new type has an obvious place to go. Anything added here that is NOT
   placed in structure.ts falls through that file's catch-all and appears at the
   root of the sidebar rather than vanishing. */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  firmDetails,
  homePage,
  consultForm,
  caseEvaluationForm,
  whatDrivesUs,
  awardsBand,
  // Documents
  attorney,
  practiceArea,
  locationPage,
  blogPost,
  testimonial,
  award,
  faq,
  video,
  // Objects
  navLink,
  seo,
  // Rich text
  blockContent,
];
