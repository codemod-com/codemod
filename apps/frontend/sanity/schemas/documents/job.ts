import definePage from "../helpers/definePage";

export const job = definePage({
  name: "job",
  title: "Job listing page",
  type: "document",
  fields: [
    {
      type: "boolean",
      name: "active",
      title: "Active",
      description: "Is the job active?",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "title",
      title: "Job title",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "string",
      name: "location",
      title: "Location",
      description: "Location of the job",
      validation: (Rule) => Rule.required(),
    },
    {
      type: "string",
      name: "department",
      title: "Department",
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          "Engineering",
          "Marketing",
          "Sales",
          "Customer Success",
          "Product",
          "Design",
          "Finance",
          "People",
          "Legal",
          "Operations",
          "Other",
        ],
      },
    },
    {
      name: "post",
      title: "Post",
      type: "richtext",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "privacyPolicy",
      title: "Privacy Policy",
      description: "Link to the privacy policy in the Job form",
      type: "link",
      validation: (Rule) => Rule.required(),
      initialValue: {
        label: "Privacy Policy",
        href: "/privacy-policy",
      },
    },
    {
      type: "array",
      name: "relatedPositions",
      title: "Related positions",
      of: [
        {
          type: "reference",
          weak: true,
          to: [{ type: "job" }],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      internalTitle: "internalTitle",
      media: "seo.image",
    },
    prepare({ title, internalTitle, media }) {
      return {
        title: title || internalTitle || "No title",
        media,
      };
    },
  },
});
