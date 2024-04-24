"use client";

import RegistryCard from "@/components/templates/Registry/RegistryCard";
import useInView from "@/hooks/useInView";
import { useLoadMoreAutomations } from "@/hooks/useLoadMoreAutomations";
import type { RegistryIndexPayload } from "@/types";
import { cx } from "cva";

import Button from "@/components/shared/Button";
import Icon from "@/components/shared/Icon";
import { useRegistryFilters } from "@/hooks/useRegistryFilters";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

export default function CodemodList({
  initial,
}: {
  initial: (RegistryIndexPayload & { entriesPerPage?: number }) | null;
}) {
  const { toggleFilters } = useRegistryFilters();
  const searchParams = useSearchParams();
  const [nextPage, setPage] = useState(2);
  const { data, loaderState, loadMore } = useLoadMoreAutomations({
    pageNumber: nextPage,
    searchParams,
    initial: initial?.entries || [],
    entriesPerPage: initial?.entriesPerPage || 20,
    total: initial?.total || 0,
  });

  const { ref, inView } = useInView({
    threshold: 1,
  });

  useEffect(() => {
    // Reset infinite loading when filters change
    setPage(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const registryCards = data.data;

  const totalPageCount =
    initial?.total && initial?.entriesPerPage
      ? Math.ceil(initial?.total / initial?.entriesPerPage)
      : 1;

  useDebounce(
    () => {
      if (inView && nextPage <= totalPageCount && loaderState !== "loading") {
        loadMore();
        setPage((prev) => prev + 1);
      }
    },
    250,
    [inView, loadMore, nextPage, totalPageCount],
  );
  return (
    <>
      <div className="flex w-full flex-col">
        <div
          id="list"
          className={cx("mt-2")}
          style={{
            // @ts-ignore
            "--fade-in-duration": "700ms",
          }}
        >
          <ul className="m-0 flex w-full animate-fade-in flex-col divide-y-[1px] divide-border-light dark:divide-border-dark">
            {!!registryCards?.length ? (
              registryCards?.map((entry) => (
                <RegistryCard
                  filterIconDictionary={initial?.filterIconDictionary}
                  {...entry}
                  key={entry.id}
                  verifiedTooltip={
                    initial?.placeholders?.verifiedAutomationTooltip
                  }
                />
              ))
            ) : (
              <div className="mx-auto flex w-full max-w-fit flex-col items-center justify-center gap-2 py-20">
                <div className="flex items-center justify-center rounded-full bg-emphasis-light/5 p-2 dark:bg-emphasis-dark/5">
                  <Icon name="search-x" className="relative left-px h-5 w-5" />
                </div>
                <h5 className="body-s mb-2 text-secondary-light/60 dark:text-secondary-dark/60">
                  {initial?.placeholders?.emptyStateText}
                </h5>
                <Button intent="secondary" onClick={() => toggleFilters(true)}>
                  Clear filters
                </Button>
              </div>
            )}
          </ul>
        </div>
        <div className="mt-16 w-full">
          <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="TRIGGER mt-10 flex h-2 w-full justify-center"
          >
            {loaderState === "loading" && (
              <Icon
                name="loading"
                className="h-10 w-10 animate-spin opacity-40"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
