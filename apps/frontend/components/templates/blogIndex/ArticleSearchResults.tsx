"use client";

import { SanityLink } from "@/components/shared/SanityLink";
import Tag from "@/components/shared/Tag";
import { CUSTOMER_STORY_TAG } from "@/constants";
import type { BlogArticleCardData } from "@/types/object.types";
import { useCallback, useRef } from "react";
import { TextHighlight } from "./TextHighlight";

export const SearchResults = ({
  articlesData,
  query,
  noResultsText,
}: {
  articlesData: BlogArticleCardData[];
  query: string;
  noResultsText: string;
}) => {
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (searchResultsRef.current) {
      searchResultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [searchResultsRef]);

  return (
    <div className="scrollbar-color relative z-40">
      <div className="absolute right-0 top-4 z-10 w-full md:w-96 lg:w-[560px] ">
        <div className="overflow-y border-secondary-dark-light max-h-80 overflow-x-hidden rounded-lg border bg-white dark:border-tertiary-dark dark:bg-background-dark">
          <div className="mx-6 my-2">
            {articlesData.length > 0 ? (
              articlesData.map((article) => (
                <div
                  key={article._id}
                  className="relative cursor-pointer py-4"
                  onClick={handleScroll}
                >
                  {article.pathname && (
                    <SanityLink
                      link={{ _type: "link", href: article.pathname }}
                      className="overlay-link flex flex-col gap-4"
                    >
                      {article._type === "blog.customerStory" ? (
                        <div className="flex gap-[0.625rem]">
                          <Tag>{CUSTOMER_STORY_TAG.label}</Tag>
                        </div>
                      ) : null}
                      {article.tags ? (
                        <div className="flex gap-[0.625rem]">
                          {article.tags.slice(0, 2).map((tag, index) => (
                            <Tag
                              key={tag.slug ?? String(index)}
                              intent="default"
                            >
                              {tag.title}
                            </Tag>
                          ))}
                        </div>
                      ) : null}
                      <h6 className="xs-heading truncate font-bold ">
                        {article.title && (
                          <TextHighlight
                            text={article.title}
                            highlight={query}
                            className="text-primary-light dark:text-primary-dark"
                          />
                        )}
                      </h6>
                    </SanityLink>
                  )}
                </div>
              ))
            ) : (
              <div className="py-2">
                <div className="flex flex-col gap-2">
                  <h6 className="copy-m truncate font-bold dark:text-primary-dark">
                    {noResultsText}
                  </h6>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
