import {
  ChartTile,
  type ChartTileProps,
} from "@/app/(website)/insights/[insightId]/components/ChartTile";
import type { ColorConfig } from "@/app/(website)/insights/[insightId]/view/[viewId]/types";

export const prsMergedChartColorSets: ColorConfig[] = [
  {
    line: "#F59E0B",
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
