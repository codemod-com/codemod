import Icon from "@/components/shared/Icon";
import type { AutomationFilter, RegistryCardData } from "@/types/object.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useFetchAutomations({
  limit,
  initial,
}: {
  limit?: number;
  preview?: boolean;
  initial?: RegistryCardData[] | null | undefined;
}) {
  let [data, setData] = useState<{
    data: RegistryCardData[] | null | undefined;
    filters: AutomationFilter[];
    page: number;
    size: number;
    total: number;
  }>({
    data: initial,
    filters: [],
    page: 1,
    size: limit || 4,
    total: 0,
  });

  let [loaderState, setQueryState] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  useEffect(() => {
    setData({
      data: initial,
      filters: [],
      page: 1,
      size: limit || 4,
      total: 0,
    });
  }, [initial, limit]);

  async function fetchAutomations(searchParams: URLSearchParams) {
    setQueryState("loading");

    if (!searchParams || searchParams.toString() === "") {
      setData({
        data: initial,
        filters: [],
        page: 1,
        size: limit || 4,
        total: 0,
      });

      return;
    }
    let res = await fetch(`/api/load-codemods`, {
      method: "POST",
      body: JSON.stringify({
        pageNumber: 1,
        searchParams: searchParams.toString(),
        entriesPerPage: limit || 4,
      }),
    });

    let automationList = await res.json();

    if (res.status === 200) {
      setQueryState("success");

      setData(automationList);
    } else {
      setQueryState("error");
      setData({
        data: data.data,
        filters: data.filters,
        page: 1,
        size: limit || 4,
        total: 0,
      });
      toast("An error occured while loading data. Please refresh.", {
        icon: (
          <Icon
            name="refresh"
            className="text-primary-light dark:text-accent"
          />
        ),
        className: "flex items-center gap-xs",
      });
    }
  }

  return {
    data,
    loaderState,
    fetchAutomations,
  };
}
