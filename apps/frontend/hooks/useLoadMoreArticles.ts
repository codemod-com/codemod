import type { BlogIndexPayload } from "@/types";
import { useState } from "react";

export function useLoadMoreArticles({ pageNumber, pathParam }) {
  const [data, setData] = useState<BlogIndexPayload | null>();
  const [loaderState, setQueryState] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  async function loadMore() {
    setQueryState("loading");

    const res = await fetch(`/api/load-articles`, {
      method: "POST",
      body: JSON.stringify({
        pageNumber,
        pathParam,
      }),
    });

    const data = await res.json();

    if (res.status === 200) {
      setQueryState("success");
      setData(data.data);
    } else {
      setQueryState("error");
    }
  }

  return {
    loaderState,
    data,
    loadMore,
  };
}
