import { defineField } from "sanity";

export const seoField = defineField({
  name: "seo",
  title: "SEO & social",
  type: "seo",
  options: { collapsible: true, collapsed: false },
  group: "settings",
});
