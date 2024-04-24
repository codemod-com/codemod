"use client";

import FilterButton from "@/components/shared/FilterButton";
import Input from "@/components/shared/Input";
import { useRegistryFilters } from "@/hooks/useRegistryFilters";
import type { RegistryIndexPayload } from "@/types";
import type {
  AutomationFilter,
  AutomationFilterIconDictionary,
} from "@/types/object.types";
import { capitalize } from "@/utils/strings";
import { cx } from "cva";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getFilterIcon, getFilterSection } from "./helpers";
import { DEFAULT_FILTER_LENGTH } from "./mock-data/filters";

function getFilteredFilters(
  filters: AutomationFilter["values"],
  query?: string,
) {
  if (!query) return filters.filter((filter) => filter.count > 0);

  return filters?.filter((filter) => {
    return (
      filter?.id?.toLowerCase().slice(0, query?.length) ===
        query.toLowerCase() && filter.count > 0
    );
  });
}

export default function FilterSection(
  props: AutomationFilter & {
    filterIconDictionary?: AutomationFilterIconDictionary;
  } & {
    placeholders?: RegistryIndexPayload["placeholders"];
  },
) {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const search = useSearchParams();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const { handleFilterChange, prefetchFilterChange } = useRegistryFilters();
  const [availableFilters, setAvailableFilters] = useState(
    getFilteredFilters(props.values),
  );

  useEffect(() => {
    const activeFilter = searchParams.get(props.id);
    if (activeFilter) {
      setAvailableFilters(getFilteredFilters(props.values, activeFilter));
    } else {
      setAvailableFilters(getFilteredFilters(props.values));
    }
  }, [props.values, searchParams, props.id]);
  const filterIcons = getFilterSection(props.id, props.filterIconDictionary);

  return (
    <div className="grid w-full flex-col items-start gap-3">
      <h3 className="xs-heading">{props.title}</h3>
      {Number(getFilteredFilters(props.values)?.length) >
        DEFAULT_FILTER_LENGTH && (
        <Input
          placeholder={`Search ${props.title}`}
          icon="search"
          value={searchValue}
          onClear={() => {
            setAvailableFilters(props.values);
            setSearchValue("");
          }}
          inputClassName="placeholder:text-secondary-light dark:placeholder:text-secondary-dark"
          iconClassName="text-secondary-light dark:text-secondary-dark"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchValue(e.target.value);
            setAvailableFilters(
              getFilteredFilters(props.values, e.target.value),
            );
          }}
        />
      )}
      <ul className={cx("m-0 grid w-full gap-xxs")}>
        <>
          {availableFilters?.length === 0 && (
            <div className="body-s flex w-full items-center justify-center text-secondary-light dark:text-secondary-dark">
              <span>No Results</span>
            </div>
          )}
          {availableFilters
            ?.slice(0, DEFAULT_FILTER_LENGTH)
            .map((filter, i) => {
              return (
                <motion.li
                  className="w-full"
                  key={filter.title || `${i}`}
                  initial={{
                    opacity: 1,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.1,
                    delay: i * 0.05,
                  }}
                >
                  <FilterButton
                    count={filter.count}
                    className="w-full items-start"
                    onLoad={() => {
                      prefetchFilterChange(props.id, filter.id);
                    }}
                    image={
                      getFilterIcon(filterIcons, filter.id?.toLowerCase())
                        ?.image
                    }
                    icon={
                      getFilterIcon(filterIcons, filter.id?.toLowerCase())?.icon
                    }
                    intent={
                      searchParams.get(props.id) === filter.id
                        ? "active"
                        : "default"
                    }
                    onClick={() => {
                      handleFilterChange(props.id, filter.id);
                    }}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-left dark:text-primary-dark">
                        {capitalize(filter.title)}
                      </span>
                    </div>
                  </FilterButton>
                </motion.li>
              );
            })}
          {showAllFilters &&
            availableFilters?.slice(DEFAULT_FILTER_LENGTH).map((filter, i) => (
              <motion.li
                className="w-full"
                key={filter.title || `${i}`}
                initial={{
                  opacity: 1,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.1,
                  delay: i * 0.05,
                }}
              >
                <FilterButton
                  count={filter.count}
                  className="w-full"
                  onLoad={() => {
                    prefetchFilterChange(props.id || "", filter.id);
                  }}
                  image={
                    getFilterIcon(filterIcons, filter.id?.toLowerCase())?.image
                  }
                  icon={
                    getFilterIcon(filterIcons, filter.id?.toLowerCase())?.icon
                  }
                  intent={
                    searchParams.get(props.id || "") === filter.id
                      ? "active"
                      : "default"
                  }
                  onClick={() => {
                    handleFilterChange(props.id || "", filter.id);
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-left dark:text-primary-dark">
                      {capitalize(filter.title)}
                    </span>
                  </div>
                </FilterButton>
              </motion.li>
            ))}
        </>
        {searchParams.get(props.id || "") && (
          <FilterButton
            onClick={() => {
              setAvailableFilters(getFilteredFilters(props.values));
              handleFilterChange(props.id || "", "");
            }}
            intent="default"
            className="w-full"
          >
            <div className="flex w-full items-center justify-center text-secondary-light dark:text-secondary-dark">
              Clear
            </div>
          </FilterButton>
        )}
        {Number(availableFilters?.length) > DEFAULT_FILTER_LENGTH && (
          <FilterButton
            onClick={() => setShowAllFilters((prev) => !prev)}
            intent="default"
            className="w-full"
          >
            <div className="flex w-full items-center justify-center text-secondary-light dark:text-secondary-dark">
              {showAllFilters ? "Show less" : "Show all"}
            </div>
          </FilterButton>
        )}
      </ul>
    </div>
  );
}
