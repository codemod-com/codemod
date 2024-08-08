import { CardTile } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/components/CardTile";
import type { MetricCardProps } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/types";

export const MergedPRsCard: React.FC<MetricCardProps> = ({
  data,
  change,
  timePeriod,
}) => (
  <CardTile
    title="Auto-generated PRs merged"
    value={String(data)}
    change={change}
    subtitle={`compared to previous ${timePeriod}`}
  />
);
