import { useState } from "react";
import { migrationPrData } from "../mockData";

export type Widget = {
  id: string;
  kind: "Table" | "Chart";
  title: string;
  workflow: string;
  data: any;
};

export const useWidgets = (insightId: string) => {
  // @TODO from BE
  const [widgets] = useState<Widget[]>(() => [
    {
      id: "1",
      kind: "Chart",
      workflow: "drift_analyzer",
      title: "Project freshness analysis",
      data: migrationPrData.data,
    },
  ]);

  return widgets;
};
