import cn from "classnames";
import type { CaseHash } from "../../../src/cases/types";
import type { CodemodRunsTree } from "../../../src/selectors/selectCodemodRunsTree";
import type { MainWebviewViewProps } from "../../../src/selectors/selectMainWebviewViewProps";
import { ReactComponent as CaseIcon } from "../assets/case.svg";
import { CustomTreeView } from "../customTreeView";
import LoadingProgress from "../jobDiffView/Components/LoadingProgress";
import CustomPopover from "../shared/CustomPopover";
import TreeItem from "../shared/TreeItem";
import "../shared/util.css";
import { vscode } from "../shared/utilities/vscode";
import styles from "./style.module.css";

type InfoIconProps = {
	createdAt: number;
	path: string;
};

const InfoIcon = ({ createdAt, path }: InfoIconProps) => {
	return (
		<CustomPopover
			content={`Executed on ${path} at ${new Date(
				Number(createdAt),
			).toLocaleTimeString()}`}
		>
			<span className={cn("codicon", "codicon-info")} />
		</CustomPopover>
	);
};

export const App = (
	props: MainWebviewViewProps & { activeTabId: "codemodRuns" },
) => {
	if (props.codemodRunsTree === null) {
		// no workspace is chosen
		return (
			<p className={styles.welcomeMessage}>
				No change to review! Run some codemod from "Codemods" tab!
			</p>
		);
	}

	if (props.codemodRunsTree.nodeData.length === 0) {
		return props.codemodExecutionInProgress ? (
			// `nodeData.length` can be zero momentarily even if a codemod is actually in progress
			<LoadingProgress description="Executing codemod..." />
		) : (
			<p className={styles.welcomeMessage}>
				No change to review! Run some codemod from "Codemods" tab!
			</p>
		);
	}

	return (
		<CustomTreeView<CaseHash, CodemodRunsTree["nodeData"][0]["node"]>
			focusedNodeHashDigest={props.codemodRunsTree.selectedNodeHashDigest}
			collapsedNodeHashDigests={[]}
			nodeData={props.codemodRunsTree.nodeData}
			nodeRenderer={(props) => {
				return (
					<TreeItem
						key={props.nodeDatum.node.hashDigest}
						hasChildren={props.nodeDatum.collapsable}
						id={props.nodeDatum.node.hashDigest}
						label={props.nodeDatum.node.label}
						searchPhrase=""
						icon={<CaseIcon />}
						depth={props.nodeDatum.depth}
						indent={props.nodeDatum.depth * 18}
						open={false}
						focused={props.nodeDatum.focused}
						onClick={(event) => {
							event.stopPropagation();

							props.onFocus(props.nodeDatum.node.hashDigest);
						}}
						endDecorator={
							<InfoIcon
								createdAt={props.nodeDatum.node.createdAt}
								path={props.nodeDatum.node.path}
							/>
						}
						inlineStyles={{
							root: {
								paddingRight: "3px",
							},
						}}
					/>
				);
			}}
			onFlip={() => {}}
			onFocus={(hashDigest: CaseHash): void => {
				vscode.postMessage({
					kind: "webview.campaignManager.setSelectedCaseHash",
					caseHash: hashDigest,
				});
			}}
		/>
	);
};
