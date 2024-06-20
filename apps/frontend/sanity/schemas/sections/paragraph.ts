import { BlockContentIcon, DocumentTextIcon } from "@sanity/icons";
import { defineSection } from "@tinloof/sanity-studio";
import { richText } from "./../objects/richText";

export let paragraph = defineSection({
  title: "Paragraph with Title",
  name: "section.paragraph",
  type: "object",
  options: {
    variants: [
      {
        assetUrl: "/static/blocks/paragraph.png",
      },
    ],
  },
  icon: DocumentTextIcon,
  fields: [
    {
      type: "string",
      name: "title",
      title: "Title",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "richtext",
      name: "content",
      title: "Content",
    },
  ],
});
