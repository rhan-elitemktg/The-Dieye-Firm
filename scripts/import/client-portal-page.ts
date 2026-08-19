/* One-time import: clientPortalPage — phase 5.
 *
 *   npx sanity exec scripts/import/client-portal-page.ts --with-user-token
 *
 * Header and two groups of buttons. Every string is authored by us — there is
 * no comp and the live site has no equivalent. The two MyCase links point at
 * different subdomains, `dieylaw` and `dieyelaw`, which is an open question.
 *
 * Strings extracted from the page and its components and diffed, never retyped.
 */

import { getCliClient } from "sanity/cli";
import { waitForPublic } from "./lib/wait-for-public";

const client = getCliClient({ apiVersion: "2025-08-15" });

const DOC = {
  "_id": "clientPortalPage",
  "_type": "clientPortalPage",
  "header": {
    "kicker": "Clients",
    "title": "Client Portal",
    "deck": "Everything you need to get started with us, or to keep an existing case moving."
  },
  "groups": [
    {
      "_type": "group",
      "_key": "group-1",
      "heading": "New clients",
      "blurb": "If you have not met with us yet, start here. Print the form, fill it in, and bring it to your consultation or email it back ahead of time - it covers the details we would otherwise spend your first appointment collecting.",
      "actions": [
        {
          "_type": "action",
          "_key": "act1-1",
          "label": "Download the New Client Form",
          "note": "PDF, 6 pages",
          "href": "/documents/Client-Intake-for-website.pdf",
          "style": "btn--gold",
          "download": true
        }
      ]
    },
    {
      "_type": "group",
      "_key": "group-2",
      "heading": "Existing clients",
      "blurb": "Your case file, documents and messages live in MyCase. Both links below open MyCase in a new tab, and you will sign in there.",
      "actions": [
        {
          "_type": "action",
          "_key": "act2-1",
          "label": "Access Your Case",
          "note": "Sign in to MyCase",
          "href": "https://auth.mycase.com/login_sessions/new?response_type=code&client_id=tCEM8hNY7GaC2c8P&redirect_uri=https%3A%2F%2Fdieylaw.mycase.com%2Fuser_sessions%2Fo_auth_callback&login_required=true",
          "style": "btn--gold",
          "external": true
        },
        {
          "_type": "action",
          "_key": "act2-2",
          "label": "Pay Now",
          "note": "Secure payment through MyCase",
          "href": "https://dieyelaw.mycase.com/paypage/r2nqKsLn4tKLrBcbbySRmkrg",
          "style": "btn--outline",
          "external": true
        }
      ]
    }
  ]
};

async function run() {
  await client.createOrReplace(DOC);
  console.log("\u2713 clientPortalPage written");
  await waitForPublic('count(*[_id == "clientPortalPage"])', 1, "the page copy");
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error(err.message ?? err);
    process.exit(1);
  },
);
