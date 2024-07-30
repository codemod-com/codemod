"use client"
import { useState, useMemo } from 'react';
import { TableTileProps } from '../types';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { tableData } from "@/app/(website)/insights-dashboard/mockData";
import { User } from "@/app/(website)/insights-dashboard/components/User";


export const TableTile = <T extends Record<string, unknown>>({ title, data, columns }: TableTileProps<T>) => {
  const [sortColumn, setSortColumn] = useState<keyof T>(columns[0].key as keyof T);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const withUserComponents = data.map((d, i) =>
    Object.fromEntries(
      Object.entries(d).map(([k, v]) => [k, v instanceof Object ? <User {...v} /> : v])));

  const sortedData = useMemo(() => {
    return [...withUserComponents].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [withUserComponents, sortColumn, sortDirection]);

  const handleSort = (column: keyof T) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort(column.key as keyof T)}
              >
                <div className="flex items-center">
                  {column.title}
                  {sortColumn === column.key && (
                    sortDirection === 'asc' ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key as string} className="px-6 py-4 whitespace-nowrap">
                  {item[column.key]}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};