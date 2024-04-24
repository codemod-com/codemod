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

const findMatches = (
  str: string,
  regex: RegExp,
): { start: number; end: number }[] => {
  const matches: { start: number; end: number }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(str)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return matches;
};

const getLinkDecorations = (
  editor: monaco.editor.IStandaloneCodeEditor,
  links: Link[],
) => {
  const result: monaco.editor.IModelDeltaDecoration[] = [];

  const text = editor.getValue();
  const model = editor.getModel();

  if (!model) {
    return [];
  }

  links.forEach((link) => {
    const ranges = findMatches(text, link.regex);

    ranges.forEach((range) => {
      // @TODO move this to helper
      const startPos = model.getPositionAt(range.start);
      const endPos = model.getPositionAt(range.end);

      const monacoRange = monaco.Range.fromPositions(startPos, endPos);
      const linkDecoration = {
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

export const useEditor = (
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
  const [renderFinished, setRenderFinished] = useState(false);
  const decorationsIdRef = useRef<string[]>();
  const didChangeCursorSelectionRef = useRef<monaco.IDisposable>();
  const didChangeModelContentRef = useRef<monaco.IDisposable>();
  const didBlurEditorWidgetRef = useRef<monaco.IDisposable>();
  const mouseDownRef = useRef<monaco.IDisposable>();
  const keyUpRef = useRef<monaco.IDisposable>();
  const preventTriggerChangeEvent = useRef<boolean | null>(null);
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
        const startPos = selection.getStartPosition();
        const endPos = selection.getEndPosition();

        const startOffset = editor.getModel()?.getOffsetAt(startPos);
        const endOffset = editor.getModel()?.getOffsetAt(endPos);

        if (startOffset === undefined || endOffset === undefined) {
          return;
        }

        onSelectionChange({ start: startOffset, end: endOffset });
      },
    );
  }, [onSelectionChange, mounted]);

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
  }, [onChange, mounted]);

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
  }, [onBlur, mounted]);

  /**
   * Mouse down handelr
   */
  useEffect(() => {
    const model = editor?.getModel() ?? null;

    if (onClick === undefined || editor === null || model === null) {
      return;
    }

    const onMouseDownHandler = (e: monaco.editor.IEditorMouseEvent) => {
      const { position } = e.target;

      if (!position) {
        return;
      }

      const offset = editor.getModel()?.getOffsetAt(position);

      if (offset) {
        onClick(offset);
      }

      const word = model.getWordAtPosition(position);

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
  }, [onClick, links, mounted]);

  useEffect(() => {
    const model = editor?.getModel() ?? null;

    if (onKeyUp === undefined || editor === null || model === null) {
      return;
    }

    keyUpRef.current?.dispose();
    keyUpRef.current = editor.onKeyUp((e) => {
      const position = editor.getPosition();

      if (position === null) {
        return;
      }

      const offset = model.getOffsetAt(position);

      onKeyUp({ offset, event: e });
    });
  }, [onKeyUp, mounted]);

  /**
   * Start offset
   */

  useEffect(() => {
    if (startOffset === undefined || editor === null) {
      return;
    }

    const startPosition = editor.getModel()?.getPositionAt(startOffset);

    if (startPosition === undefined) {
      return;
    }

    editor.revealPositionInCenter(
      startPosition,
      monaco.editor.ScrollType.Smooth,
    );
  }, [startOffset, mounted]);

  /**
   * Decorations
   */

  useEffect(() => {
    const model = editor?.getModel() ?? null;

    if (editor === null || model === null) {
      return;
    }

    const highlightDecorations: monaco.editor.IModelDeltaDecoration[] = [];

    highlights.forEach((highlight) => {
      const startPosition = model.getPositionAt(highlight.start);
      const endPosition = model.getPositionAt(highlight.end);
      const range = monaco.Range.fromPositions(startPosition, endPosition);

      highlightDecorations.push({
        range,
        options: {
          isWholeLine: false,
          inlineClassName: "highlight",
        },
      });
    });

    const linkDecorations = getLinkDecorations(editor, links ?? []);

    const allDecorations = [
      ...highlightDecorations,
      ...linkDecorations,
      ...(decorations ?? []),
    ];

    editor.deltaDecorations(decorationsIdRef.current ?? [], []);

    decorationsIdRef.current = editor.deltaDecorations([], allDecorations);
  }, [links, decorations, highlights, mounted]);

  /**
   * Value setter
   */
  useEffect(() => {
    const model = editor?.getModel() ?? null;

    if (editor === null || model === null || value === editor.getValue()) {
      return;
    }

    const prevCursorPosition = editor.getPosition();

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
  }, [value, mounted]);

  return renderFinished;
};

export type { Link, EditorProps };
