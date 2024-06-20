import { imageWithAltField } from "../shared/imageWithAltField";

export let quoteBlock = {
  type: "object",
  name: "quoteBlock",
  title: "Quote Block",
  fields: [
    { ...imageWithAltField, name: "image", title: "Image" },
    {
      type: "text",
      name: "quote",
      title: "Quote",
      rows: 4,
      validation: (Rule) => Rule.required(),
    },
    {
      type: "string",
      name: "authorName",
      title: "Author",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "string",
      name: "authorPosition",
      title: "Author Position",
    },
    {
      ...imageWithAltField,
      name: "authorImage",
      title: "Author Image",
    },
  ],
  preview: {
    select: {
      title: "quote",
      subtitle: "authorName",
      authorImage: "authorImage",
      image: "image",
    },
    prepare({ title, subtitle, image, authorImage }) {
      return {
        title: `${title}`,
        subtitle: `${subtitle}`,
        media: authorImage ? authorImage : image,
      };
    },
  },
};
