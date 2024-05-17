import type { BlogIndexPayload } from "@/types";
import { useState } from "react";

export function useLoadMoreArticles({ pageNumber, pathParam }) {
  let [data, setData] = useState<BlogIndexPayload | null>();
  let [loaderState, setQueryState] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  async function loadMore() {
    setQueryState("loading");

    let res = await fetch(`/api/load-articles`, {
      method: "POST",
      body: JSON.stringify({
        pageNumber,
        pathParam,
      }),
    });

    let data = await res.json();

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
