"use client";
import { Title } from "@/app/(website)/campaigns/[campaignId]/components/Title";
import { generateChartColors } from "@/app/(website)/campaigns/[campaignId]/components/utils";
import type { ColorConfig } from "@/app/(website)/campaigns/[campaignId]/view/[viewId]/types";
import Button from "@/components/shared/Button";
import { RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { uuid } from "valibot";
import ImportDataButton from "./ImportDataButton";

const DynamicLineChart = dynamic(() => import("./DynamicLineChart"), {
  ssr: false,
});

export interface ChartTileProps {
  title: string;
  colorSets?: ColorConfig[];
  data: Array<{
    title: string;
    data: Array<{ timestamp: number; value: number }>;
  }>;
  loading: boolean;
  statusMessage: string | null;
  error: string | null;
  getData(): void;
}

interface InputDataItem {
  name: string;
  drift: number;
  timestamp: string;
  label: string;
}

const transformData = (inputData: InputDataItem[]): ChartTileProps["data"] => {
  const groupedData = inputData.reduce(
    (acc, item) => ({
      ...acc,
      [item.name]: [
        ...(acc[item.name] || []),
        {
          timestamp: new Date(item.timestamp).getTime(),
          value: item.drift,
        },
      ],
    }),
    {} as { [key: string]: { timestamp: number; value: number }[] },
  );

  return Object.entries(groupedData).map(([name, data]) => ({
    title: name,
    data: data,
  }));
};

export const ChartTile: React.FC<ChartTileProps> = ({
  title,
  colorSets: dS,
  data: initialData,
  loading,
  statusMessage,
  error,
  getData,
}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData("value" in initialData ? initialData : transformData(initialData));
  }, [initialData]);
  const [chartTitle, setChartTitle] = useState(title);
  const colorSets = dS ?? generateChartColors(data.length);

  const handleImport = (importedData) => {
    const transformedData = transformData(importedData);
    setData(transformedData);
  };

  const handleImportError = useCallback((error: Error) => {
    console.error("Import error:", error.message);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <Title title={chartTitle} onChange={setChartTitle} />
        <div className="flex gap-2 min-w-[80px]">
          <Button intent="secondary-icon-only" onClick={getData}>
            <RefreshCw size={16} />
          </Button>
          <ImportDataButton<InputDataItem[]>
            id={chartTitle || String(uuid())}
            onImport={handleImport}
            buttonText="Update Chart Data"
            className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center"
            iconSize={20}
            onError={handleImportError}
          />
        </div>
      </div>
      <div className="h-64">
        {error ? (
          error
        ) : loading ? (
          statusMessage
        ) : (
          <DynamicLineChart
            title={chartTitle}
            dataSets={data}
            colorConfig={colorSets}
          />
        )}
      </div>
    </div>
  );
};
