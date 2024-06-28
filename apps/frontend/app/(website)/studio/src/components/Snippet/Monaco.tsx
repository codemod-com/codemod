import { cn } from "@/utils";
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
  className?: string;
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

const defaultOptions = {
  wordWrap: "on",
  wrappingIndent: "indent",
  minimap: {
    enabled: false,
  },
  scrollBeyondLastLine: false,
} as const;

const MonacoEditor = forwardRef<
  monaco.editor.IStandaloneCodeEditor,
  EditorProps & CustomProps
>(
  (
    {
      className,
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
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const monacoRef = useRef<Monaco>();
    const { isDark } = useTheme();
    console.log("MonacoEditor");
    const [isMounted, setIsMounted] = useState(false);

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
      <div className={cn(className, "relative h-full w-full")}>
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
