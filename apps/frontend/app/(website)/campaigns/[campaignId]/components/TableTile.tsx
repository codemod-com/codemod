"use client";
import { Title } from "@/app/(website)/campaigns/[campaignId]/components/Title";
import Button from "@/components/shared/Button";
import { CaretDown, CaretRight, CaretUp, Info } from "@phosphor-icons/react";
import { Toast, ToastProvider, ToastViewport } from "@radix-ui/react-toast";
import Tooltip from "@studio/components/Tooltip/Tooltip";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ColumnDefinition, TableTileProps } from "../types";
import ImportDataButton from "./ImportDataButton";

const camelToSpaced = (str: string): string =>
  str.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

export function TableTile<T>({
  title,
  data: initialData,
  columns: c,
  transformer = new Proxy(
    {},
    {
      get() {
        return (fieldValue: { name: string } | number | string) =>
          fieldValue instanceof Object ? fieldValue.name : fieldValue;
      },
    },
  ),
  loading,
  statusMessage,
  error,
  getData,
}: TableTileProps<T> & {
  columns?: ColumnDefinition[];
  transformer?: Record<keyof T, (value: any) => React.ReactNode>;
}) {
  const [cardTitle, setCardTitle] = useState(title);
  const shouldDeriveColumnsNames = !c;
  const [columns, setColumns] = useState<T[]>(c || []);
  const [data, setData] = useState<T[]>(initialData);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAll, setShowAll] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const sortedData = useMemo(
    () =>
      !sortColumn
        ? data
        : data.toSorted((a, b) => {
            const aValue = a[sortColumn];
            const bValue = b[sortColumn];
            return aValue < bValue
              ? sortDirection === "asc"
                ? -1
                : 1
              : aValue > bValue
                ? sortDirection === "asc"
                  ? 1
                  : -1
                : 0;
          }),
    [data, sortColumn, sortDirection],
  );

  useEffect(() => {
    if (shouldDeriveColumnsNames) {
      setColumns(Object.keys(data[0] || {}));
    }
  }, [data]);

  const displayData = showAll ? sortedData : sortedData.slice(0, 3);

  const handleSort = (column: keyof T) => {
    setSortDirection(
      sortColumn === column && sortDirection === "asc" ? "desc" : "asc",
    );
    setSortColumn(column);
  };

  const getColumnTitle = (column: ColumnDefinition): string =>
    typeof column === "string" ? column : column.title;

  const getColumnDescription = (
    column: ColumnDefinition,
  ): string | undefined =>
    typeof column === "object" ? column.description : undefined;

  const validateImportedData = (importedData: any): importedData is T[] =>
    Array.isArray(importedData) &&
    importedData.every(
      (item) =>
        new Set(Object.keys(item)).difference(new Set(columns)).size === 0,
    );

  const handleImport = (importedData: any) => {
    if (shouldDeriveColumnsNames) {
      setData(importedData);
    } else {
      validateImportedData(importedData)
        ? setData(importedData)
        : setShowToast(true);
    }
  };

  const handleImportError = (error: Error) => {
    console.error("Import error:", error.message);
    setShowToast(true);
  };

  return (
    <ToastProvider swipeDirection="right">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <Title title={cardTitle} onChange={setCardTitle} />
            <div className="flex gap-2 min-w-[80px]">
              <Button intent="secondary-icon-only" onClick={getData}>
                <RefreshCw size={16} />
              </Button>
              <ImportDataButton<any>
                id={`import-${title.replace(/\s+/g, "-").toLowerCase()}`}
                onImport={handleImport}
                className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center"
                iconSize={20}
                onError={handleImportError}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            {error ? (
              error
            ) : loading ? (
              statusMessage
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={getColumnTitle(column)}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() =>
                          handleSort(getColumnTitle(column) as keyof T)
                        }
                      >
                        <div className="flex items-center">
                          {camelToSpaced(getColumnTitle(column))}
                          {sortColumn === getColumnTitle(column) &&
                            (sortDirection === "asc" ? (
                              <CaretUp className="ml-1" size={14} />
                            ) : (
                              <CaretDown className="ml-1" size={14} />
                            ))}
                          {getColumnDescription(column) && (
                            <Tooltip
                              trigger={<Info />}
                              content={column.description}
                            />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayData.map((item, index) => (
                    <tr key={index}>
                      {columns.map((column) => (
                        <td
                          key={getColumnTitle(column)}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {transformer[getColumnTitle(column) as keyof T](
                            item[getColumnTitle(column) as keyof T],
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {!showAll && data.length > 3 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
              <CaretRight className="ml-1" size={16} />
            </button>
          </div>
        )}
      </div>
      <Toast open={showToast} onOpenChange={setShowToast}>
        <div className="bg-white rounded-md shadow-lg p-4 mb-4">
          <h3 className="font-medium text-gray-900">Import Error</h3>
          <p className="mt-1 text-sm text-gray-500">
            Data does not match the widget
          </p>
        </div>
      </Toast>
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-50 outline-none" />
    </ToastProvider>
  );
}
