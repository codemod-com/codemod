import { migrationPrData } from "../mockData";

export type Widget = {
  kind: "Table";
  title: string;
  workflow: string;
  data: any;
};

export const useWidgets = (campaignId: string) => {
  const widgets: Widget[] = [
    {
      kind: "Table",
      workflow: "incompatible-packages",
      title: "React 18.3.1 incompatible packages",
      data: migrationPrData.data,
    },
  ];

  return widgets;
};
