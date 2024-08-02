import { useMemo } from "react";

export const useCampaignTabsConfig = () => {
  const tabsConfig = useMemo(
    () =>
      [
        {
          kind: "my",
          label: "My Campaigns",
        },
        {
          kind: "all_available",
          label: "All Campaigns",
        },
      ] as const,
    [],
  );

  return tabsConfig;
};

export type TabsConfig = ReturnType<typeof useCampaignTabsConfig>;
