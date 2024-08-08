import { CardTile } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/components/CardTile";
import type { MetricCardProps } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/types";
import { formatDuration } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/utils";

export const ReviewTimeCard: React.FC<MetricCardProps> = ({
  data,
  change,
  timePeriod,
}) => (
  <CardTile
    title="Review time for auto-generated PRs"
    value={formatDuration(data)}
    change={change}
    subtitle={`${change > 0 ? "slower" : "faster"} than previous ${timePeriod}`}
  />
);
