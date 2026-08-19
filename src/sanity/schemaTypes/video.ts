import { defineType, defineField } from "sanity";
import { PlayIcon } from "@sanity/icons/Play";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";

/* One Wistia video, rendered in two places at two shapes.
 *
 * Nine of them fill the /video-center/ grid; six of those nine are also the
 * homepage carousel. Before this document existed those six titles were written
 * twice, once in each component, which is the same drift that put two different
 * job titles on the attorney.
 *
 * ═══ Runtime is NOT a field, deliberately ═══
 *
 * The duration pill comes from Wistia's oEmbed endpoint at BUILD time, wrapped
 * so an outage drops the pill rather than failing the build. A typed-in runtime
 * would be a number that silently goes stale the first time a video is
 * re-cut - and nobody would notice, because it looks right.
 *
 * ═══ Titles are ours, not Wistia's ═══
 *
 * The API titles carry em dashes, emoji and hashtag phrasing ("...Divorced…But
 * Here's Why You Might Want One 👀"), and for the three studio pieces the live
 * site's own labels are where the search equity sits. So the title is typed
 * here and the API is only asked for the runtime.
 *
 * ═══ Two posters, two orders, and why they disagree ═══
 *
 * The grid poster is landscape and the reel poster is portrait, because the two
 * surfaces crop differently - a 16:9 card and a 9:16 phone-shaped slide cannot
 * share one photograph.
 *
 * The two ORDERS also differ, and that is the part worth reading before
 * reordering anything. Nine grid tiles are cut from only six shoots, so three
 * photographs appear twice and the grid has to hold each pair apart at three
 * column counts at once (3-up, 2-up, and one column where DOM order IS visual
 * order). The current sequence is the one that does that; the long comment in
 * video-center/VideoGrid.astro carries the working. The homepage carousel has
 * its own arithmetic - four posters across six slides, arranged so a repeat
 * never lands twice in one view.
 *
 * Dragging a video in the Studio now moves its poster with it, which the old
 * hardcoded arrays did not: there, posters were placed by position and videos
 * were ordered editorially. Reordering is therefore a design decision, not a
 * list tidy - check the pairings still hold at 1000px and 650px.
 */
export const video = defineType({
  name: "video",
  title: "Videos",
  type: "document",
  icon: PlayIcon,
  orderings: [orderRankOrdering],
  fields: [
    /* Drag order in Collections → Videos is the /video-center/ grid order. */
    orderRankField({ type: "video" }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description:
        "Shown on the card and read out by screen readers as \"Play video: …\". Ours, not the one typed into Wistia — those carry emoji and hashtags.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "wistiaId",
      title: "Wistia ID",
      type: "string",
      description:
        'The ten-character id from the Wistia URL — home.wistia.com/medias/XXXXXXXXXX. The runtime shown on the card is fetched from Wistia with this at build time.',
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z0-9]{10}$/, { name: "Wistia id" })
          .error("A Wistia id is ten lowercase letters and digits."),
    }),
    defineField({
      name: "label",
      title: "Category",
      type: "string",
      description: "The small gold badge on the grid card.",
      options: {
        list: [
          { title: "The Firm", value: "The Firm" },
          { title: "Quick Answer", value: "Quick Answer" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "aspect",
      title: "Shape",
      type: "string",
      description:
        "The VIDEO's shape, not the card's. Every grid card is 16:9; this is what the player opens at, so a vertical short is not letterboxed.",
      options: {
        list: [
          { title: "Landscape (16:9)", value: "16/9" },
          { title: "Vertical (9:16)", value: "9/16" },
        ],
        layout: "radio",
      },
      initialValue: "16/9",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "poster",
      title: "Grid poster",
      type: "image",
      options: { hotspot: true },
      description:
        "The still on the /video-center/ card, cropped to 16:9. A photograph, not Wistia's auto-generated frame — those catch Papa mid-sentence, and the whiteboard explainer's is a near-blank white screen.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "reelPoster",
      title: "Homepage poster (portrait)",
      type: "image",
      options: { hotspot: true },
      description:
        "The portrait still for the homepage carousel. Needed only if this video is picked in Pages → Home Page → Video Reels. The build fails naming the video if one is picked without it — schema validation cannot see the pick, because it lives on another document.",
    }),
  ],
  /* The homepage pick is NOT shown here. It lives on `homePage.videoReels.picks`
     and a preview cannot follow a reference backwards, so a subtitle claiming to
     know would go stale the moment the picks changed. */
  preview: {
    select: { title: "title", label: "label", media: "poster" },
    prepare: ({ title, label, media }) => ({ title, subtitle: label, media }),
  },
});
