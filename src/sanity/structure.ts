import type { StructureResolver } from "sanity/structure";
/* @sanity/icons v5 dropped the barrel export — the root entry only ships `Icon`
   and `icons`, so every glyph comes from its own subpath. */
import { HomeIcon } from "@sanity/icons/Home";

/* Documents that exist exactly once. Pinning the document ID here is what makes
   a type a singleton — there is no schema option for it. They are also filtered
   out of the generic type list below, so an editor can't create a second one. */
export const SINGLETONS = ["firmDetails"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Website Content")
    .items([
      S.listItem()
        .title("Firm Details")
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType("firmDetails")
            .documentId("firmDetails")
            .title("Firm Details")
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !SINGLETONS.includes(listItem.getId() as string)
      ),
    ]);
