import { BlockContentIcon, StarIcon } from "@sanity/icons";
import { defineSection } from "@tinloof/sanity-studio";

export const features = defineSection({
  title: "Features Section",
  name: "section.features",
  type: "object",
  options: {
    variants: [
      {
        assetUrl: "/static/blocks/features.png",
      },
    ],
  },
  icon: StarIcon,
  fields: [
    {
      type: "array",
      name: "features",
      title: "Features",
      description:
        "The third feature will be displayed as a large card. The rest will be small cards.",
      validation: (Rule) => Rule.min(2).max(5),
      options: {
        sortable: false,
      },
      of: [
        {
          type: "object",
          icon: BlockContentIcon,
          fields: [
            {
              name: "background",
              title: "Background",
              type: "object",
              fields: [
                {
                  name: "light",
                  title: "Light Version",
                  type: "object",
                  fields: [
                    {
                      name: "type",
                      title: "Type",
                      type: "string",
                      options: {
                        list: [
                          { title: "Image", value: "image" },
                          { title: "Video", value: "video" },
                        ],
                        layout: "radio",
                      },
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: "asset",
                      title: "Asset",
                      type: "mux.video",
                      hidden: ({ parent }) => parent?.type !== "video",
                    },
                    {
                      name: "image",
                      title: "Image",
                      type: "image",
                      hidden: ({ parent }) => parent?.type !== "image",
                    },
                  ],
                },
                {
                  name: "dark",
                  title: "Dark Version",
                  type: "object",
                  fields: [
                    {
                      name: "type",
                      title: "Type",
                      type: "string",
                      options: {
                        list: [
                          { title: "Image", value: "image" },
                          { title: "Video", value: "video" },
                        ],
                        layout: "radio",
                      },
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: "asset",
                      title: "Asset",
                      type: "mux.video",
                      hidden: ({ parent }) => parent?.type !== "video",
                    },
                    {
                      name: "image",
                      title: "Image",
                      type: "image",
                      hidden: ({ parent }) => parent?.type !== "image",
                    },
                  ],
                },
              ],
            },
            {
              type: "string",
              name: "tag",
              title: "Tag",
            },
            {
              type: "string",
              name: "title",
              title: "Title",
              validation: (Rule) => Rule.required(),
            },
            {
              type: "text",
              name: "description",
              title: "Description",
            },
            {
              type: "string",
              name: "snippet",
              title: "Code Snippet",
              description: "A code snippet to be displayed in the feature card",
            },
            {
              type: "string",
              name: "toastText",
              title: "Toast Text",
              description:
                "Text to display in the confirmation toast. Defaults to 'Copied command to clipboard'",
            },
            {
              name: "cta",
              title: "Call to action",
              type: "link",
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      features: "features",
    },
    prepare(selection) {
      const { features } = selection;
      return {
        title: "Features Section",
        subtitle: `${features?.length || "0"} feature${
          Number(features?.length) > 1 ? "s" : ""
        }`,
      };
    },
  },
});
