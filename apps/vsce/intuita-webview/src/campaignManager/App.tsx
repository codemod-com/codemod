import { vscode } from '../shared/utilities/vscode';
import styles from './style.module.css';
import '../shared/util.css';
import cn from 'classnames';
import { CaseHash } from '../../../src/cases/types';
import { CodemodRunsTree } from '../../../src/selectors/selectCodemodRunsTree';
import { MainWebviewViewProps } from '../../../src/selectors/selectMainWebviewViewProps';
import { ReactComponent as CaseIcon } from '../assets/case.svg';
import { IntuitaTreeView } from '../intuitaTreeView';
import LoadingProgress from '../jobDiffView/Components/LoadingProgress';
import IntuitaPopover from '../shared/IntuitaPopover';
import TreeItem from '../shared/TreeItem';

type InfoIconProps = {
	createdAt: number;
	path: string;
};

const InfoIcon = ({ createdAt, path }: InfoIconProps) => {
	return (
		<IntuitaPopover
			content={`Executed on ${path} at ${new Date(
				Number(createdAt),
			).toLocaleTimeString()}`}
		>
			<span className={cn('codicon', 'codicon-info')} />
		</IntuitaPopover>
	);
};

export const App = (
	props: MainWebviewViewProps & { activeTabId: 'codemodRuns' },
) => {
	if (props.codemodRunsTree === null) {
		// no workspace is chosen
		return (
			<p className={styles.welcomeMessage}>
				No change to review! Run some codemods via Codemod Discovery or
				VS Code Command & check back later!
			</p>
		);
	}

	if (props.codemodRunsTree.nodeData.length === 0) {
		return props.codemodExecutionInProgress ? (
			// `nodeData.length` can be zero momentarily even if a codemod is actually in progress
			<LoadingProgress description="Executing codemod..." />
		) : (
			<p className={styles.welcomeMessage}>
				No change to review! Run some codemods via Codemod Discovery or
				VS Code Command & check back later!
			</p>
		);
	}

	return (
		<IntuitaTreeView<CaseHash, CodemodRunsTree['nodeData'][0]['node']>
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
								paddingRight: '3px',
							},
						}}
					/>
				);
			}}
			onFlip={() => {}}
			onFocus={function (hashDigest: CaseHash): void {
				vscode.postMessage({
					kind: 'webview.campaignManager.setSelectedCaseHash',
					caseHash: hashDigest,
				});
			}}
		/>
	);
};
