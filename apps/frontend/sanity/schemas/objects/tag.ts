import { LinkIcon } from "@sanity/icons";
import { defineType } from "sanity";

export let tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    {
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
  ],
});
