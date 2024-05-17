import Tag from "@/components/shared/Tag";
import { CUSTOMER_STORY_TAG } from "@/constants";
import type { BlogIndexPayload } from "@/types";
import Link from "next/link";

type FilterUIProps = {
  tags: BlogIndexPayload["blogTags"];
  defaultFilterTitle?: string;
  pathParam?: string;
};

type FilterOption = {
  value: string;
  label: string;
};

export default function TagsFilter({
  tags,
  defaultFilterTitle = "All",
  pathParam,
}: FilterUIProps) {
  if (!tags?.length) {
    return null;
  }

  let currentTag = pathParam || "blog";

  let defaultOption: FilterOption = {
    value: "blog",
    label: defaultFilterTitle,
  };
  let customerStory: FilterOption = CUSTOMER_STORY_TAG;
  let renderedOptions = [
    defaultOption,
    customerStory,
    ...(tags
      .map((tag) =>
        !tag.slug.current
          ? null
          : {
              value: tag.slug.current,
              label: tag.title,
            },
      )
      .filter(Boolean) as Array<FilterOption>),
  ];

  return (
    <div className="flex flex-wrap gap-4 lg:gap-4">
      {renderedOptions.map((option) => (
        <Link
          className="border-none"
          href={
            option.value === defaultOption.value
              ? "/blog"
              : `/blog/tag/${option.value}`
          }
          key={option.value}
        >
          <Tag intent={currentTag === option.value ? "primary" : "default"}>
            {option.label}
          </Tag>
        </Link>
      ))}
    </div>
  );
}
