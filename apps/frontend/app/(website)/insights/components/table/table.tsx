"use client";

import {
  type ColumnDef,
  type SortingState,
  type TableOptions,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table-shadcn";

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  sortingState?: SortingState;
  setSortingState?: React.Dispatch<React.SetStateAction<SortingState>>;
}

export const DataTable = <T,>({
  data,
  columns,
  // sortingState,
  // setSortingState,
}: DataTableProps<T>) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const options: TableOptions<T> = {
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  };

  // possible back-end sorting
  // if (setSortingState) {
  //   options.manualSorting = true;
  //   options.onSortingChange = setSortingState;
  //   options.state!.sorting = sortingState;
  // }

  const table = useReactTable(options);
  if (!table) return null;

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="sticky top-0 z-20">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:none hover:bg-inherit"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="bg-secondary [&_*]:text-secondary-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="relative bg-card hover:bg-accent/20"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
