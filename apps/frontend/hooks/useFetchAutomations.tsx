import Icon from "@/components/shared/Icon";
import type {
  AutomationAPISearchResponse,
  AutomationFilter,
  RegistryCardData,
} from "@/types/object.types";
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
  const [data, setData] = useState<{
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

  const [loaderState, setQueryState] = useState<
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
    try {
      const res = await fetch(`/api/load-codemods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          pageNumber: 1,
          searchParams: searchParams?.toString?.() ?? "",
          entriesPerPage: limit || 4,
        }),
      });

      const json = (await res
        .json()
        .catch(() => null)) as Partial<AutomationAPISearchResponse> | null;

      if (res.ok && json) {
        setQueryState("success");
        setData({
          data: Array.isArray(json.data) ? json.data : [],
          filters: Array.isArray(json.filters) ? json.filters : [],
          page: Number(json.page ?? 1) || 1,
          size: Number(json.size ?? (limit || 4)) || (limit || 4),
          total: Number(json.total ?? 0) || 0,
        });
      } else {
        throw new Error("Failed to load automations");
      }
    } catch (error) {
      console.log(error)
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
