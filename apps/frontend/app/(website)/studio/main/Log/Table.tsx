import { TableBlock } from "@studio/main/Log/TableBlock";
import { useRanges } from "@studio/main/Log/utils";
import { useLogStore } from "@studio/store/log";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { useSetActiveEventThunk } from "@studio/store/utils/useSetActiveEventThunk";
import { type MouseEventHandler, memo, useCallback, useState } from "react";

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
  const { activeEventHashDigest, executionErrors, consoleLogs, restEvents } =
    useLogStore();

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

  return (
    <div className="flex flex-col">
      {tableComponents.map((tableData, index) => (
        <TableBlock
          key={`table-${index}`}
          {...tableData}
          activeEventHashDigest={activeEventHashDigest}
          buildOnMouseOver={buildOnMouseOver}
          buildOnClick={buildOnClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      ))}
    </div>
  );
};

export default memo(Table);
