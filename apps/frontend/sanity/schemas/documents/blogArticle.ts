import { BillIcon, TagIcon } from "@sanity/icons";
import definePage from "../helpers/definePage";
import { imageWithAltField } from "./../shared/imageWithAltField";

export const blogArticle = definePage({
  name: "blog.article",
  title: "Article",
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
      ...imageWithAltField,
      name: "featuredImage",
      title: "Featured image",
      group: "content",
      description: "Appears in the article's card in the blog",
      validation: undefined,
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
      name: "tags",
      title: "Article tag",
      group: "tagging",
      type: "array",
      description:
        "Highly recommended to tag the article for search amd filtering purposes.",
      validation: (Rule) => Rule.max(1),
      of: [
        {
          type: "reference",
          weak: true,
          to: [
            {
              type: "blog.tag",
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
      description: "These will show in the sidebar of the article.",
      group: "content",
      type: "object",
      fields: [
        {
          name: "showToc",
          title: "Show Table of Contents?",
          type: "boolean",
          description:
            "If checked, a table of contents will be generated from the headings in the article.",
          initialValue: true,
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
