import { migrationPrData } from "../mockData";

export type Widget = {
  id: string;
  kind: "Table" | "Chart";
  title: string;
  workflow: string;
  data: any;
};

export const useWidgets = (campaignId: string) => {
  const widgets: Widget[] = [
    {
      id: "1",
      kind: "Chart",
      workflow: "drift_analyzer",
      title: "Project freshness analysis",
      data: migrationPrData.data,
    },
  ];

  return widgets;
};
