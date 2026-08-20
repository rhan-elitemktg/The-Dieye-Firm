import type { SchemaTypeDefinition } from "sanity";
import { firmDetails } from "./firmDetails";
import { navLink } from "./navLink";
import { seo } from "./seo";
import { blockContent } from "./blockContent";
import { aboutBody } from "./aboutBody";
import { paragraphRun } from "./paragraphRun";
import { homePage } from "./homePage";
import { aboutPage } from "./aboutPage";
import { practiceAreasPage } from "./practiceAreasPage";
import { blogPage } from "./blogPage";
import { testimonialsPage } from "./testimonialsPage";
import { contactPage } from "./contactPage";
import { faqPage } from "./faqPage";
import { videoCenterPage } from "./videoCenterPage";
import { sitemapPage } from "./sitemapPage";
import { thankYouPage } from "./thankYouPage";
import { notFoundPage } from "./notFoundPage";
import { hiringGuidePage } from "./hiringGuidePage";
import { privacyPolicyPage } from "./privacyPolicyPage";
import { clientPortalPage } from "./clientPortalPage";
import { testimonial } from "./testimonial";
import { practiceArea } from "./practiceArea";
import { locationPage } from "./locationPage";
import { blogPost } from "./blogPost";
import { consultForm } from "./consultForm";
import { caseEvaluationForm } from "./caseEvaluationForm";
import { attorney } from "./attorney";
import { whatDrivesUs } from "./whatDrivesUs";
import { awardsBand } from "./awardsBand";
import { testimonialsBand } from "./testimonialsBand";
import { statsBand } from "./statsBand";
import { award } from "./award";
import { faq } from "./faq";
import { video } from "./video";
import { globalSeo } from "./globalSeo";
import { redirect } from "./redirect";

/* Grouped the way the Studio sidebar groups them (see src/sanity/structure.ts),
   so a new type has an obvious place to go. Anything added here that is NOT
   placed in structure.ts falls through that file's catch-all and appears at the
   root of the sidebar rather than vanishing. */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  firmDetails,
  homePage,
  aboutPage,
  practiceAreasPage,
  blogPage,
  testimonialsPage,
  contactPage,
  faqPage,
  videoCenterPage,
  clientPortalPage,
  sitemapPage,
  thankYouPage,
  notFoundPage,
  hiringGuidePage,
  privacyPolicyPage,
  consultForm,
  caseEvaluationForm,
  whatDrivesUs,
  awardsBand,
  testimonialsBand,
  statsBand,
  globalSeo,
  // Documents
  attorney,
  practiceArea,
  locationPage,
  blogPost,
  testimonial,
  award,
  faq,
  video,
  redirect,
  // Objects
  navLink,
  seo,
  // Rich text
  blockContent,
  aboutBody,
  paragraphRun,
];
