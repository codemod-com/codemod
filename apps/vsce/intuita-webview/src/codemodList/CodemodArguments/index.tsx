import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/These';
import {
	CodemodArgumentWithValue,
	CodemodNodeHashDigest,
} from '../../../../src/selectors/selectCodemodTree';
import { CodemodHash } from '../../shared/types';
import debounce from '../../shared/utilities/debounce';
import { vscode } from '../../shared/utilities/vscode';
import { DirectorySelector } from '../components/DirectorySelector';
import FormField from './FormField';
import styles from './styles.module.css';

type Props = Readonly<{
	hashDigest: CodemodNodeHashDigest;
	arguments: ReadonlyArray<CodemodArgumentWithValue>;
	autocompleteItems: ReadonlyArray<string>;
	rootPath: string | null;
	executionPath: T.These<{ message: string }, string>;
}>;

const buildTargetPath = (path: string, rootPath: string, repoName: string) => {
	return path.replace(rootPath, '').length === 0
		? `${repoName}/`
		: path.replace(rootPath, repoName);
};

const handleCodemodPathChange = debounce((rawCodemodPath: string) => {
	const codemodPath = rawCodemodPath.trim();

	vscode.postMessage({
		kind: 'webview.codemodList.codemodPathChange',
		codemodPath,
	});
}, 50);

const CodemodArguments = ({
	hashDigest,
	arguments: args,
	autocompleteItems,
	rootPath,
	executionPath,
}: Props) => {
	const onChangeFormField = (fieldName: string) => (value: string) => {
		vscode.postMessage({
			kind: 'webview.global.setCodemodArgument',
			hashDigest,
			name: fieldName,
			value,
		});
	};

	const error: string | null = pipe(
		O.fromNullable(executionPath),
		O.fold(
			() => null,
			T.fold(
				({ message }) => message,
				() => null,
				({ message }) => message,
			),
		),
	);

	const path: string = pipe(
		O.fromNullable(executionPath),
		O.fold(
			() => '',
			T.fold(
				() => '',
				(p) => p,
				(_, p) => p,
			),
		),
	);

	const repoName =
		rootPath !== null ? rootPath.split('/').slice(-1)[0] ?? '' : '';

	const targetPath =
		rootPath !== null ? buildTargetPath(path, rootPath, repoName) : '/';

	return (
		<div className={styles.root}>
			<form className={styles.form}>
				<DirectorySelector
					defaultValue={targetPath}
					displayValue={'path'}
					rootPath={rootPath ?? ''}
					error={error === null ? null : { message: error }}
					codemodHash={hashDigest as unknown as CodemodHash}
					onChange={handleCodemodPathChange}
					autocompleteItems={autocompleteItems}
				/>
				{args.map((props) => (
					<FormField
						{...props}
						onChange={onChangeFormField(props.name)}
					/>
				))}
			</form>
		</div>
	);
};

export default CodemodArguments;
