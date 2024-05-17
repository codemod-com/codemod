import { definePathname } from "@tinloof/sanity-studio";
import definePage from "../helpers/definePage";

export let careers = definePage({
  name: "careers",
  title: "Careers page",
  type: "document",
  fields: [
    definePathname(),
    {
      name: "title",
      title: "Page title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "subtitle",
      title: "Subtitle",
      type: "richtext",
    },
    {
      hidden: true,
      type: "array",
      name: "jobs",
      title: "Jobs",
      of: [
        {
          type: "reference",
          weak: true,
          to: [{ type: "job" }],
        },
      ],
      options: {
        filter: () => {
          return {
            filter: "active == true",
          };
        },
      },
    },
    {
      type: "reference",
      to: [
        { type: "pageCta" },
        { type: "pageCtaDouble" },
        { type: "pageCtaTriple" },
      ],
      name: "cta",
      title: "Page CTA (Optional)",
      description:
        "Call to action for a page. This is placed at the bottom of the page before the footer.",
    },
  ],
});
