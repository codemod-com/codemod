import { FEATURE_FLAG_QUERY_KEY } from "@/utils/strings";
import { isServer } from "@studio/config";
import { useState } from "react";

const useFeatureFlags = () => {
  const [features] = useState(() => {
    if (isServer) return [];
    const urlParams = new URLSearchParams(window?.location.search);

    const featureFlags = urlParams.get(FEATURE_FLAG_QUERY_KEY) ?? "";
    return featureFlags.split(",");
  });

  return features;
};

export default useFeatureFlags;
