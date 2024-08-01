import { CardTile } from "@/app/(website)/insights-dashboard/components/CardTile";
import type { MetricCardProps } from "@/app/(website)/insights-dashboard/types";
import { formatDuration } from "@/app/(website)/insights-dashboard/utils";

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
