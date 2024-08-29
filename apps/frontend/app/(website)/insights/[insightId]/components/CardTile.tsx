import { Title } from "@/app/(website)/insights/[insightId]/components/Title";
import useStorage from "@/app/(website)/insights/[insightId]/hooks/useStorage";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import type React from "react";
import { useState } from "react";
import { uuid } from "valibot";
import type { CardTileProps } from "../types";
import ImportDataButton from "./ImportDataButton";

export const CardTile: React.FC<CardTileProps> = (props) => {
  const [data, setData] = useStorage("myComponent", "MyComponent", props);

  const { title = "", value = "", change = 0, subtitle = "" } = props;
  const [cardTitle, setCardTitle] = useState(title);

  const getChangeColor = (changeValue: number) => {
    if (changeValue > 0) return "text-green-600";
    if (changeValue < 0) return "text-red-600";
    return "text-gray-600"; // neutral color for zero change
  };

  const Arrow = (changeValue: number) =>
    changeValue > 0 ? ArrowUp : changeValue < 0 ? ArrowDown : null;

  const handleImport = (importedData: CardTileProps) => {
    setData(importedData);
  };

  const handleImportError = (error: Error) => {
    console.error("Import error:", error.message);
  };

  const displayData = data || { title, value, change, subtitle };

  const ArrowComponent = Arrow(displayData.change);
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
      <div>
        <div
          className="flex w-full justify-betweent"
          style={{
            justifyContent: "space-between",
          }}
        >
          <Title title={cardTitle} onChange={setCardTitle} />
          <ImportDataButton<CardTileProps>
            id={title || String(uuid())}
            onImport={handleImport}
            className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center"
            iconSize={20}
            onError={handleImportError}
          />
        </div>
        <div className="text-3xl font-bold mb-2">{displayData.value}</div>
      </div>
      <div className="flex items-center text-sm">
        <div
          className={`flex items-center ${getChangeColor(displayData.change)} mr-1`}
        >
          {ArrowComponent && <ArrowComponent className="mr-1" size={16} />}
          <span>
            {displayData.change !== 0
              ? `${Math.abs(displayData.change)}%`
              : "0%"}
          </span>
        </div>
        {displayData.subtitle && (
          <div className="text-gray-500">{displayData.subtitle}</div>
        )}
      </div>
    </div>
  );
};
