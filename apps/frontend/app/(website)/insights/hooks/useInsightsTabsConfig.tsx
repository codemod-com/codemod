import { useMemo } from "react";

export const useInsightTabsConfig = () => {
  const tabsConfig = useMemo(
    () =>
      [
        {
          kind: "all",
          label: "All",
        },
        {
          kind: "recommended",
          label: "Recommended",
        },
        {
          kind: "featured",
          label: "Featured",
        },
      ] as const,
    [],
  );

  return tabsConfig;
};

export type TabsConfig = ReturnType<typeof useInsightTabsConfig>;
