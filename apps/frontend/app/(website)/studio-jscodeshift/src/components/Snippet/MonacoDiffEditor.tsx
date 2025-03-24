import { useTheme } from "@context/useTheme";
import { DiffEditor, type DiffEditorProps } from "@monaco-editor/react";
import { defaultOptions } from "@studio/components/Snippet/consts";
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

const MonacoDiffEditor = ({
  originalEditorProps,
  modifiedEditorProps,
  options,
  ...restProps
}: DiffEditorProps & CustomProps) => {
  const [mounted, setMounted] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneDiffEditor>();
  const originalEditor = editorRef.current?.getOriginalEditor() ?? null;
  const modifiedEditor = editorRef.current?.getModifiedEditor() ?? null;
  const { isDark } = useTheme();

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
      style={{
        ".monaco-editor .monaco-editor-overlaymessage": {
          maxWidth: "400px",
          whiteSpace: "normal",
          wordWrap: "break-word",
        },
      }}
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
