import { CardTile } from "@/app/(website)/campaigns/[campaignId]/components/CardTile";
import { formatDuration } from "@/app/(website)/campaigns/[campaignId]/utils";
import type { MetricCardProps } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/types";

export const TimeSavedCard: React.FC<MetricCardProps> = ({
  data,
  change,
  timePeriod,
}) => (
  <CardTile
    title="Estimated time saving with Codemod"
    value={formatDuration(data)}
    change={change}
    subtitle={`${change > 0 ? "more" : "less"} than previous ${timePeriod}`}
  />
);
