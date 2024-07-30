// types.ts

export type DataPointKind = 'real_drift' | 'estimated_drift' | 'anomaly_score' | 'performance_metric';

export type DataPoint = {
  kind: DataPointKind;
  package: string;
  timestamp: number | undefined;
  value: number;
};

export type CardTileProps = {
  title: string;
  value: string | number;
  change: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
};

export type ChartTileProps = {
  title: string;
  data: DataPoint[];
};

export type TableTileProps<T> = {
  title: string;
  data: T[];
  columns: {
    key: keyof T;
    title: string;
  }[];
};

export type Reviewer = string | {
  imageUrl: string;
  name: string;
};

export type MigrationPrTable = {
  task: string;
  pr: string;
  status: string;
  reviewer: Reviewer;
  filesChanged: number;
  timeSaving: string;
};



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
  title: string;
  dataSets: DataSet[];
}

interface ChartColorSet {
  title: string;
  colorSets: [ColorConfig, ColorConfig];  // Tuple of exactly two ColorConfig objects
}

export type ChartType = 'depreciatedAPI' | 'prsMerged';


export interface ChartColorSet {
  title: string;
  colorSets: [ColorConfig, ColorConfig];  // Tuple of exactly two ColorConfig objects
}
