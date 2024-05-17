import { defineType } from "sanity";
import { icon } from "./icon";
import { link } from "./link";

export let styledCta = defineType({
  name: "styledCta",
  title: "CTA",
  icon: link.icon,
  type: "object",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
      description: "The title of the CTA (Optional)",
    },
    {
      name: "label",
      title: "Button label",
      type: "string",
    },
    {
      name: "link",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      title: "Style",
      name: "style",
      type: "string",
      options: {
        list: [
          { title: "Primary", value: "primary" },
          { title: "Secondary", value: "secondary" },
        ],
        layout: "radio",
      },
    },
    icon,
  ],
});
