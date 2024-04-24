import { defineType } from "sanity";

export default defineType({
  type: "document",
  name: "pageCtaDouble",
  title: "Page CTA with two blocks",
  description:
    "Call to action for a page. This is placed at the bottom of the page before the footer",
  fields: [
    {
      type: "string",
      title: "Title",
      name: "title",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "string",
      title: "Left section title",
      name: "leftSectionTitle",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "richtext",
      title: "Left section paragraph",
      name: "leftSectionParagraph",
    },
    {
      type: "styledCta",
      title: "Left section Call to action",
      name: "leftSectionCta",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "string",
      title: "Right section title",
      name: "rightSectionTitle",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "richtext",
      title: "Right section paragraph",
      name: "rightSectionParagraph",
    },
    {
      type: "boolean",
      title: "Right section is Newsletter",
      name: "rightSectionIsNewsletter",
      description:
        "If true, the right section will have a newsletter form instead of a CTA",
    },
    {
      type: "styledCta",
      title: "Right section Call to action",
      name: "rightSectionCta",
      hidden: ({ document }) => document?.rightSectionIsNewsletter === true,
    },
    {
      name: "privacyLink",
      title: "Privacy link",
      type: "link",
      hidden: ({ document }) => !document?.rightSectionIsNewsletter,
    },
  ],
});
