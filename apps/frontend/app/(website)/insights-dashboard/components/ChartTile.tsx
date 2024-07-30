'use client'
import dynamic from 'next/dynamic';
import { ChartType } from "@/app/(website)/insights-dashboard/types";
import { chartColorSets } from "@/app/(website)/insights-dashboard/chartColorSets";

const DynamicLineChart = dynamic(
  () => import('./DynamicLineChart'),
  { ssr: false }
);

interface ChartTileProps {
  type: ChartType;
  data: Array<{
    key: string;
    data: Array<{ timestamp: number; value: number }>;
  }>;
}

export const ChartTile: React.FC<ChartTileProps> = ({ type, data }) => {
  const colorSet = chartColorSets[type];

  const dataSets = data.map((set, index) => ({
    ...set,
    colorConfig: colorSet.colorSets[index],
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{ colorSet.title }</h3>
      <div className="h-64">
        <DynamicLineChart title={ colorSet.title } dataSets={ dataSets }/>
      </div>
    </div>
  );
};