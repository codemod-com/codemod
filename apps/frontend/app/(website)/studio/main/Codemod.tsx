import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useSelectActiveEvent } from "@studio/store/log";
import { useModStore } from "@studio/store/mod";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import type * as monaco from "monaco-editor/esm/vs/editor/editor.api.d.ts";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { prettify } from "../src/utils/prettify";

const CodeSnippet = dynamic(() => import("@studio/components/Snippet"), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});

const Codemod = () => {
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const { content = "", ranges, setContent } = useModStore();
  const activeEvent = useSelectActiveEvent();
  const setRangeThunk = useRangesOnTarget();

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
    <CodeSnippet
      ref={editor}
      highlights={ranges}
      language="typescript"
      onBlur={onBlur}
      onChange={(value) => {
        setContent(value ?? "");
      }}
      onKeyUp={({ event }) => onKeyUp(event)}
      path="codemod.ts"
      value={content}
      onSelectionChange={handleSelectionChange}
    />
  );
};

export default Codemod;
