import { monaco } from "@studio/customMonaco";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useEffect, useRef, useState } from "react";

type Link = {
  regex: RegExp;
  handler(value: monaco.editor.IWordAtPosition): void;
};

type EditorProps = {
  highlights: ReadonlyArray<OffsetRange>;
  decorations?: monaco.editor.IModelDeltaDecoration[];
  links?: Link[];
  startOffset?: number;
  value?: string;
  onBlur?(value: string): void;
  onClick?(position: number): void;
  onKeyUp?: ({
    offset,
    event,
  }: {
    offset: number;
    event: monaco.IKeyboardEvent;
  }) => void;
  onSelectionChange?(selection: OffsetRange): void;
  onChange?(
    value: string | undefined,
    e: monaco.editor.IModelContentChangedEvent,
  ): void;
};

let findMatches = (
  str: string,
  regex: RegExp,
): { start: number; end: number }[] => {
  let matches: { start: number; end: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(str)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return matches;
};

let getLinkDecorations = (
  editor: monaco.editor.IStandaloneCodeEditor,
  links: Link[],
) => {
  let result: monaco.editor.IModelDeltaDecoration[] = [];

  let text = editor.getValue();
  let model = editor.getModel();

  if (!model) {
    return [];
  }

  links.forEach((link) => {
    let ranges = findMatches(text, link.regex);

    ranges.forEach((range) => {
      // @TODO move this to helper
      let startPos = model.getPositionAt(range.start);
      let endPos = model.getPositionAt(range.end);

      let monacoRange = monaco.Range.fromPositions(startPos, endPos);
      let linkDecoration = {
        range: monacoRange,
        options: {
          isWholeLine: false,
          inlineClassName: "monaco-link",
        },
      };

      result.push(linkDecoration);
    });
  });

  return result;
};

export let useEditor = (
  editor: monaco.editor.IStandaloneCodeEditor | null,
  {
    highlights,
    links,
    decorations,
    startOffset,
    value,
    onSelectionChange,
    onChange,
    onBlur,
    onClick,
    onKeyUp,
  }: EditorProps,
  mounted: boolean,
) => {
  let [renderFinished, setRenderFinished] = useState(false);
  let decorationsIdRef = useRef<string[]>();
  let didChangeCursorSelectionRef = useRef<monaco.IDisposable>();
  let didChangeModelContentRef = useRef<monaco.IDisposable>();
  let didBlurEditorWidgetRef = useRef<monaco.IDisposable>();
  let mouseDownRef = useRef<monaco.IDisposable>();
  let keyUpRef = useRef<monaco.IDisposable>();
  let preventTriggerChangeEvent = useRef<boolean | null>(null);
  /**
   * Selection change handler
   */
  useEffect(() => {
    if (onSelectionChange === undefined || editor === null) {
      return;
    }

    didChangeCursorSelectionRef.current?.dispose();

    didChangeCursorSelectionRef.current = editor.onDidChangeCursorSelection(
      ({ source, selection }) => {
        if (source !== "mouse") {
          return;
        }
        let startPos = selection.getStartPosition();
        let endPos = selection.getEndPosition();

        let startOffset = editor.getModel()?.getOffsetAt(startPos);
        let endOffset = editor.getModel()?.getOffsetAt(endPos);

        if (startOffset === undefined || endOffset === undefined) {
          return;
        }

        onSelectionChange({ start: startOffset, end: endOffset });
      },
    );
  }, [onSelectionChange, editor]);

  /**
   * Change handler
   */
  useEffect(() => {
    if (onChange === undefined || editor === null) {
      return;
    }

    didChangeModelContentRef.current?.dispose();

    didChangeModelContentRef.current = editor.onDidChangeModelContent((e) => {
      onChange(editor.getValue() ?? "", e);
    });
  }, [onChange, editor, editor?.onDidChangeModelContent, editor?.getValue]);

  /**
   * Blur handler
   */
  useEffect(() => {
    if (onBlur === undefined || editor === null) {
      return;
    }

    didBlurEditorWidgetRef.current?.dispose();

    didBlurEditorWidgetRef.current = editor.onDidBlurEditorWidget(() => {
      onBlur(editor.getValue());
    });
  }, [onBlur, editor, editor?.onDidBlurEditorWidget, editor?.getValue]);

  /**
   * Mouse down handelr
   */
  useEffect(() => {
    let model = editor?.getModel() ?? null;

    if (onClick === undefined || editor === null || model === null) {
      return;
    }

    let onMouseDownHandler = (e: monaco.editor.IEditorMouseEvent) => {
      let { position } = e.target;

      if (!position) {
        return;
      }

      let offset = editor.getModel()?.getOffsetAt(position);

      if (offset) {
        onClick(offset);
      }

      let word = model.getWordAtPosition(position);

      if (word === null || links === undefined) {
        return;
      }

      links.forEach((link) => {
        if (link.regex.test(word.word)) {
          link.handler(word);
        }
      });
    };

    mouseDownRef.current?.dispose();
    mouseDownRef.current = editor.onMouseDown(onMouseDownHandler);
  }, [editor, onClick, links]);

  useEffect(() => {
    let model = editor?.getModel() ?? null;

    if (onKeyUp === undefined || editor === null || model === null) {
      return;
    }

    keyUpRef.current?.dispose();
    keyUpRef.current = editor.onKeyUp((e) => {
      let position = editor.getPosition();

      if (position === null) {
        return;
      }

      let offset = model.getOffsetAt(position);

      onKeyUp({ offset, event: e });
    });
  }, [onKeyUp, editor, editor?.getPosition]);

  /**
   * Start offset
   */

  useEffect(() => {
    if (startOffset === undefined || editor === null) {
      return;
    }

    let startPosition = editor.getModel()?.getPositionAt(startOffset);

    if (startPosition === undefined) {
      return;
    }

    editor.revealPositionInCenter(
      startPosition,
      monaco.editor.ScrollType.Smooth,
    );
  }, [startOffset, editor, editor?.revealPositionInCenter]);

  /**
   * Decorations
   */

  useEffect(() => {
    let model = editor?.getModel() ?? null;

    if (editor === null || model === null) {
      return;
    }

    let highlightDecorations: monaco.editor.IModelDeltaDecoration[] = [];

    highlights.forEach((highlight) => {
      let startPosition = model.getPositionAt(highlight.start);
      let endPosition = model.getPositionAt(highlight.end);
      let range = monaco.Range.fromPositions(startPosition, endPosition);

      highlightDecorations.push({
        range,
        options: {
          isWholeLine: false,
          inlineClassName: "highlight",
        },
      });
    });

    let linkDecorations = getLinkDecorations(editor, links ?? []);

    let allDecorations = [
      ...highlightDecorations,
      ...linkDecorations,
      ...(decorations ?? []),
    ];

    editor.deltaDecorations(decorationsIdRef.current ?? [], []);

    decorationsIdRef.current = editor.deltaDecorations([], allDecorations);
  }, [
    links,
    decorations,
    highlights,
    editor,
    editor?.deltaDecorations,
    editor?.getModel,
  ]);

  /**
   * Value setter
   */
  useEffect(() => {
    let model = editor?.getModel() ?? null;

    if (editor === null || model === null || value === editor.getValue()) {
      return;
    }

    let prevCursorPosition = editor.getPosition();

    if (prevCursorPosition === null) {
      return;
    }

    preventTriggerChangeEvent.current = true;
    editor.pushUndoStop();
    model.pushEditOperations(
      [],
      [
        {
          range: model.getFullModelRange(),
          text: value ?? null,
        },
      ],
      () => null,
    );

    editor.pushUndoStop();
    preventTriggerChangeEvent.current = false;
    editor.setPosition(prevCursorPosition);
    setRenderFinished(true);
  }, [value, editor, editor?.setPosition, editor?.getValue, editor?.getModel]);

  return renderFinished;
};

export type { Link, EditorProps };
