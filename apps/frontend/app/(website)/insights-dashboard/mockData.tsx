import {
  CardTileProps,
  ChartTileProps,
  TableColumnKey,
  MigrationPrTable,
  TableTileProps
} from "@/app/(website)/insights-dashboard/types";
import { User } from "@/app/(website)/insights-dashboard/components/User";

export const cardData: CardTileProps[] = [
  {
    title: "Estimated time saving",
    value: "130h 30m",
    change: { value: 23, isPositive: true },
    subtitle: "more than previous 3 months"
  },
  {
    title: "Review time for auto-generated PRs",
    value: "1m 30s",
    change: { value: 16, isPositive: false },
    subtitle: "slower than previous 3 months"
  },
  {
    title: "Auto-generated PRs merged",
    value: 106,
    change: { value: 10, isPositive: true },
    subtitle: "compared to previous 3 months"
  }
];



export const depreciatedAPIData = {
  useContextReact18: [
    { timestamp: new Date('2023-06-01').getTime(), value: 18 },
    { timestamp: new Date('2023-07-01').getTime(), value: 10 },
    { timestamp: new Date('2023-08-01').getTime(), value: 2 },
  ],
  useReact19: [
    { timestamp: new Date('2023-06-01').getTime(), value: 2 },
    { timestamp: new Date('2023-07-01').getTime(), value: 10 },
    { timestamp: new Date('2023-08-01').getTime(), value: 18 },
  ],
};

export const prsMergedData = {
  removeMemoizationHooks: [
    { timestamp: new Date('2023-06-01').getTime(), value: 5 },
    { timestamp: new Date('2023-07-01').getTime(), value: 15 },
    { timestamp: new Date('2023-08-01').getTime(), value: 12 },
  ],
};


export const tableData: TableTileProps<MigrationPrTable> = {
  title: "React 18 to 19 Migration PRs",
  data: [
    {
      task: "Linear - CDMD 1253",
      pr: "codemod-dd-312837761",
      status: "In Review",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/78830094?s=16&v=4",
        name: 'codemod',
      },
      filesChanged: 55,
      timeSaving: "13h 35m"
    },
    {
      task: "Linear - CDMD 1252",
      pr: "codemod-dd-2516551",
      status: "Merged",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/78830094?s=16&v=4",
        name: 'codemod',
      },
      filesChanged: 12,
      timeSaving: "9h 00m"
    },
    {
      task: "Linear - CDMD 1251",
      pr: "codemod-dd-321-565",
      status: "Merged",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/78830094?s=16&v=4",
        name: 'codemod',
      },
      filesChanged: 6,
      timeSaving: "5h 35m"
    },
  ],
  columns: [
    { key: 'task', title: 'Task' },
    { key: 'pr', title: 'PR' },
    { key: 'status', title: 'PR status' },
    { key: 'reviewer', title: 'Reviewer' },
    { key: 'filesChanged', title: 'Files changed' },
    { key: 'timeSaving', title: 'Time saving' },
  ]
};