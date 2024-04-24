import { LinkIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const link = defineType({
  name: "link",
  title: "Link",
  icon: LinkIcon,
  type: "object",
  fields: [
    {
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "href",
      title: "URL",
      type: "string",
      description: "e.g. https://example.com or /about-page",
      validation: (Rule) => Rule.required(),
    },
  ],
});
