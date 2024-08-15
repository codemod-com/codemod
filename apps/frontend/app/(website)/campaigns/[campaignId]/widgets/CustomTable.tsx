import { TableTile } from "@/app/(website)/campaigns/[campaignId]/components/TableTile";

export const CustomTable = <T,>({
  title = "Custom table",
  data,
  workflow,
  loading,
  error,
  getData,
}: {
  title?: string;
  data: T[];
  workflow: string;
  loading: boolean;
  error: string;
  getData(args: any): Promise<any>;
}) => {
  const onRefreshData = async () => {
    await getData(workflow);
  };

  return (
    <TableTile
      loading={loading}
      error={error}
      title={title}
      data={data}
      onRefreshData={onRefreshData}
    />
  );
};
