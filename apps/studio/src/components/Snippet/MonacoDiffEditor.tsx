import { DiffEditor, type DiffEditorProps } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { type monaco } from "~/customMonaco";
import { VisibilityOptions } from "~/types/options";
import { alwaysVisible } from "~/utils/visibility";
import { useTheme } from "../../pageComponents/main/themeContext";
import { type EditorProps, useEditor } from "./hook";

type CustomProps = {
	id?: string;
	placeholder?: string;
	originalEditorProps: EditorProps;
	modifiedEditorProps: EditorProps;
	leftPaneVisibilityOptions?: VisibilityOptions;
};

const defaultOptions = {
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

const MonacoDiffEditor = ({
	leftPaneVisibilityOptions = alwaysVisible,
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

	useEffect(() => {
		editorRef.current?.updateOptions({
			renderSideBySide: leftPaneVisibilityOptions.isVisible,
		});
	}, [leftPaneVisibilityOptions?.isVisible]);

	return (
		<DiffEditor
			onMount={(editor) => {
				editorRef.current = editor;
				setMounted(true);
			}}
			theme={isDark ? "vs-dark" : "vs"}
			options={{ ...(options ?? {}), ...defaultOptions }}
			{...restProps}
		/>
	);
};

export default MonacoDiffEditor;
