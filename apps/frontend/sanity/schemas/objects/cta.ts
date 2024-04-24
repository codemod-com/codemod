import { defineType } from "sanity";
import { link } from "./link";

export const cta = defineType({
  name: "cta",
  title: "CTA",
  icon: link.icon,
  type: "object",
  fields: [
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
  ],
});
