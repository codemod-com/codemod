import {
  ChartTile,
  type ChartTileProps,
} from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/components/ChartTile";
import type { ColorConfig } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/types";

export const prsMergedChartColorSets: ColorConfig[] = [
  {
    line: "#F59E0B", // Pomarańczowy
    gradientStart: "#FCD34D",
    gradientEnd: "#FFFBEB",
  },
];

export const PrsMergedChart = ({
  data,
}: {
  data: ChartTileProps["data"];
}) => (
  <ChartTile
    title="PRs merged"
    colorSets={prsMergedChartColorSets}
    data={data}
  />
);
