import { cn } from "@/utils";
import {
  Table as ShadCNTable,
  TableRow as ShadCNTableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@studio/components/ui/table";
import { buildTableRow, useRanges } from "@studio/main/Log/utils";
import type { Event } from "@studio/schemata/eventSchemata";
import { useLogStore } from "@studio/store/log";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { useSetActiveEventThunk } from "@studio/store/utils/useSetActiveEventThunk";
import { type MouseEventHandler, memo, useCallback, useState } from "react";

type TableRow = Readonly<{
  index: number;
  hashDigest: string;
  className: string;
  name: string;
  details: ReadonlyArray<string>;
}>;

type Ranges = ReturnType<typeof useRanges>;

const Table = () => {
  const [oldEventHashDigest, setOldEventHashDigest] = useState<string | null>(
    null,
  );
  const ranges = useRanges();
  const [oldRanges, setOldRanges] = useState<Ranges | null>(null);

  const setActiveThunk = useSetActiveEventThunk();
  const { setCodemodSelection } = useModStore();
  const { getSelectedEditors } = useSnippetsStore();
  const { setAfterSelection, setOutputSelection, setBeforeSelection } =
    getSelectedEditors();
  const {
    activeEventHashDigest,
    executionErrors,
    consoleLogs,
    events,
    restEvents,
  } = useLogStore();

  const buildOnMouseOver = useCallback(
    (hashDigest: string): MouseEventHandler<HTMLTableRowElement> =>
      (event) => {
        event.preventDefault();
        setActiveThunk(hashDigest);
      },
    [setActiveThunk],
  );

  const buildOnClick = useCallback(
    (hashDigest: string): MouseEventHandler<HTMLTableRowElement> =>
      async (event) => {
        event.preventDefault();

        setActiveThunk(hashDigest);

        setOldRanges(ranges);
        setOldEventHashDigest(hashDigest);
      },
    [setActiveThunk, ranges],
  );

  const onMouseEnter: MouseEventHandler<HTMLTableElement> = useCallback(
    (event) => {
      event.preventDefault();

      setOldRanges(ranges);
      setOldEventHashDigest(activeEventHashDigest);
    },
    [activeEventHashDigest, ranges],
  );

  const onMouseLeave: MouseEventHandler<HTMLTableElement> = useCallback(
    (event) => {
      event.preventDefault();

      if (oldEventHashDigest) {
        setActiveThunk(oldEventHashDigest);
      }

      if (oldRanges === null) {
        return;
      }

      setCodemodSelection({
        kind: "PASS_THROUGH",
        ranges: oldRanges.codemodInputRanges,
      });

      setOutputSelection({
        kind: "PASS_THROUGH",
        ranges: oldRanges.codemodOutputRanges,
      });

      setBeforeSelection({
        kind: "PASS_THROUGH",
        ranges: oldRanges.beforeInputRanges,
      });

      setAfterSelection({
        kind: "PASS_THROUGH",
        ranges: oldRanges.afterInputRanges,
      });
    },
    [
      oldEventHashDigest,
      oldRanges,
      setActiveThunk,
      setCodemodSelection,
      setOutputSelection,
      setBeforeSelection,
      setAfterSelection,
    ],
  );

  const TableBlock = ({
    title,
    events,
  }: {
    title: string;
    noItemFoundText: string;
    events: readonly Event[];
  }) => {
    const rows = events
      .map((event, index) => buildTableRow(event, activeEventHashDigest, index))
      .filter((e) => e.details.length > 0);
    const body = (
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
    );
    return (
      <div className="flex flex-col ">
        <div className="bold p-3 w-full font-bold">{title}</div>
        <div className="align-center flex justify-center ">
          <ShadCNTable
            className="w-full table-fixed text-left text-sm font-light text-black dark:text-white "
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <TableHeader>
              <ShadCNTableRow>
                <TableHead className="w-[5rem]">Nº</TableHead>
                <TableHead>Output</TableHead>
              </ShadCNTableRow>
            </TableHeader>
            {body}
          </ShadCNTable>
        </div>
      </div>
    );
  };

  const tableComponents = [
    {
      noItemFoundText: "No errors",
      title: "Codemod Execution Errors::",
      eventsKey: "executionErrors",
      events: executionErrors,
    },
    {
      noItemFoundText: "Nothing logged in console ",
      title: "Console:",
      eventsKey: "consoleLogs",
      events: consoleLogs,
    },
    {
      noItemFoundText: "No events",
      title: "Events:",
      eventsKey: "restEvents",
      events: restEvents,
    },
  ];

  const renderTableBlocksWithResizeHandles = () => {
    const tableComponentsWithProps = tableComponents.map(
      (tableData, index) => ({
        key: `table-${index}`,
        hasEvents:
          Array.isArray(tableData.events) && tableData.events.length > 0,
        tableData,
        isLastItem: index === tableComponents.length - 1,
      }),
    );

    const components = tableComponentsWithProps.reduce(
      (acc, component, index) => {
        if (index === 0 && component.hasEvents)
          return [
            <TableBlock key={`table-${index}`} {...component.tableData} />,
          ];

        const newComponent = component.hasEvents ? (
          <TableBlock key={`table-${index}`} {...component.tableData} />
        ) : (
          <div key={`no-events-${index}`} className="p-3 text-gray-400">
            {component.tableData.noItemFoundText}
          </div>
        );

        return [...acc, newComponent];
      },
      [],
    );

    return components;
  };

  return (
    <>
      <div className="flex flex-col ">
        {renderTableBlocksWithResizeHandles()}
      </div>
    </>
  );
};

export default memo(Table);
