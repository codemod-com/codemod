import { cn } from "@/utils";
import {
  Table as ShadCNTable,
  TableRow as ShadCNTableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@studio/components/ui/table";
import { buildTableRow } from "@studio/main/Log/utils";
import type { Event } from "@studio/schemata/eventSchemata";
import type { MouseEventHandler } from "react";

interface TableBlockProps {
  title: string;
  noItemFoundText: string;
  events: readonly Event[];
  activeEventHashDigest: string;
  buildOnMouseOver: (
    hashDigest: string,
  ) => MouseEventHandler<HTMLTableRowElement>;
  buildOnClick: (hashDigest: string) => MouseEventHandler<HTMLTableRowElement>;
  onMouseEnter: MouseEventHandler<HTMLTableElement>;
  onMouseLeave: MouseEventHandler<HTMLTableElement>;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  title,
  noItemFoundText,
  events = [],
  activeEventHashDigest,
  buildOnMouseOver,
  buildOnClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const rows = events
    .map((event, index) => buildTableRow(event, activeEventHashDigest, index))
    .filter((e) => e.details.length > 0);

  if (rows.length === 0) {
    return <div className="p-3 text-gray-400">{noItemFoundText}</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="bold p-3 w-full font-bold">{title}</div>
      <div className="align-center flex justify-center">
        <ShadCNTable
          className="w-full table-fixed text-left text-sm font-light text-black dark:text-white"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <TableHeader>
            <ShadCNTableRow>
              <TableHead className="w-[5rem]">Nº</TableHead>
              <TableHead>Output</TableHead>
            </ShadCNTableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ className, name, details, index, hashDigest }) => (
              <ShadCNTableRow
                className={cn(className, "border", "cursor-pointer")}
                key={hashDigest}
                onMouseOver={buildOnMouseOver(hashDigest)}
                onClick={buildOnClick(hashDigest)}
              >
                <TableCell className="font-medium">{index}</TableCell>
                <TableCell>
                  {details.map((detail) => (
                    <p key={detail}>{detail}</p>
                  ))}
                </TableCell>
              </ShadCNTableRow>
            ))}
          </TableBody>
        </ShadCNTable>
      </div>
    </div>
  );
};
