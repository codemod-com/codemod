import { CUSTOMER_STORY_TAG } from "@/constants";
import definePage from "../helpers/definePage";
import page from "./page";

/**
 * Schema for routes populated by entries of other document types (collections).
 * Useful for internal linking, adding custom content below the rendered collection, and enhancing the page with custom SEO data.
 *
 * For routing & querying information, refer to the coresponding singleton and the collection's document type schemas.
 */
export let blogIndex = definePage({
  name: "blogIndex",
  title: "Blog Index",
  type: "document",
  options: {
    disableCreation: true,
  },
  fields: [
    {
      name: "title",
      title: "Title",
      description:
        "Optional. Will only show in the collection's index. Filtered and paginated views won't render this title.",
      type: "string",
      group: "content",
    },

    {
      name: "collectionTitle",
      title: "Collection title",
      type: "string",
      group: "content",
      description:
        "Optional. Will only show directly above the collection's index. Filtered and paginated views won't render this title.",
    },
    {
      name: "featuredPosts",
      title: "Default Featured posts",
      description:
        "Required. these will show on the collections index when no tags are selected.",
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "blog.article" }] }],
      validation: (Rule) => Rule.unique().min(1).max(2),
    },
    {
      name: "featuredCustomerStories",
      title: "Featured Customer Stories",
      description: `Required. these will show on blog/tag/${CUSTOMER_STORY_TAG.value}.`,
      type: "array",
      group: "content",
      of: [{ type: "reference", to: [{ type: "blog.customerStory" }] }],
      validation: (Rule) => Rule.unique().min(1).max(2),
    },

    {
      name: "emptyStateText",
      title: "Text for empty state",
      description:
        "Optional. Will only show when there are no valid entries in the collection.",
      type: "string",
      group: "content",
    },
    {
      name: "searchPlaceholder",
      title: "Search placeholder",
      type: "string",
      group: "content",
      description: "Search input's placeholder text. Defaults to 'Search'.",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "defaultFilterTitle",
      title: "Default filter title",
      type: "string",
      group: "content",
      description: "Filter's default title. Defaults to 'All'.",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "cta",
      title: "Page Call to action (Optional)",
      type: "reference",
      to: [
        { type: "pageCta" },
        { type: "pageCtaDouble" },
        { type: "pageCtaTriple" },
      ],
      description:
        "Call to action for a page. This is placed at the bottom of the page before the footer.",
    },
  ],
  preview: page.preview,
});
