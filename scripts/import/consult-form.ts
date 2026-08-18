/* One-time import: Contact.astro's hardcoded copy -> the `consultForm` singleton.
 *
 *   npx sanity exec scripts/import/consult-form.ts --with-user-token
 *
 * Every string below is transcribed from src/components/Contact.astro as it
 * rendered before this ran, so the section comes out byte-identical on all 93
 * pages that carry it.
 *
 * Field labels, placeholders and the contact-detail captions are deliberately
 * absent: they stay in the component as input affordances. See the note on the
 * schema type.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

async function run() {
  await client.createOrReplace({
    _id: "consultForm",
    _type: "consultForm",
    header: {
      eyebrow: "Let's Talk",
      headingLead: "Take the",
      headingAccent: "First Step",
      /* Two entries because the source renders a <br /> between them: the lead
         is deliberately broken after the first sentence rather than wrapping
         wherever the column happens to end. */
      leadLines: [
        "One conversation can bring clarity.",
        "Reach out for a free, confidential consultation. No pressure, just answers.",
      ],
    },
    form: {
      cardTitle: "Request a Free Consultation",
      cardIntro:
        "When you choose to work with The Dieye Firm, you are choosing to work with a divorce and family law attorney who will aggressively protect your rights and best interests.",
      submitLabel: "Submit Request",
      privacyNote: "Everything you share is private and confidential.",
    },
  });

  console.log("✓ consultForm written");
  await waitForPublic('count(*[_id == "consultForm"])', 1, "the consultation section");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
