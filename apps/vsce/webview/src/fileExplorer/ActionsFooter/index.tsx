import {
	VSCodeButton,
	VSCodeProgressRing,
} from '@vscode/webview-ui-toolkit/react';
import type { CaseHash } from '../../../../src/cases/types';
import CustomPopover from '../../shared/CustomPopover';
import { vscode } from '../../shared/utilities/vscode';
import styles from './style.module.css';

let POPOVER_TEXTS = {
	discard: 'Discard selected changes for the highlighted codemod.',
	apply: 'Save selected changes to file(s).',
	cannotApply: 'At least one job should be selected to apply the changes.',
};

let discardSelected = (caseHashDigest: CaseHash) => {
	vscode.postMessage({
		kind: 'webview.global.discardSelected',
		caseHashDigest,
	});
};

let applySelected = (caseHashDigest: CaseHash) => {
	vscode.postMessage({
		kind: 'webview.global.applySelected',
		caseHashDigest,
	});
};

let getDiscardText = (selectedJobCount: number) => {
	return `Discard ${selectedJobCount} ${
		selectedJobCount === 1 ? 'file' : 'files'
	}`;
};
let getApplyText = (selectedJobCount: number) => {
	return `Apply ${selectedJobCount} ${
		selectedJobCount === 1 ? 'file' : 'files'
	}`;
};

type Props = Readonly<{
	caseHash: CaseHash;
	selectedJobCount: number;
	applySelectedInProgress: boolean;
	screenWidth: number | null;
}>;

export let ActionsFooter = ({
	caseHash,
	selectedJobCount,
	screenWidth,
	applySelectedInProgress,
}: Props) => {
	return (
		<div
			className={styles.root}
			style={{
				...(screenWidth !== null &&
					screenWidth >= 300 && { justifyContent: 'flex-end' }),
			}}
		>
			<CustomPopover content={POPOVER_TEXTS.discard}>
				<VSCodeButton
					appearance="secondary"
					onClick={(event) => {
						event.preventDefault();

						discardSelected(caseHash);
					}}
					className={styles.vscodeButton}
					disabled={selectedJobCount === 0}
				>
					{getDiscardText(selectedJobCount)}
				</VSCodeButton>
			</CustomPopover>
			<CustomPopover
				content={
					selectedJobCount === 0
						? POPOVER_TEXTS.cannotApply
						: POPOVER_TEXTS.apply
				}
			>
				<VSCodeButton
					appearance="primary"
					onClick={(event) => {
						event.preventDefault();

						applySelected(caseHash);
					}}
					className={styles.vscodeButton}
					disabled={applySelectedInProgress || selectedJobCount === 0}
				>
					{applySelectedInProgress && (
						<VSCodeProgressRing className={styles.progressRing} />
					)}
					{getApplyText(selectedJobCount)}
				</VSCodeButton>
			</CustomPopover>
		</div>
	);
};
