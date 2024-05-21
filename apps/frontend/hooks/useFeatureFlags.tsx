import { FEATURE_FLAG_QUERY_KEY } from "@/utils/strings";
import { useState } from "react";

const useFeatureFlags = () => {
  const [features] = useState(() => {
    const urlParams = new URLSearchParams(window?.location.search);

    const featureFlags = urlParams.get(FEATURE_FLAG_QUERY_KEY) ?? "";
    return featureFlags.split(",");
  });

  return features;
};

export default useFeatureFlags;
