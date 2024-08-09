import { TableTile } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/components/TableTile";

export const CustomTable = <T,>({
  title = "Custom table",
  data,
}: {
  title?: string;
  data: T[];
}) => <TableTile title={title} data={data} />;
