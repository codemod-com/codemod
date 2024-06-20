import { InputWithCharacterCount } from "@/sanity/lib/components/InputWithCharacterCount";
import { BillIcon, TagIcon } from "@sanity/icons";
import definePage from "../helpers/definePage";
import { imageWithAltField } from "../shared/imageWithAltField";

export let blogCustomerStory = definePage({
  name: "blog.customerStory",
  title: "Customer Story",
  type: "document",
  icon: BillIcon,
  groups: [
    {
      name: "tagging",
      title: "Classification",
      icon: TagIcon,
    },
  ],
  fields: [
    {
      type: "string",
      name: "title",
      group: "content",
      title: "Article headline",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "content",
      components: {
        input: InputWithCharacterCount,
      },
      options: {
        maxLength: 50,
      },
      description:
        "Optional. Used on the automation page when with matching tags.",
    },
    // To be added later once we finalize linking to automations
    // {
    //   name: "automationTags",
    //   title: "Automation tags",
    //   type: "array",
    //   group: "tagging",
    //   description:
    //     "Tags are used to link the article to automations. the more matching tags, the better the match.",
    //   of: [{ type: "string" }],
    // },
    {
      ...imageWithAltField,
      name: "featuredImage",
      title: "Featured image",
      group: "content",
      description: "Appears in the article's card in the blog",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "publishedAt",
      title: "Date of first publication",
      group: "tagging",
      type: "date",
      validation: (Rule) => Rule.required(),
    },

    {
      name: "authors",
      title: "Author(s)",
      group: "tagging",
      type: "array",
      of: [
        {
          type: "reference",
          weak: true,
          to: [
            {
              type: "blog.author",
            },
          ],
        },
      ],
    },

    {
      name: "preamble",
      title: "Preamble or introduction",
      group: "content",
      description:
        "Optional, appears in the article's card in the blog. If none provided, will use the first paragraph of the content.",
      type: "text",
      rows: 2,
      validation: (Rule) =>
        Rule.max(175).warning("The preamble shouldn't go over 175 characters"),
    },
    {
      name: "body",
      title: "Content",
      group: "content",
      type: "ptBody",
      validation: (Rule) => Rule.required(),
    },

    {
      name: "sidebar",
      title: "Sidebar",
      description:
        "These will show in the sidebar of the article. For best results, use no more than 2 items",
      group: "content",
      type: "object",
      fields: [
        {
          name: "features",
          title: "Features",
          description:
            "Optional. Select a list of tech features relevant to this story.",
          type: "array",
          of: [{ type: "reference", to: [{ type: "techFeature" }] }],
        },
        {
          name: "showArticleCta",
          title: "Show article CTA",
          type: "boolean",
          description:
            "If checked, the article CTA will be shown in the sidebar of the article.",
        },
        {
          name: "stats",
          title: "Stats",
          description:
            "Optional. Add up to 2 stats to show in the sidebar of the article.",
          type: "array",
          of: [{ type: "stats" }],
          validation: (Rule) => Rule.unique().max(2),
        },
      ],
    },

    {
      name: "pageCta",
      title: "Page Call to action (Optional)",
      type: "reference",
      group: "content",
      to: [
        { type: "pageCta" },
        { type: "pageCtaDouble" },
        { type: "pageCtaTriple" },
      ],
      description:
        "Call to action for a page. This is placed at the bottom of the page before the footer.",
    },
  ],
});
