import { ThLargeIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const collapsible = defineType({
  name: "collapsible",
  title: "Collapsible",
  type: "object",
  icon: ThLargeIcon,
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "content",
      title: "Content",
      type: "ptBodyCollapsible",
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
        subtitle: "Collapsible Tables",
      };
    },
  },
});
