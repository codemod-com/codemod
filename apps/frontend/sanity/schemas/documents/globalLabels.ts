import { TagIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const globalLabels = defineType({
  type: "document",
  name: "globalLabels",
  title: "Global Labels",
  icon: TagIcon,
  groups: [
    {
      title: "Blog",
      name: "blog",
    },
    {
      title: "Careers",
      name: "careers",
    },
  ],

  fields: [
    {
      name: "internalTitle",
      title: "Internal title",
      type: "string",
      description:
        "This title is only used internally in Sanity, it won't be displayed on the website.",
      hidden: true,
    },
    {
      name: "blog",
      title: "Blog Labels",
      type: "object",
      group: "blog",
      fields: [
        {
          type: "string",
          name: "relatedArticles",
          title: "Related Articles Label",
          description:
            "Label for the related articles section shown on blog posts. Default: 'Related Articles'",
        },
        {
          name: "backToIndex",
          title: "Back to index",
          type: "string",
          description:
            'Label for the back to index link shown on blog posts. Default: "Back to blog"',
        },
      ],
    },
    {
      name: "careers",
      title: "Careers Labels",
      type: "object",
      group: "careers",
      fields: [
        {
          type: "string",
          name: "relatedJobs",
          title: "Related positions label",

          description:
            "Label for the related positons section shown on job posts. Default: 'Related Positions'",
        },
        {
          name: "backToIndex",
          title: "Back to index",
          type: "string",
          description:
            'Label for the back to index link shown on job posts. Default: "Back to careers"',
        },
        {
          name: "applyToPosition",
          title: "Apply to position",
          type: "string",
          description:
            'Label for the apply to position link shown on job posts. Default: "Apply to position"',
        },
        {
          name: "applyToPositionDescription",
          title: "Apply to position description",
          type: "string",
          description:
            'Label for the apply to position link shown on job posts. Default: "Ready to feel the rush?"',
        },
        {
          name: "applyToPositionCTA",
          title: "Apply to position CTA text",
          type: "string",
          description:
            'Label for the apply to position CTA shown on job posts. Default: "Apply"',
        },
      ],
    },
  ],
});
