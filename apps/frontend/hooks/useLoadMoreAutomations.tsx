import Icon from "@/components/shared/Icon";
import type { RegistryIndexPayload } from "@/types";
import type { AutomationAPIListResponse } from "@/types/object.types";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useLoadMoreAutomations({
  pageNumber,
  searchParams,
  initial,
  entriesPerPage,
  total,
}: {
  pageNumber: number;
  searchParams: URLSearchParams;
  entriesPerPage: number;
  initial: RegistryIndexPayload["entries"];
  total: number;
}) {
  const [data, setData] = useState<AutomationAPIListResponse>({
    data: initial,
    page: pageNumber,
    size: entriesPerPage,
    total,
  });
  const [loaderState, setQueryState] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  useEffect(() => {
    setData({ data: initial, page: pageNumber, size: entriesPerPage, total });
  }, [initial, pageNumber, entriesPerPage, total]);

  async function loadMore() {
    setQueryState("loading");

    const res = await fetch(`/api/load-codemods`, {
      method: "POST",
      body: JSON.stringify({
        pageNumber,
        searchParams: searchParams.toString(),
        entriesPerPage,
      }),
    });

    const moreAutomations: AutomationAPIListResponse = await res.json();

    if (res.status === 200 && data && moreAutomations.data) {
      setQueryState("success");

      setData({
        data: [...(data?.data || []), ...moreAutomations.data],
        page: pageNumber,
        size: entriesPerPage,
        total,
      });
    } else {
      setQueryState("error");
      setData({
        data: data.data,
        page: pageNumber,
        size: entriesPerPage,
        total,
      });
      toast("An error occured while loading data. Please refresh.", {
        icon: (
          <Icon
            name="refresh"
            className="text-primary-light dark:text-accent"
          />
        ),
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
        className: "flex items-center gap-xs",
      });
    }
  }

  return {
    data,
    loaderState,
    loadMore,
  };
}
