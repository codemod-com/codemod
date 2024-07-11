import { cn } from "@/utils";
import { Label } from "@studio/components/ui/label";
import {
  Table as ShadCNTable,
  TableRow as ShadCNTableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "@studio/components/ui/table";
import type { Event } from "@studio/schemata/eventSchemata";
import { useLogStore } from "@studio/store/log";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { useSetActiveEventThunk } from "@studio/store/utils/useSetActiveEventThunk";
import {
  type MouseEventHandler,
  memo,
  useCallback,
  useMemo,
  useState,
} from "react";

type TableRow = Readonly<{
  index: number;
  hashDigest: string;
  className: string;
  name: string;
  details: ReadonlyArray<string>;
}>;

const getTableRowName = (event: Event): string => {
  switch (event.kind) {
    case "collectionFind":
      return "Found Collection";
    case "collectionPaths":
      return "Found Paths";
    case "collectionRemove":
      return "Removed Collection";
    case "collectionReplace":
      return "Replaced Collection";
    case "collectionToSource":
      return "Built Source from Collection";
    case "path": {
      if (event.mode === "lookup") {
        return "Accessed Path(s)";
      }
      return "Replaced Path(s)";
    }
    case "pathReplace":
      return "Replaced Path(s)";
    case "jscodeshiftApplyString":
      return "Created Root Collection";
    case "printedMessage":
      return "Printed Message";
    case "codemodExecutionError":
      return "Codemod Execution Error";
    default:
      return "Unknown Event";
  }
};

const getTableRowDetails = (event: Event) => {
  const res: string[] = [];

  if ("nodeType" in event) {
    res.push(`Node Type: ${event.nodeType}`);
  }

  if ("snippetBeforeRanges" in event) {
    res.push(`Node Count: ${event.snippetBeforeRanges.length}`);
  }

  if ("message" in event) {
    res.push(`Message: ${event.message}`);
  }

  return res;
};

const buildTableRow = (
  event: Event,
  eventHashDigest: string | null,
  index: number,
): TableRow => ({
  index,
  hashDigest: event.hashDigest,
  className: event.hashDigest === eventHashDigest ? "highlight" : "",
  name: getTableRowName(event),
  details: getTableRowDetails(event),
});

const useRanges = () => ({
  codemodInputRanges: useModStore().ranges,
  codemodOutputRanges: useSnippetsStore().getSelectedEditors().output.ranges,
  beforeInputRanges: useSnippetsStore().getSelectedEditors().before.ranges,
  afterInputRanges: useSnippetsStore().getSelectedEditors().after.ranges,
});

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
  const { activeEventHashDigest, events } = useLogStore();

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

  const tableRows = useMemo(
    () =>
      events.map((event, index) =>
        buildTableRow(event, activeEventHashDigest, index),
      ),
    [events, activeEventHashDigest],
  );

  return (
    <div className="align-center flex justify-center">
      {tableRows.length !== 0 ? (
        <ShadCNTable
          className="w-full table-fixed text-left text-sm font-light text-black dark:text-white"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <TableHeader>
            <ShadCNTableRow>
              <TableHead className="w-[5rem]">Nº</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Details</TableHead>
            </ShadCNTableRow>
          </TableHeader>
          <TableBody>
            {tableRows.map(
              ({ className, name, details, index, hashDigest }) => (
                <ShadCNTableRow
                  className={cn(className, "border", "cursor-pointer")}
                  key={hashDigest}
                  onMouseOver={buildOnMouseOver(hashDigest)}
                  onClick={buildOnClick(hashDigest)}
                >
                  <TableCell className="font-medium">{index}</TableCell>
                  <TableCell>{name}</TableCell>
                  <TableCell>
                    {details.map((detail) => (
                      <p key={detail}>{detail}</p>
                    ))}
                  </TableCell>
                </ShadCNTableRow>
              ),
            )}
          </TableBody>
        </ShadCNTable>
      ) : (
        <Label className="text-center text-lg font-light mt-2">
          No results have been found
        </Label>
      )}
    </div>
  );
};

export default memo(Table);
