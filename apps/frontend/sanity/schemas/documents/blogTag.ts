import { isUnique } from "@/sanity/lib/utils";
import { TagIcon } from "@sanity/icons";
import { defineType } from "sanity";

export const blogTag = defineType({
  name: "blog.tag",
  title: "Blog tag",
  type: "document",
  icon: TagIcon,
  options: {
    localized: false,
  },
  fields: [
    {
      type: "string",
      name: "title",
      title: "Title",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "slug",
      title: "Tag's URL-friendly path",
      type: "slug",
      options: {
        source: "title",
        isUnique,
      },
    },
    {
      name: "featuredPosts",
      title: "Featured posts",
      type: "array",
      description:
        "Required. these will show on the collections index when this tag is selected.",
      of: [{ type: "reference", weak: true, to: [{ type: "blog.article" }] }],
      validation: (Rule) => Rule.unique().min(1).max(2),
    },
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        title,
      };
    },
  },
});
