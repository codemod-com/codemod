import type {
  ChartType,
  ColorConfig,
} from "@/app/(website)/insights/[insightId]/types";

export const chartColorSets: Record<ChartType, ColorConfig[]> = {
  depreciatedAPI: [
    {
      line: "#60A5FA",
      gradientStart: "#93C5FD",
      gradientEnd: "#EFF6FF",
    },
    {
      line: "#4ADE80",
      gradientStart: "#86EFAC",
      gradientEnd: "#ECFDF5",
    },
  ],
  prsMerged: [
    {
      line: "#F59E0B",
      gradientStart: "#FCD34D",
      gradientEnd: "#FFFBEB",
    },
  ],
};
