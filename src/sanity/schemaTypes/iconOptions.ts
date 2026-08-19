/* The inlined content icons, named once.
 *
 * These are SVGs in src/assets/icons/, imported `?raw` and inlined by the
 * component so they take their colour from the card through `currentColor`. An
 * uploaded asset arrives as an <img> and cannot do that, which is why an icon is
 * a PICKER everywhere it appears rather than an image field.
 *
 * The titles describe the drawing, not the section it happens to sit in — an
 * editor choosing one is looking at a list of words and needs to know which
 * picture each is. They were written by rendering the files, not by reading
 * their names: "experienced.svg" is a briefcase with a gavel, which nobody would
 * guess.
 *
 * Each surface passes the SUBSET it can actually render. The component holds a
 * map from these values to the imported SVG and throws on a name it doesn't
 * know, so a value offered here that a component cannot draw fails the build
 * rather than rendering an empty square.
 */
const ICON_TITLES: Record<string, string> = {
  "compassionate-approach": "Hands holding a heart",
  "client-focused": "Person in a crosshair",
  experienced: "Briefcase and gavel",
  "flexible-payments": "Scales beside a hand holding a money bag",
  divorce: "A couple with a broken heart between them",
  "child-custody": "An umbrella sheltering a child",
  "family-law": "Scales above a family",
  "child-support": "Hands cradling a child",
  "property-division": "A house split in two",
  modifications: "A document with a pen and a gavel",
};

/** The Studio list for an icon field, in the order given. */
export function iconList(...values: string[]) {
  return values.map((value) => {
    const title = ICON_TITLES[value];
    if (!title) throw new Error(`No icon titled "${value}" — add it to iconOptions.ts.`);
    return { title, value };
  });
}
