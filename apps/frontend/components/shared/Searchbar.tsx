"use client";

import { cx } from "cva";
import { type KeyboardEvent, useRef } from "react";
import { useDebounce } from "react-use";
import Icon from "./Icon";

type SearchbarProps = {
  placeholder?: string;
  onSearch: (query: string) => void;
  containerClassName?: string;
  className?: string;
  query: string;
  setQuery: (query: string) => void;
  loading?: boolean;
  onChange?: () => void;
  keydownHandler?: (event: KeyboardEvent) => void;
  id: string;
};

export default function Searchbar({
  placeholder,
  onSearch,
  containerClassName,
  className,
  query,
  setQuery,
  loading,
  onChange,
  keydownHandler = () => {},
  id,
}: SearchbarProps) {
  const ref = useRef<HTMLInputElement>(null);
  useDebounce(
    () => {
      onSearch(query);
    },
    250,
    [query],
  );

  const handleSearch = (searchQuery: string) => {
    onChange?.();
    setQuery(searchQuery);
  };

  return (
    <div className={cx("relative w-full rounded-[1.5rem]", containerClassName)}>
      {loading ? (
        <Icon
          name="loading"
          className="absolute left-[1rem] top-[25%] h-5 w-5 animate-spin text-secondary-light dark:text-secondary-dark"
        />
      ) : (
        <Icon
          name="search"
          className="absolute left-[1rem] top-1/2 h-5 w-5 -translate-y-1/2 text-secondary-light dark:text-secondary-dark"
        />
      )}
      <input
        ref={ref}
        aria-label="Search"
        type="text"
        className={cx(
          "body-m bg-white placeholder:text-secondary-light  dark:bg-primary-light dark:placeholder:text-secondary-dark",
          "h-9  w-full appearance-none pl-11 outline-none",
          {
            "pr-10.5": query !== "",
          },
          className,
        )}
        placeholder={placeholder ?? "Search"}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={keydownHandler}
      />
      {query !== "" ? (
        <button id={`btn-searchbar-${id}-clear`} onClick={() => setQuery("")}>
          <Icon
            name="close"
            className="absolute right-3  top-1/2 h-5 w-5 -translate-y-1/2"
          />
        </button>
      ) : null}
    </div>
  );
}
