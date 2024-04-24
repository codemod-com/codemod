import { DocumentIcon } from "@sanity/icons";
import { definePathname } from "@tinloof/sanity-studio";
import definePage from "../helpers/definePage";

export const textPage = definePage({
  name: "textPage",
  title: "Text page",
  type: "document",
  icon: DocumentIcon,
  groups: [
    {
      title: "Content",
      name: "content",
      default: true,
    },
    {
      title: "SEO & Settings",
      name: "seo",
    },
  ],
  fields: [
    {
      name: "title",
      title: "Page title",
      type: "string",
      description: "Contains page title",
      validation: (Rule) => Rule.required(),
      group: "content",
    },
    definePathname(),
    {
      name: "lastUpdatedText",
      title: "Last updated text",
      type: "string",
      description: "Optional. ex.: `Last updated at`",
      group: "content",
    },
    {
      name: "tocTitle",
      title: "Table of contents title",
      type: "string",
      validation: (Rule) => Rule.required(),
      group: "content",
    },
    {
      name: "body",
      title: "Content",
      type: "richtext",
      validation: (Rule) => Rule.required(),
      group: "content",
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: `${title}`,
        subtitle: "Text page",
      };
    },
  },
});
