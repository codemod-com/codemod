import * as O from "fp-ts/Option";
import * as T from "fp-ts/These";
import { pipe } from "fp-ts/lib/function";
import {
	CodemodArgumentWithValue,
	CodemodNodeHashDigest,
} from "../../../../src/selectors/selectCodemodTree";
import { CodemodHash } from "../../shared/types";
import { vscode } from "../../shared/utilities/vscode";
import { DirectorySelector } from "../components/DirectorySelector";
import FormField from "./FormField";
import styles from "./styles.module.css";

type Props = Readonly<{
	hashDigest: CodemodNodeHashDigest;
	arguments: ReadonlyArray<CodemodArgumentWithValue>;
	autocompleteItems: ReadonlyArray<string>;
	executionPath: T.These<{ message: string }, string>;
}>;

const updatePath = (value: string, codemodHash: CodemodHash) => {
	vscode.postMessage({
		kind: "webview.codemodList.updatePathToExecute",
		value: {
			newPath: value,
			codemodHash,
			errorMessage: "",
			warningMessage: "",
			revertToPrevExecutionIfInvalid: false,
		},
	});
};

const CodemodArguments = ({
	hashDigest,
	arguments: args,
	autocompleteItems,
	executionPath,
}: Props) => {
	const onChangeFormField = (fieldName: string) => (value: string) => {
		vscode.postMessage({
			kind: "webview.global.setCodemodArgument",
			hashDigest,
			name: fieldName,
			value,
		});
	};

	const path: string = pipe(
		O.fromNullable(executionPath),
		O.fold(
			() => "",
			T.fold(
				() => "",
				(p) => p,
				(_, p) => p,
			),
		),
	);

	return (
		<div className={styles.root}>
			<form className={styles.form}>
				<DirectorySelector
					initialValue={path}
					onChange={(value: string) =>
						updatePath(value, hashDigest as unknown as CodemodHash)
					}
					autocompleteItems={autocompleteItems}
				/>
				{args.map((props) => (
					<FormField {...props} onChange={onChangeFormField(props.name)} />
				))}
			</form>
		</div>
	);
};

export default CodemodArguments;
