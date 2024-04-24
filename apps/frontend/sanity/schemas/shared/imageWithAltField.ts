import { defineField } from "sanity";

export const imageWithAltField = defineField({
  type: "image",
  name: "imageWithAltField",
  title: "Image",
  validation: (Rule) => Rule.required(),
  fields: [
    {
      name: "alt",
      title: "Descriptive label for screen readers & SEO",
      type: "string",
    },
  ],
  options: {
    hotspot: true,
  },
});
