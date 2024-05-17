import { DiffEditor, type Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { memo, useEffect, useRef, useState } from 'react';
import { type Diff, getDiff } from '../../shared/Snippet/calculateDiff';
import configure from './configure';

export type { Diff };

type Props = Readonly<{
	jobHash: string;
	oldFileContent: string | null;
	newFileContent: string | null;
	viewType: 'inline' | 'side-by-side';
	theme: string;
	onDiffCalculated: (diff: Diff) => void;
	onChange(content: string): void;
}>;

let getDiffChanges = (
	editor: editor.IStandaloneDiffEditor,
): Diff | undefined => {
	let lineChanges = editor.getLineChanges();

	if (!lineChanges) {
		return;
	}
	return getDiff(lineChanges);
};

export let DiffComponent = memo(
	({
		oldFileContent,
		newFileContent,
		viewType,
		onDiffCalculated,
		onChange,
		theme,
		jobHash,
	}: Props) => {
		let editorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
		let [isMounted, setIsMounted] = useState(false);
		let [modifiedContent, setModifiedContent] = useState(newFileContent);

		useEffect(() => {
			let editor = editorRef.current;
			if (editor === null) {
				return;
			}
			editor.getModifiedEditor().setScrollTop(0);
		}, [jobHash]);

		useEffect(() => {
			let editor = editorRef.current;
			if (editor === null || !isMounted) {
				return;
			}

			let disposable = editor.onDidUpdateDiff(() => {
				let diffChanges = getDiffChanges(editor);

				if (diffChanges) {
					onDiffCalculated(diffChanges);
				}
			});
			return () => {
				disposable.dispose();
			};
		}, [onDiffCalculated, isMounted]);

		useEffect(() => {
			let editor = editorRef.current;
			if (editor === null || !isMounted) {
				return;
			}

			let modifiedEditor = editor.getModifiedEditor();
			let disposable = modifiedEditor.onDidChangeModelContent(() => {
				let content = modifiedEditor.getValue() ?? null;
				if (content === null) {
					return;
				}
				setModifiedContent(content);
				onChange(content);
			});
			return () => {
				disposable.dispose();
			};
		}, [onChange, isMounted]);

		useEffect(() => {
			// set modified content to `newFileContent` only once when the new job first loads
			setModifiedContent(newFileContent);
		}, [jobHash]);

		return (
			<DiffEditor
				theme={theme}
				onMount={(e: editor.IStandaloneDiffEditor, m: Monaco) => {
					editorRef.current = e;

					configure(e, m);
					setIsMounted(true);
				}}
				options={{
					readOnly: false,
					originalEditable: false,
					renderSideBySide: viewType === 'side-by-side',
					wrappingStrategy: 'advanced',
					wordWrap: 'wordWrapColumn',
					wordWrapColumn: 75,
					wrappingIndent: 'indent',
					scrollBeyondLastLine: false,
					wordBreak: 'normal',
					diffAlgorithm: 'smart',
					scrollBeyondLastColumn: 0,
					contextmenu: false,
					scrollbar: {
						horizontal: 'hidden',
						verticalSliderSize: 0,
						vertical: 'hidden',
						alwaysConsumeMouseWheel: false,
					},
				}}
				loading={<div>Loading content ...</div>}
				modified={modifiedContent ?? undefined}
				original={oldFileContent ?? undefined}
				modifiedModelPath="modified.tsx"
				originalModelPath="original.tsx"
				language="javascript"
			/>
		);
	},
);
