"use client";
import { useTranslation } from "react-i18next";


import Button from "@/components/shared/Button";
import { useLoadMoreArticles } from "@/hooks/useLoadMoreArticles";
import type { BlogIndexPayload } from "@/types";
import type { BlogArticleCardData } from "@/types/object.types";
import { cx } from "cva";
import { useState } from "react";
import BlogArticleCard from "./BlogArticleCard";

export default function ArticleList({
  initial,
  pathParam,
}: {
  initial: (BlogIndexPayload & { entriesPerPage?: number }) | null;
  pathParam?: string;
}) {
const { t } = useTranslation("../../components/templates/blogIndex");

  const [nextPage, setPage] = useState(2);
  const { data, loaderState, loadMore } = useLoadMoreArticles({
    pageNumber: nextPage,
    pathParam,
  });
  const articles = data?.entries || initial?.entries;
  const totalPageCount =
    initial?.entriesCount && initial?.entriesPerPage
      ? Math.ceil(initial?.entriesCount / initial?.entriesPerPage)
      : 1;

  return (
    <>
      <div
        id="list"
        className={cx("mt-2 grid grid-cols-1 gap-[3.75rem] md:grid-cols-2")}
        style={{
          // @ts-ignore
          "--fade-in-duration": "700ms",
        }}
      >
        {articles?.map((entry) => (
          <div key={entry._id} className="animate-fade-in">
            <BlogArticleCard {...(entry as BlogArticleCardData)} />
          </div>
        ))}
      </div>
      <div className="mt-16 flex w-full justify-center">
        {nextPage > totalPageCount ? null : (
          <Button
            onClick={() => {
              loadMore();
              setPage((prev) => prev + 1);
            }}
            disabled={loaderState === "loading" || nextPage > totalPageCount}
            intent="secondary"
            icon={loaderState === "loading" ? "loading" : undefined}
          >{t('load-more')}</Button>
        )}
      </div>
    </>
  );
}
