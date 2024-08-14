import { TableTile } from "@/app/(website)/campaigns/[campaignId]/components/TableTile";
import { useSelectedRepos } from "../hooks/useSelectedRepos";

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
  const selectedRepos = useSelectedRepos();

  const onRefreshData = async () => {
    await getData({
      repo: selectedRepos,
      workflow,
    });
  };

  return <TableTile title={title} data={data} onRefreshData={onRefreshData} />;
};
