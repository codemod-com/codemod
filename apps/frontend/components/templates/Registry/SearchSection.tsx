"use client";

import Button from "@/components/shared/Button";
import Icon from "@/components/shared/Icon";
import Input from "@/components/shared/Input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { useSidebar } from "./context";

export default function SearchSection({
  placeholder,
  path,
}: {
  placeholder?: string;
  path?: string;
}) {
  let router = useRouter();
  let search = useSearchParams();
  let pathname = usePathname();
  let [searchInput, setSearchInput] = useState(search.get("q") || "");

  let [loading, setLoading] = useState(false);
  let { toggleSidebar } = useSidebar();
  let onSearch = async (query: string) => {
    try {
      let newParams = new URLSearchParams(search.toString());

      if (query) {
        newParams.set("q", query);
      } else {
        newParams.delete("q");
      }

      router.push(`${path ?? pathname}?${newParams.toString()}`, {
        scroll: false,
      });
    } catch {
      setLoading(false);
    }
  };
  let inputWrapperRef = React.useRef<HTMLInputElement>(null);

  useDebounce(
    () => {
      if (path && !searchInput) return;
      onSearch(searchInput);
    },
    250,
    [searchInput],
  );

  function handleSearch(searchQuery: string) {
    setSearchInput(searchQuery);
    setLoading(searchQuery.length > 0);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.metaKey && event.key === "k") {
      event.preventDefault();
      inputWrapperRef.current?.querySelector("input")?.focus();
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!search.get("q") && searchInput) {
      setSearchInput("");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col items-start gap-3 overflow-x-clip pt-5 lg:flex-row lg:items-center lg:pb-xl">
      <div className="flex w-full flex-1 items-center gap-2">
        <Button intent="secondary-icon-only" onClick={() => toggleSidebar()}>
          <Icon name="filter" />
        </Button>

        <div
          ref={inputWrapperRef}
          onClick={() => {
            inputWrapperRef.current?.querySelector("input")?.focus();
          }}
          className="w-full"
        >
          <Input
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            icon={loading ? "codemod-dot-pulse" : "search"}
            command={searchInput ? undefined : "⌘K"}
            onClear={() => {
              setSearchInput("");
            }}
            value={searchInput}
            inputClassName="placeholder:text-secondary-light dark:placeholder:text-secondary-dark"
            iconClassName="text-secondary-light dark:text-secondary-dark w-5 h-5"
          />
        </div>
      </div>
    </div>
  );
}
