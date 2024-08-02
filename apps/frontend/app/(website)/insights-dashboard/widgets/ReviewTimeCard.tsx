import { CardTile } from "@/app/(website)/insights-dashboard/components/CardTile";
import type { MetricCardProps } from "@/app/(website)/insights-dashboard/types";
import { formatDuration } from "@/app/(website)/insights-dashboard/utils";

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
