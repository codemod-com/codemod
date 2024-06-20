import { useTheme } from "@context/useTheme";
import { DiffEditor, type DiffEditorProps } from "@monaco-editor/react";
import type { monaco } from "@studio/customMonaco";
import type { VisibilityOptions } from "@studio/types/options";
import { useRef, useState } from "react";
import { type EditorProps, useEditor } from "./hook";

type CustomProps = {
  id?: string;
  placeholder?: string;
  originalEditorProps: EditorProps;
  modifiedEditorProps: EditorProps;
  leftPaneVisibilityOptions?: VisibilityOptions;
  renderSideBySide: boolean;
};

let defaultOptions = {
  wordWrap: "on",
  wrappingIndent: "indent",
  minimap: {
    enabled: false,
  },
  renderOverviewRuler: false,
  diffOverviewRuler: false,
  fixedOverflowWidgets: true,
  // removes scroll after last line
  scrollBeyondLastLine: false,
} as const;

let MonacoDiffEditor = ({
  originalEditorProps,
  modifiedEditorProps,
  options,
  ...restProps
}: DiffEditorProps & CustomProps) => {
  let [mounted, setMounted] = useState(false);
  let editorRef = useRef<monaco.editor.IStandaloneDiffEditor>();
  let originalEditor = editorRef.current?.getOriginalEditor() ?? null;
  let modifiedEditor = editorRef.current?.getModifiedEditor() ?? null;

  let { isDark } = useTheme();

  useEditor(originalEditor, originalEditorProps, mounted);
  useEditor(modifiedEditor, modifiedEditorProps, mounted);

  return (
    <DiffEditor
      onMount={(editor) => {
        editorRef.current = editor;
        setMounted(true);
      }}
      language="typescript"
      theme={isDark ? "vs-dark" : "vs"}
      options={{
        ...(options ?? {}),
        ...defaultOptions,
        enableSplitViewResizing: false,
      }}
      {...restProps}
    />
  );
};

export default MonacoDiffEditor;
