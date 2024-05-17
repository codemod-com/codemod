import { defineField } from "sanity";

export let seoField = defineField({
  name: "seo",
  title: "SEO & social",
  type: "seo",
  options: { collapsible: true, collapsed: false },
  group: "settings",
});
