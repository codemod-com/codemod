import { DiffEditor, type DiffEditorProps } from '@monaco-editor/react';
import { useRef, useState } from 'react';
import { type monaco } from '~/customMonaco';
import { useTheme } from '../../pageComponents/main/themeContext';
import { useEditor, type EditorProps } from './hook';

type CustomProps = {
	id?: string;
	placeholder?: string;
	originalEditorProps: EditorProps;
	modifiedEditorProps: EditorProps;
};

const defaultOptions = {
	wordWrap: 'on',
	wrappingIndent: 'indent',
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
			theme={isDark ? 'vs-dark' : 'vs'}
			options={{ ...(options ?? {}), ...defaultOptions }}
			{...restProps}
		/>
	);
};

export default MonacoDiffEditor;
