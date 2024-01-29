import {
	VSCodeButton,
	VSCodeProgressRing,
} from '@vscode/webview-ui-toolkit/react';
import { CaseHash } from '../../../../src/cases/types';
import IntuitaPopover from '../../shared/IntuitaPopover';
import { vscode } from '../../shared/utilities/vscode';
import styles from './style.module.css';

const POPOVER_TEXTS = {
	discard: 'Discard selected changes for the highlighted codemod.',
	apply: 'Save selected changes to file(s).',
	cannotApply: 'At least one job should be selected to apply the changes.',
};

const discardSelected = (caseHashDigest: CaseHash) => {
	vscode.postMessage({
		kind: 'webview.global.discardSelected',
		caseHashDigest,
	});
};

const applySelected = (caseHashDigest: CaseHash) => {
	vscode.postMessage({
		kind: 'webview.global.applySelected',
		caseHashDigest,
	});
};

const getDiscardText = (selectedJobCount: number) => {
	return `Discard ${selectedJobCount} ${
		selectedJobCount === 1 ? 'file' : 'files'
	}`;
};
const getApplyText = (selectedJobCount: number) => {
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

export const ActionsFooter = ({
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
			<IntuitaPopover content={POPOVER_TEXTS.discard}>
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
			</IntuitaPopover>
			<IntuitaPopover
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
			</IntuitaPopover>
		</div>
	);
};
