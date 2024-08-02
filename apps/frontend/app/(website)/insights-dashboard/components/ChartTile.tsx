"use client";
import type { ColorConfig } from "@/app/(website)/insights-dashboard/types";
import dynamic from "next/dynamic";
import type React from "react";
import { useCallback, useState } from "react";
import { uuid } from "valibot"; // Assuming ImportDataButton is in the same directory
import ImportDataButton from "./ImportDataButton";

const DynamicLineChart = dynamic(() => import("./DynamicLineChart"), {
  ssr: false,
});

export interface ChartTileProps {
  title: string;
  colorSets: ColorConfig[];
  data: Array<{
    title: string;
    data: Array<{ timestamp: number; value: number }>;
  }>;
}

interface InputDataItem {
  name: string;
  drift: number;
  timestamp: string;
  label: string;
}

export const ChartTile: React.FC<ChartTileProps> = ({
  title,
  colorSets,
  data: initialData,
}) => {
  const [data, setData] = useState(initialData);

  const transformData = useCallback(
    (inputData: InputDataItem[]): ChartTileProps["data"] => {
      const groupedData = inputData.reduce(
        (acc, item) => {
          if (!acc[item.name]) {
            acc[item.name] = [];
          }
          acc[item.name].push({
            timestamp: new Date(item.timestamp).getTime(),
            value: item.drift,
          });
          return acc;
        },
        {} as { [key: string]: { timestamp: number; value: number }[] },
      );

      return Object.entries(groupedData).map(([name, data]) => ({
        title: name,
        data: data,
      }));
    },
    [],
  );

  const handleImport = (importedData) => {
    const transformedData = transformData(importedData);
    setData(transformedData);
  };

  const handleImportError = useCallback((error: Error) => {
    console.error("Import error:", error.message);
    // You could add more error handling here, like showing a toast notification
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <ImportDataButton<InputDataItem[]>
          id={title || String(uuid())}
          onImport={handleImport}
          buttonText="Update Chart Data"
          className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center"
          iconSize={20}
          onError={handleImportError}
        />
      </div>
      <div className="h-64">
        <DynamicLineChart
          title={title}
          dataSets={data}
          colorConfig={colorSets}
        />
      </div>
    </div>
  );
};
