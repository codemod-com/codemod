import { FEATURE_FLAG_QUERY_KEY } from "@/utils/strings";
import { isServer } from "@studio/config";
import { useState } from "react";

let useFeatureFlags = () => {
  let [features] = useState(() => {
    if (isServer) return [];
    let urlParams = new URLSearchParams(window?.location.search);

    let featureFlags = urlParams.get(FEATURE_FLAG_QUERY_KEY) ?? "";
    return featureFlags.split(",");
  });

  return features;
};

export default useFeatureFlags;
