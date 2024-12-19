import { defineField } from "sanity";

export const imageWithAltField = defineField({
  type: "object",
  name: "imageWithAltField",
  title: "Image with Light and Dark Mode Support",
  validation: (Rule) => Rule.required(),
  fields: [
    {
      name: "lightImage",
      title: "Light Mode Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "darkImage",
      title: "Dark Mode Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "alt",
      title: "Descriptive label for screen readers & SEO",
      type: "string",
      validation: (Rule) =>
        Rule.required()
          .max(150)
          .warning(
            "Alt text should be descriptive and concise (under 150 characters).",
          ),
    },
  ],
});
