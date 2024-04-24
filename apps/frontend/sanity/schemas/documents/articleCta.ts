import defineSchema from "../helpers/defineSchema";
import { link } from "../objects/link";

export default defineSchema({
  type: "document",
  name: "articleCta",
  title: "Article CTA",
  icon: link.icon,
  description:
    "Call to action for an article. This is placed in the sidebar of the article.",
  options: {
    disableCreation: true,
  },
  fields: [
    {
      type: "string",
      name: "title",
      title: "Title",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "text",
      name: "subtitle",
      title: "Subtitle",
      rows: 3,
    },
    {
      type: "cta",
      name: "cta",
      title: "Call to action",
    },
  ],
});
