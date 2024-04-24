import GradientBorderBox from "@/components/shared/GradientBorderBox";
import { CUSTOMER_STORY_TAG } from "@/constants";
import type { BlogArticleCardData } from "@/types/object.types";
import { cx } from "cva";
import { Suspense } from "react";
import ArticleSearch from "./ArticleSearch";
import BlogArticleCard from "./BlogArticleCard";
import type { BlogIndexProps } from "./BlogIndex";
import TagsFilter from "./TagsFilter";

export default function BlogIndexHero(props: BlogIndexProps) {
  const activeTagSlug = props.pathParam;
  const activeTag = props.data?.blogTags?.find(
    (tag) => tag.slug.current === activeTagSlug,
  );
  const activeTagTitle = activeTag?.title;
  const isCustomerStory = activeTagSlug === CUSTOMER_STORY_TAG.value;

  const featuredPosts = props.data?.featuredPosts?.filter(Boolean);

  return (
    <div
      className={cx("header mb-6 ", {
        "lg:mb-16": !!featuredPosts?.length,
        "lg:mb-0": !featuredPosts?.length,
      })}
    >
      <div className="controls mb-2 flex flex-col-reverse gap-8 md:flex-row-reverse md:justify-between  lg:items-start lg:gap-6 ">
        <div className={cx("relative")}>
          <Suspense>
            <ArticleSearch
              blogSearchNoResults="No results were found, try another search"
              blogSearchPlaceholder="Search"
            />
          </Suspense>
        </div>
        <Suspense>
          <div className="md:w-1/2 md:max-w-md">
            <TagsFilter
              pathParam={props.pathParam}
              defaultFilterTitle={props.data?.defaultFilterTitle}
              tags={props.data?.blogTags}
            />
          </div>
        </Suspense>
      </div>
      {!!featuredPosts?.length && (
        <h1 className="l-heading mb-8 mt-8">
          {isCustomerStory
            ? CUSTOMER_STORY_TAG.label
            : activeTagTitle || props.data?.title}
        </h1>
      )}
      {featuredPosts?.length ? (
        <div
          style={{
            // @ts-ignore
            "--fade-in-duration": "700ms",
          }}
          className="featuredPosts grid animate-fade-in grid-cols-1 md:grid-cols-2"
        >
          {featuredPosts?.map(
            (entry, idx) =>
              entry?._id && (
                <GradientBorderBox
                  sidesClassNames={{
                    right: idx === 0 ? "block md:hidden" : "",
                    top: idx > 0 ? "hidden md:block" : "",
                  }}
                  key={entry._id}
                >
                  <div key={entry._id} className="m-10">
                    <BlogArticleCard
                      variant="featured"
                      {...(entry as BlogArticleCardData)}
                    />
                  </div>
                </GradientBorderBox>
              ),
          )}
        </div>
      ) : null}
    </div>
  );
}
