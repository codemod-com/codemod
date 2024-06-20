import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useRangesOnTarget } from "@studio/store/useRangesOnTarget";
import { useSelectActiveEvent } from "@studio/store/zustand/log";
import { useModStore } from "@studio/store/zustand/mod";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api.d.ts";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { prettify } from "../src/utils/prettify";

let CodeSnippet = dynamic(() => import("@studio/components/Snippet"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

let Codemod = () => {
  let editor = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  let { internalContent, ranges, setContent } = useModStore();
  let activeEvent = useSelectActiveEvent();
  let setRangeThunk = useRangesOnTarget();

  let content = internalContent ?? "";

  let onBlur = useCallback(() => {
    let prettified = prettify(content);
    if (prettified !== content) {
      setContent(prettified);
    }
  }, [setContent, content]);

  let onKeyUp = useCallback(
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

  let handleSelectionChange = useCallback(
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

    let model = editor.current.getModel();

    if (model === null) {
      return;
    }

    let startPosition = model.getPositionAt(
      activeEvent.codemodSourceRange.start,
    );

    editor.current.revealPositionInCenter(startPosition);
  }, [activeEvent]);

  return (
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
  );
};

export default Codemod;
