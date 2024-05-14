import { Loading } from "@studio/components/Loader";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useRangesOnTarget } from "@studio/store/useRangesOnTarget";
import { useSelectActiveEvent } from "@studio/store/zustand/log";
import { useModStore } from "@studio/store/zustand/mod";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api.d.ts";
import { Suspense, lazy, useCallback, useEffect, useRef } from "react";
import { prettify } from "../src/utils/prettify";

const CodeSnippet = lazy(() => import("@studio/components/Snippet"));

const Codemod = () => {
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const { internalContent, ranges, setContent } = useModStore();
  const activeEvent = useSelectActiveEvent();
  const setRangeThunk = useRangesOnTarget();

  const content = internalContent ?? "";

  const onBlur = () => {
    const prettified = prettify(content);
    if (prettified !== content) {
      setContent(prettified);
    }
  };

  const onKeyUp = useCallback(
    (event: monaco.IKeyboardEvent) => {
      if (event.code === "Escape") {
        return;
      }

      setRangeThunk({
        target: "CODEMOD_INPUT",
        ranges: [],
      });
    },
    [setRangeThunk],
  );

  const handleSelectionChange = useCallback(
    (range: OffsetRange) => {
      setRangeThunk({
        target: "CODEMOD_INPUT",
        ranges: [range],
      });
    },
    [setRangeThunk],
  );

  useEffect(() => {
    if (activeEvent === null || editor.current === null) {
      return;
    }

    const model = editor.current.getModel();

    if (model === null) {
      return;
    }

    const startPosition = model.getPositionAt(
      activeEvent.codemodSourceRange.start,
    );

    editor.current.revealPositionInCenter(startPosition);
  }, [activeEvent]);

  return (
    <Suspense fallback={<Loading />}>
      <CodeSnippet
        ref={editor}
        highlights={ranges}
        language="typescript"
        onBlur={onBlur}
        onChange={(value) => setContent(value ?? "")}
        onKeyUp={({ event }) => onKeyUp(event)}
        path="codemod.ts"
        value={content}
        onSelectionChange={handleSelectionChange}
      />
    </Suspense>
  );
};

export default Codemod;
