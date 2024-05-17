import { defineSection } from "@tinloof/sanity-studio";

export let testimonials = defineSection({
  title: "Testimonials",
  name: "section.testimonials",
  type: "object",
  options: {
    variants: [
      {
        assetUrl: "/static/blocks/testimonials.png",
      },
    ],
  },
  fields: [
    {
      type: "string",
      name: "title",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "richtext",
      name: "paragraph",
    },
    {
      type: "array",
      name: "items",
      title: "Testimonials",
      of: [
        {
          type: "object",
          fields: [
            {
              type: "image",
              name: "companyLogoLight",
              fields: [
                {
                  type: "string",
                  name: "alt",
                  validation: (Rule) => Rule.required(),
                },
              ],
              title: "Company Logo Light Mode",
              validation: (Rule) => Rule.required(),
            },
            {
              type: "image",
              name: "companyLogoDark",
              fields: [
                {
                  type: "string",
                  name: "alt",
                  validation: (Rule) => Rule.required(),
                },
              ],
              title: "Company Logo Dark Mode",
              validation: (Rule) => Rule.required(),
            },
            {
              type: "string",
              name: "name",
              validation: (Rule) => Rule.required(),
            },
            {
              type: "string",
              name: "role",
              validation: (Rule) => Rule.required(),
            },
            {
              type: "image",
              name: "image",
              fields: [
                {
                  type: "string",
                  name: "alt",
                  validation: (Rule) => Rule.required(),
                },
              ],
              validation: (Rule) => Rule.required(),
            },
            {
              type: "richtext",
              name: "quote",
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "role",
              media: "image",
            },
          },
        },
      ],
    },
  ],
});
