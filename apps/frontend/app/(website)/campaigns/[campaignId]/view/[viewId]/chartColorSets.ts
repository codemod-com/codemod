import type {
  ChartType,
  ColorConfig,
} from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/types";

export const chartColorSets: Record<ChartType, ColorConfig[]> = {
  depreciatedAPI: [
    {
      line: "#60A5FA", // Jasnoniebieski
      gradientStart: "#93C5FD",
      gradientEnd: "#EFF6FF",
    },
    {
      line: "#4ADE80", // Jasnozielony
      gradientStart: "#86EFAC",
      gradientEnd: "#ECFDF5",
    },
  ],
  prsMerged: [
    {
      line: "#F59E0B", // Pomarańczowy
      gradientStart: "#FCD34D",
      gradientEnd: "#FFFBEB",
    },
  ],
};
