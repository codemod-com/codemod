export const automationApplicability = {
  name: "applicability",
  title: "Applicability",
  readOnly: true,
  type: "object",
  fields: [
    {
      name: "from",
      title: "From",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "framework",
              type: "string",
            },
            {
              name: "comparator",
              type: "string",
            },
            {
              name: "version",
              type: "string",
            },
          ],
        },
      ],
    },
    {
      name: "to",
      title: "To",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "framework",
              type: "string",
            },
            {
              name: "comparator",
              type: "string",
            },
            {
              name: "version",
              type: "string",
            },
          ],
        },
      ],
    },
  ],
};
