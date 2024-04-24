import { defineType } from "sanity";

export default defineType({
  type: "document",
  name: "pageCta",
  title: "Page CTA",
  description:
    "Call to action for a page. This is placed at the bottom of the page before the footer.",
  fields: [
    {
      type: "string",
      name: "title",
      title: "Title",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "richtext",
      name: "paragraph",
      title: "Paragraph",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "styledCta",
      name: "cta",
      title: "Call to action",
    },
  ],
});
