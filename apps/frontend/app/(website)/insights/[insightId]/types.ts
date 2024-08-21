export type DataPointKind =
  | "real_drift"
  | "estimated_drift"
  | "anomaly_score"
  | "performance_metric";

export interface MetricCardProps {
  data: number;
  change: number;
  timePeriod: string;
}

export type DataPoint = {
  kind: DataPointKind;
  package: string;
  timestamp: number | undefined;
  value: number;
};

export type CardTileProps = {
  title: string;
  value: string;
  change: number;
  subtitle?: string;
};

export type ChartTileProps = {
  title: string;
  data: DataPoint[];
};

export type TableTileProps<T> = {
  title: string;
  data: T[];
  loading: boolean;
  statusMessage?: string;
  error: string;
  getData(): void;
};

export type Reviewer =
  | string
  | {
      imageUrl: string;
      name: string;
    };

export interface MigrationHeroData {
  user: {
    imageUrl: string;
    name: string;
  };
  codemodsCreated: number;
  prsReviewed: number;
  averageReviewTime: string;
  timeToFirstReview: string;
  linesOfCodeDeleted: number;
  linesOfCodeAdded: number;
}

export interface DataSet {
  key: string;
  data: Array<{ timestamp: number; value: number }>;
  colorConfig: ColorConfig;
}

export interface ColorConfig {
  line: string;
  gradientStart: string;
  gradientEnd: string;
}

export interface DynamicLineChartProps {
  colorConfig: ColorConfig[];
  dataSets: DataSet[];
}

export type ChartType = "depreciatedAPI" | "prsMerged";

export type TransformerType<T> = {
  [K in keyof T]: (value: T[K]) => JSX.Element;
};

export type MigrationPrTable = {
  task: string;
  pr: string;
  status: "In Review" | "Merged";
  reviewer: {
    imageUrl: string;
    name: string;
  };
  filesChanged: number;
  timeSaving: string;
};

export type MigrationPrTableProps = {
  title: string;
  data: MigrationPrTable[];
};

export type ColumnDefinition = string | { title: string; description: string };
