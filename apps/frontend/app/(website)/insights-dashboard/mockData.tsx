import type {
  DataPoint,
  MigrationPrTable,
  MigrationPrTableProps,
  TableTileProps,
} from "@/app/(website)/insights-dashboard/types";

const currentDate = new Date();
export type CardTileData = {
  title: string;
  value: string | number;
  change: number;
  subtitle: string;
};

export type CardDataObject = {
  [key: string]: CardTileData;
};
export const cardData: CardDataObject = {
  timeSaving: {
    title: "Estimated time saving",
    value: "PT130H30M",
    change: 23,
    subtitle: "more than previous 3 months",
  },
  reviewTime: {
    title: "Review time for auto-generated PRs",
    value: "PT1M30S", // ISO 8601 duration format
    change: -16,
    subtitle: "slower than previous 3 months",
  },
  mergedPRs: {
    title: "Auto-generated PRs merged",
    value: 106, // This remains a number as it's not a duration
    change: 10,
    subtitle: "compared to previous 3 months",
  },
};

const driftDataArray: DataPoint[] = [
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: currentDate.getTime(),
    value: 0,
  },
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: new Date(currentDate.getTime() + 86400000).getTime(), // +1 day
    value: 8.046708693539223,
  },
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: new Date(currentDate.getTime() + 2 * 86400000).getTime(), // +2 days
    value: 8.046708693539223,
  },
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: new Date(currentDate.getTime() + 3 * 86400000).getTime(), // +3 days
    value: 16.112582736127365,
  },
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: new Date(currentDate.getTime() + 4 * 86400000).getTime(), // +4 days
    value: 16.112582736127365,
  },
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: new Date(currentDate.getTime() + 5 * 86400000).getTime(), // +5 days
    value: 20.613701855616473,
  },
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: new Date(currentDate.getTime() + 6 * 86400000).getTime(), // +6 days
    value: 20.613701855616473,
  },
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: new Date(currentDate.getTime() + 7 * 86400000).getTime(), // +7 days
    value: 20.613701855616473,
  },
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: new Date(currentDate.getTime() + 8 * 86400000).getTime(), // +8 days
    value: 20.613701855616473,
  },
  {
    kind: "real_drift",
    package: "test-package",
    timestamp: new Date(currentDate.getTime() + 9 * 86400000).getTime(), // +9 days
    value: 16.41922832091008,
  },
];

export const depreciatedAPIData = [
  {
    title: "useContextReact18",
    data: [
      { timestamp: new Date("2023-06-01").getTime(), value: 18 },
      { timestamp: new Date("2023-07-01").getTime(), value: 10 },
      { timestamp: new Date("2023-08-01").getTime(), value: 2 },
    ],
  },
  {
    title: "useReact19",
    data: [
      { timestamp: new Date("2023-06-01").getTime(), value: 2 },
      { timestamp: new Date("2023-07-01").getTime(), value: 10 },
      { timestamp: new Date("2023-08-01").getTime(), value: 18 },
    ],
  },
];

export const prsMergedData = [
  {
    title: "removeMemoizationHooks",
    data: [
      { timestamp: new Date("2023-06-01").getTime(), value: 5 },
      { timestamp: new Date("2023-07-01").getTime(), value: 15 },
      { timestamp: new Date("2023-08-01").getTime(), value: 12 },
    ],
  },
];

export const tableData: TableTileProps<MigrationPrTable> = {
  title: "React 18 to 19 Migration PRs",
  data: [
    {
      task: "Linear - CDMD 1253",
      pr: "codemod-dd-312837761",
      status: "In Review",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/78830094?s=16&v=4",
        name: "codemod",
      },
      filesChanged: 55,
      timeSaving: "13h 35m",
    },
    {
      task: "Linear - CDMD 1252",
      pr: "codemod-dd-2516551",
      status: "Merged",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/78830094?s=16&v=4",
        name: "codemod",
      },
      filesChanged: 12,
      timeSaving: "9h 00m",
    },
    {
      task: "Linear - CDMD 1251",
      pr: "codemod-dd-321-565",
      status: "Merged",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/78830094?s=16&v=4",
        name: "codemod",
      },
      filesChanged: 6,
      timeSaving: "5h 35m",
    },
  ],
};

export const migrationPrData: MigrationPrTableProps = {
  title: "React 18 to 19 Migration PRs",
  data: [
    {
      task: "Linear - CDMD 1253",
      pr: "codemod-dd-312837761",
      status: "In Review",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/78830094?s=16&v=4",
        name: "Alex",
      },
      filesChanged: 55,
      timeSaving: "13h 35m",
    },
    {
      task: "Linear - CDMD 1252",
      pr: "codemod-dd-2516551",
      status: "Merged",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/12345678?s=16&v=4",
        name: "Emma",
      },
      filesChanged: 12,
      timeSaving: "9h 00m",
    },
    {
      task: "Linear - CDMD 1251",
      pr: "codemod-dd-321-565",
      status: "Merged",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/87654321?s=16&v=4",
        name: "Michael",
      },
      filesChanged: 6,
      timeSaving: "5h 35m",
    },
    {
      task: "Linear - CDMD 1250",
      pr: "codemod-dd-987654",
      status: "In Review",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/23456789?s=16&v=4",
        name: "Sophia",
      },
      filesChanged: 23,
      timeSaving: "7h 45m",
    },
    {
      task: "Linear - CDMD 1249",
      pr: "codemod-dd-456789",
      status: "Merged",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/34567890?s=16&v=4",
        name: "Daniel",
      },
      filesChanged: 8,
      timeSaving: "3h 20m",
    },
    {
      task: "Linear - CDMD 1248",
      pr: "codemod-dd-135790",
      status: "In Review",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/45678901?s=16&v=4",
        name: "Olivia",
      },
      filesChanged: 17,
      timeSaving: "6h 10m",
    },
    {
      task: "Linear - CDMD 1247",
      pr: "codemod-dd-246801",
      status: "Merged",
      reviewer: {
        imageUrl: "https://avatars.githubusercontent.com/u/56789012?s=16&v=4",
        name: "Ethan",
      },
      filesChanged: 31,
      timeSaving: "11h 55m",
    },
  ],
};

export const heroData = [
  {
    user: {
      imageUrl: "https://avatars.githubusercontent.com/u/78830094?s=16&v=4",
      name: "Alex",
    },
    codemodsCreated: 12,
    prsReviewed: 14,
    averageReviewTime: "2m 13s",
    timeToFirstReview: "1h",
    linesOfCodeDeleted: 9543,
    linesOfCodeAdded: 8154,
  },
  {
    user: {
      imageUrl: "https://avatars.githubusercontent.com/u/12345678?s=16&v=4",
      name: "Emma",
    },
    codemodsCreated: 8,
    prsReviewed: 22,
    averageReviewTime: "3m 45s",
    timeToFirstReview: "45m",
    linesOfCodeDeleted: 7245,
    linesOfCodeAdded: 6890,
  },
  {
    user: {
      imageUrl: "https://avatars.githubusercontent.com/u/87654321?s=16&v=4",
      name: "Michael",
    },
    codemodsCreated: 15,
    prsReviewed: 18,
    averageReviewTime: "1m 59s",
    timeToFirstReview: "30m",
    linesOfCodeDeleted: 12450,
    linesOfCodeAdded: 11230,
  },
  {
    user: {
      imageUrl: "https://avatars.githubusercontent.com/u/23456789?s=16&v=4",
      name: "Sophia",
    },
    codemodsCreated: 6,
    prsReviewed: 9,
    averageReviewTime: "4m 20s",
    timeToFirstReview: "1h 15m",
    linesOfCodeDeleted: 4320,
    linesOfCodeAdded: 3980,
  },
  {
    user: {
      imageUrl: "https://avatars.githubusercontent.com/u/34567890?s=16&v=4",
      name: "Daniel",
    },
    codemodsCreated: 10,
    prsReviewed: 16,
    averageReviewTime: "2m 50s",
    timeToFirstReview: "55m",
    linesOfCodeDeleted: 8765,
    linesOfCodeAdded: 7890,
  },
  {
    user: {
      imageUrl: "https://avatars.githubusercontent.com/u/45678901?s=16&v=4",
      name: "Olivia",
    },
    codemodsCreated: 9,
    prsReviewed: 11,
    averageReviewTime: "3m 10s",
    timeToFirstReview: "1h 5m",
    linesOfCodeDeleted: 6540,
    linesOfCodeAdded: 5980,
  },
  {
    user: {
      imageUrl: "https://avatars.githubusercontent.com/u/56789012?s=16&v=4",
      name: "Ethan",
    },
    codemodsCreated: 11,
    prsReviewed: 20,
    averageReviewTime: "2m 30s",
    timeToFirstReview: "40m",
    linesOfCodeDeleted: 10230,
    linesOfCodeAdded: 9870,
  },
];
