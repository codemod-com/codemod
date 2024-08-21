import { CardTile } from "@/app/(website)/insights/[insightId]/components/CardTile";
import { formatDuration } from "@/app/(website)/insights/[insightId]/utils";
import type { MetricCardProps } from "@/app/(website)/insights/[insightId]/view/[viewId]/types";

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
