import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
	VSCodeButton,
	VSCodeProgressRing,
	VSCodeTextField,
} from '@vscode/webview-ui-toolkit/react';
import { common, createLowlight } from 'lowlight';
import { useEffect, useState } from 'react';
import { vscode } from '../shared/utilities/vscode';
import styles from './style.module.css';
import './tiptap.css';

let lowlight = createLowlight(common);
let unsanitizeCodeBlock = (codeBlock: string) =>
	codeBlock.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

let convertHTMLCodeBlockToMarkdownString = (htmlSnippet: string) =>
	htmlSnippet.replace(
		/<pre><code(?:\s+class="language-(.*?)")?>(.*?)<\/code><\/pre>/gs,
		(_match, language, content) =>
			`\n\n\`\`\`${language ?? 'typescript'}\n${unsanitizeCodeBlock(
				content,
			)}\n\`\`\`\n\n`,
	);

type Props = Readonly<{
	title: string;
	body: string;
	loading: boolean;
}>;

let CreateIssue = (props: Props) => {
	let [title, setTitle] = useState('');

	let onChangeTitle = (e: Event | React.FormEvent<HTMLElement>) => {
		let value =
			'target' in e && e.target !== null && 'value' in e.target
				? String(e.target.value)
				: null;

		if (value === null) {
			return;
		}

		setTitle(value);
	};
	let handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (editor === null) {
			return;
		}

		let htmlSnippet = editor.getHTML();

		vscode.postMessage({
			kind: 'webview.sourceControl.createIssue',
			data: {
				title,
				body: convertHTMLCodeBlockToMarkdownString(htmlSnippet),
			},
		});
	};

	let extensions = [
		StarterKit.configure({
			codeBlock: false,
		}),
		CodeBlockLowlight.configure({
			lowlight,
			// in our editor, we provide 1 syntax highlighting for all languages;
			// once transmitted to Github, the syntax highlighting will be handled there, and therefore
			// different syntax highlighting will be applied to different languages there;
			defaultLanguage: 'typescript',
		}),
	];

	let editor = useEditor({
		extensions,
		content: props.body,
		editable: true,
	});

	useEffect(() => {
		setTitle(props.title);
	}, [props.title]);

	useEffect(() => {
		if (props.loading) {
			return;
		}
		editor?.commands.setContent(props.body, false, {
			preserveWhitespace: true,
		});
	}, [editor, props.body, props.loading]);

	return (
		<div className={styles.root}>
			<h1 className={styles.header}>Report codemod issue</h1>
			<form onSubmit={handleSubmit} className={styles.form}>
				<VSCodeTextField
					placeholder="Title"
					value={title}
					onInput={onChangeTitle}
					className={styles.title}
				>
					Title
				</VSCodeTextField>
				<label className={styles.label}>Description</label>
				<EditorContent editor={editor} />

				<div className={styles.actions}>
					<VSCodeButton
						disabled={
							props.loading ||
							title.length <= 3 ||
							(editor?.getText() ?? '').length <= 5
						}
						type="submit"
						className={styles.actionButton}
					>
						{props.loading ? (
							<div className={styles.loadingContainer}>
								<VSCodeProgressRing
									className={styles.progressRing}
								/>
								<span>Creating...</span>
							</div>
						) : (
							'Create Issue'
						)}
					</VSCodeButton>
				</div>
			</form>
		</div>
	);
};

export default CreateIssue;
