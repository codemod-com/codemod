"use client";

import Searchbar from "@/components/shared/Searchbar";
import useUniversalClosing from "@/hooks/useUniversalClosing";
import type { BlogArticleCardData } from "@/types/object.types";
import { removeSpecialChars } from "@/utils/strings";
import { useEffect, useRef, useState } from "react";
import { SearchResults } from "./ArticleSearchResults";

type ArticleSearchProps = {
  blogSearchNoResults?: string;
  blogSearchPlaceholder?: string;
};

let ArticleSearch = ({
  blogSearchNoResults,
  blogSearchPlaceholder,
}: ArticleSearchProps) => {
  let [searchInput, setSearchInput] = useState("");
  let [loading, setLoading] = useState(false);
  let [articlesData, setArticlesData] = useState<
    BlogArticleCardData[] | null
  >(null);
  let searchRef = useRef<HTMLDivElement>(null);
  let [isSearchOpen, setSearchIsOpen] = useUniversalClosing([searchRef]);

  let getAllBlogArticles = async (textSearch: string) => {
    setLoading(true);
    try {
      let searchText = removeSpecialChars(textSearch).trim();
      let articles = searchText.length
        ? await fetch("/api/search-articles", {
            method: "POST",
            body: JSON.stringify({ textSearch: searchText }),
            cache: "no-cache",
          }).then((res) => res.json())
        : null;

      setArticlesData(articles);
      setLoading(false);
    } catch {
      setArticlesData(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articlesData) {
      setSearchIsOpen(true);
    } else {
      setSearchIsOpen(false);
    }
  }, [articlesData, setSearchIsOpen]);

  return (
    <div ref={searchRef}>
      <Searchbar
        onSearch={getAllBlogArticles}
        query={searchInput}
        setQuery={setSearchInput}
        placeholder={blogSearchPlaceholder ?? ""}
        loading={loading}
        containerClassName="ml-auto overflow-hidden rounded-lg border text-primary-light transition hover:border-tertiary-light lg:w-80 dark:border-tertiary-dark dark:text-primary-dark dark:hover:border-secondary-dark"
        id="blog-search"
      />
      {!loading &&
        articlesData &&
        isSearchOpen &&
        removeSpecialChars(searchInput).trim() && (
          <SearchResults
            articlesData={articlesData}
            query={searchInput}
            noResultsText={blogSearchNoResults ?? ""}
          />
        )}
    </div>
  );
};

export default ArticleSearch;
