import { defineType } from "sanity";

export const ogImage = defineType({
  name: "ogImage",
  title: "Social sharing image",
  description:
    "Optional but highly encouraged for increasing conversion rates for links to this page shared in social media.",
  type: "image",
});
