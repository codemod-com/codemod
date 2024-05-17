import { useTheme } from "@context/useTheme";
import Editor, { type EditorProps, type Monaco } from "@monaco-editor/react";
import type { monaco } from "@studio/customMonaco";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { forwardRef, useRef, useState } from "react";
import configure from "./configure";
import { useEditor } from "./hook";

type Link = {
  regex: RegExp;
  handler(value: monaco.editor.IWordAtPosition): void;
};

type CustomProps = {
  id?: string;
  highlights: ReadonlyArray<OffsetRange>;
  decorations?: monaco.editor.IModelDeltaDecoration[];
  links?: Link[];
  placeholder?: string;
  reveal?: number;
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
};

let defaultOptions = {
  wordWrap: "on",
  wrappingIndent: "indent",
  minimap: {
    enabled: false,
  },
  scrollBeyondLastLine: false,
} as const;

let MonacoEditor = forwardRef<
  monaco.editor.IStandaloneCodeEditor,
  EditorProps & CustomProps
>(
  (
    {
      highlights,
      decorations,
      links,
      reveal,
      options,
      onSelectionChange,
      onClick,
      onKeyUp,
      onBlur,
      onChange,
      ...restProps
    },
    ref,
  ) => {
    let editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    let monacoRef = useRef<Monaco>();
    let { isDark } = useTheme();

    let [isMounted, setIsMounted] = useState(false);

    useEditor(
      editorRef.current ?? null,
      {
        highlights,
        decorations,
        links,
        startOffset: reveal,
        onSelectionChange,
        onClick,
        onKeyUp,
        onBlur,
        onChange,
        value: restProps.value,
      },
      isMounted,
    );

    return (
      <div className="relative h-full w-full">
        <Editor
          onMount={(editor, m) => {
            // @TODO move this to init
            editorRef.current = editor;
            monacoRef.current = m;

            if (typeof ref === "function") {
              ref(editor);
            } else if (ref) {
              ref.current = editor;
            }

            configure(m, editor);
            setIsMounted(true);
          }}
          theme={isDark ? "vs-dark" : "vs"}
          options={{
            ...defaultOptions,
            ...options,
          }}
          {...restProps}
        />
      </div>
    );
  },
);
MonacoEditor.displayName = "MonacoEditor";

export default MonacoEditor;
