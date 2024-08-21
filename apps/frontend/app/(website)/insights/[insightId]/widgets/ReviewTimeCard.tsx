import { CardTile } from "@/app/(website)/insights/[insightId]/components/CardTile";
import { formatDuration } from "@/app/(website)/insights/[insightId]/utils";
import type { MetricCardProps } from "@/app/(website)/insights/[insightId]/view/[viewId]/types";

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
