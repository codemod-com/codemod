import { InputWithCharacterCount } from "@/sanity/lib/components/InputWithCharacterCount";
import { defineSection } from "@tinloof/sanity-studio";
import { logoFields } from "../shared/logoFields";

export let sectionHero = defineSection({
  title: "Hero section",
  name: "section.hero",
  type: "object",
  options: {
    collapsible: true,
    collapsed: false,
    variants: [
      {
        assetUrl: "/static/blocks/hero.png",
      },
      {
        assetUrl: "/static/blocks/hero-logo-bar.png",
      },
    ],
  },
  fields: [
    {
      type: "string",
      name: "title",
      validation: (Rule) => Rule.required().max(80),
      description: "Max 80 chars",
      components: {
        input: InputWithCharacterCount,
      },
      options: {
        maxLength: 80,
        minLength: 1,
      },
    },
    {
      type: "text",
      name: "subtitle",
      rows: 3,
      description: "Max 250 chars",
      components: {
        input: InputWithCharacterCount,
      },
      options: {
        maxLength: 250,
        minLength: 0,
      },
    },

    {
      type: "array",
      name: "ctas",
      title: "CTAs",
      validation: (Rule) => Rule.max(2),
      hidden: ({ document }) =>
        document?._type === "pricingPage" || document?._type === "about",
      of: [
        {
          type: "cta",
        },
      ],
    },

    {
      type: "object",
      name: "logoCarousel",
      title: "Logo Carousel",
      hidden: ({ document }) => document?._type === "pricingPage",
      fields: [
        {
          type: "string",
          name: "title",
          title: "Title",
          hidden: ({ document }) => document?._type === "about",
        },
        {
          type: "array",
          name: "logos",
          of: [
            {
              type: "object",
              title: "Logo",
              fields: [
                ...logoFields,
                {
                  type: "string",
                  name: "link",
                  description: "e.g. https://example.com or /about-page",
                  validation: (Rule) => Rule.required(),
                },
              ],
              preview: {
                select: {
                  title: "link",
                  lightModeImage: "lightModeImage",
                  darkModeImage: "darkModeImage",
                },
                prepare(selection) {
                  let { title, lightModeImage, darkModeImage } = selection;
                  return {
                    title: lightModeImage.alt || darkModeImage.alt || title,
                    media: lightModeImage || darkModeImage,
                  };
                },
              },
            },
          ],
        },
      ],
    },
  ],
});
