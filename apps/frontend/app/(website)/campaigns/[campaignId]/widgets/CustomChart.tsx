import {
  ChartTile,
  type ChartTileProps,
} from "@/app/(website)/campaigns/[campaignId]/components/ChartTile";

export const CustomChart = ({
  data,
}: {
  data: ChartTileProps["data"];
}) => <ChartTile title="Custom Chart" data={data} />;
