import { migrationPrData } from "../mockData";

export type Widget = {
  id: string;
  kind: "Table";
  title: string;
  workflow: string;
  data: any;
};

// @TODO fetch from BE
export const useWidgets = (campaignId: string) => {
  const widgets: Widget[] = [
    {
      id: "1",
      kind: "Table",
      workflow: "drift_analyzer",
      title: "React 18.3.1 incompatible packages",
      data: migrationPrData.data,
    },
  ];

  return widgets;
};
