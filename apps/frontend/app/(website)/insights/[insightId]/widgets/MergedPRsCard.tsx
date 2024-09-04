import { CardTile } from "@/app/(website)/insights/[insightId]/components/CardTile";
import type { MetricCardProps } from "@/app/(website)/insights/[insightId]/view/[viewId]/types";

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