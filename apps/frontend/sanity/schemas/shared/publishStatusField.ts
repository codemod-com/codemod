import { PublishStatus, PublishStatusOptions } from "@/types";
import { defineField } from "sanity";

export const publishStatusField = defineField({
  name: "publishStatus",
  title: "Search engine visibility",
  type: "string",
  initialValue: PublishStatus.public,
  validation: (Rule) => Rule.required(),
  group: "settings",
  options: {
    layout: "dropdown",
    list: PublishStatusOptions,
  },
});
