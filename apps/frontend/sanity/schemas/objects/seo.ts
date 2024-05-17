import { InputWithCharacterCount } from "@/sanity/lib/components/InputWithCharacterCount";
import { defineType } from "sanity";

export let seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    {
      name: "title",
      title: "Title",
      description: "Optional",
      type: "string",
      components: {
        input: InputWithCharacterCount,
      },
      options: {
        maxLength: 70,
        minLength: 15,
      },
    },
    {
      name: "description",
      title: "Short paragraph for SEO & social sharing (meta description)",
      description: "Optional",
      type: "text",
      rows: 2,
      components: {
        input: InputWithCharacterCount,
      },
      options: {
        maxLength: 160,
        minLength: 50,
      },
    },
    {
      name: "image",
      title: "Social sharing image",
      type: "ogImage",
    },
    {
      name: "canonicalUrl",
      title: "Custom canonical URL",
      description:
        "Optional. Use this in case the content of this page is duplicated elsewhere and you'd like to point search engines to that other URL instead",
      type: "url",
    },
  ],
});
