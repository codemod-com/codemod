import { AccessDeniedIcon } from "@sanity/icons";
import { definePathname } from "@tinloof/sanity-studio";
import { defineType } from "sanity";

export const notFound = defineType({
  name: "notFound",
  title: "Not Found (404) Page",
  type: "document",
  options: {
    disableCreation: true,
    disablePublishStatus: true,
    hideSeo: true,
  },
  icon: AccessDeniedIcon,
  fields: [
    {
      name: "title",
      type: "string",
      title: "Title",
    },
    definePathname(),
    {
      name: "description",
      type: "text",
      rows: 3,
      title: "Description",
    },
    {
      name: "heroCta",
      type: "cta",
      title: "CTA",
    },
    {
      type: "reference",
      to: [
        { type: "pageCta" },
        { type: "pageCtaDouble" },
        { type: "pageCtaTriple" },
      ],
      name: "footerCta",
      title: "Page Call to action (Optional)",
      description:
        "Call to action for a page. This is placed at the bottom of the page before the footer.",
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title: `${title}`,
        subtitle: "Not found page",
      };
    },
  },
});
