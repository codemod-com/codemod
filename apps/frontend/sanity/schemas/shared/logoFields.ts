export const logoFields = [
  {
    name: "lightModeImage",
    title: "Light Mode Logo",
    type: "image",
    description: "Please use a dark logo",
    validation: (Rule) => Rule.required(),
    fields: [
      {
        type: "string",
        name: "alt",
        validation: (Rule) => Rule.required(),
      },
    ],
  },
  {
    name: "darkModeImage",
    title: "Dark Mode Logo",
    type: "image",
    description: "Please use a light logo",
    validation: (Rule) => Rule.required(),
    fields: [
      {
        type: "string",
        name: "alt",
        validation: (Rule) => Rule.required(),
      },
    ],
  },
];
