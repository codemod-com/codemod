import { VSCodeButton, VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import React from 'react';
import './Container.css';
import { PanelViewProps } from '../../../../src/components/webview/panelViewProps';
import { ReactComponent as CopyIcon } from '../../assets/copy.svg';
import { JobKind } from '../../shared/constants';
import IntuitaPopover from '../../shared/IntuitaPopover';
import { vscode } from '../../shared/utilities/vscode';
import { Diff } from './Diff';

type HeaderProps = Readonly<{
	diff: Diff | null;
	title: string;
	oldFileTitle: string;
	jobKind: (PanelViewProps & { kind: 'JOB' })['jobKind'];
	caseHash: (PanelViewProps & { kind: 'JOB' })['caseHash'];
	jobHash: (PanelViewProps & { kind: 'JOB' })['jobHash'];
	reviewed: (PanelViewProps & { kind: 'JOB' })['reviewed'];
	onReportIssue(): void;
	onFixInStudio(): void;
	modifiedByUser: boolean;
	children?: React.ReactNode;
}>;

export const Header = ({
	diff,
	title,
	oldFileTitle,
	jobKind,
	caseHash,
	jobHash,
	modifiedByUser,
	children,
	reviewed,
	onReportIssue,
}: // onFixInStudio,
HeaderProps) => {
	const jobKindText = getJobKindText(jobKind as unknown as JobKind);
	const hasDiff = diff !== null;
	const handleCopyFileName = (event: React.FormEvent<HTMLElement>) => {
		event.stopPropagation();
		navigator.clipboard.writeText(title);
		vscode.postMessage({
			kind: 'webview.global.showInformationMessage',
			value: 'File name copied to clipboard',
		});
	};
	const handleReviewedClick = (event: React.MouseEvent) => {
		event.stopPropagation();

		vscode.postMessage({
			kind: 'webview.global.flipReviewedExplorerNode',
			caseHashDigest: caseHash,
			jobHash,
			path: title,
		});
	};

	return (
		<div className="align-items-center container-header flex w-full">
			<div className="flex flex-1 flex-row flex-wrap justify-between">
				<div className="align-items-center flex flex-1">
					{hasDiff ? (
						<div className="align-items-center flex">
							<span className="diff-changes diff-removed">
								-
								{[
									JobKind.createFile,
									JobKind.copyFile,
									JobKind.moveFile,
								].includes(jobKind as unknown as JobKind)
									? '0'
									: diff.removed}
							</span>

							<span> / </span>

							<span className="diff-changes diff-added">
								+{diff.added}
							</span>
						</div>
					) : null}
					{jobKindText ? (
						<h4 className="highlighted-text align-self-center user-select-none my-0 ml-2">
							{jobKindText}
						</h4>
					) : null}
					<IntuitaPopover
						disabled={
							(jobKind as unknown as JobKind) !== JobKind.copyFile
						}
						content={`Copied from ${oldFileTitle}`}
					>
						<h4 className="diff-title align-self-center user-select-none my-0 ml-1">
							{title.startsWith('/') ? title.slice(1) : title}
						</h4>
					</IntuitaPopover>
					<VSCodeButton
						onClick={handleCopyFileName}
						appearance="icon"
						className="vscode-button"
					>
						<CopyIcon className="copy-icon" />
					</VSCodeButton>
					{modifiedByUser ? (
						<IntuitaPopover
							content={
								<div
									style={{
										padding: '8px',
										backgroundColor:
											'var(--vscode-tab-inactiveBackground)',
									}}
								>
									Saved in the temporary dry-run file. Not
									applied to the workspace.
								</div>
							}
							placement="bottom"
						>
							<h4
								className="highlighted-text align-self-center user-select-none my-0 ml-2"
								style={{ fontSize: '0.7rem' }}
							>
								Saved
							</h4>
						</IntuitaPopover>
					) : null}
				</div>

				<div
					className="flex gap-4"
					onClick={(e) => {
						e.stopPropagation();
					}}
					style={{ height: '28px' }}
				>
					<div
						className="align-items-center checkbox-container flex"
						onClick={handleReviewedClick}
					>
						<VSCodeCheckbox checked={reviewed} />
						<p
							className="user-select-none ml-10"
							style={{
								color: 'var(--button-secondary-foreground)',
							}}
						>
							Reviewed
						</p>
					</div>
					<IntuitaPopover
						content={
							<div
								style={{
									padding: '8px',
									backgroundColor:
										'var(--vscode-tab-inactiveBackground)',
								}}
							>
								Open a Github issue with a provided template to
								report a problem.
							</div>
						}
						placement="bottom"
					>
						<VSCodeButton
							appearance="secondary"
							onClick={onReportIssue}
							// className="mr-1"
						>
							Report Issue
						</VSCodeButton>
					</IntuitaPopover>
					{/* <VSCodeButton
						appearance="secondary"
						onClick={onFixInStudio}
					>
						Fix in Studio
					</VSCodeButton> */}
				</div>
			</div>
			{children}
		</div>
	);
};

const getJobKindText = (jobKind: JobKind): string => {
	switch (jobKind) {
		case JobKind.copyFile:
		case JobKind.createFile:
			return '(created)';
		case JobKind.deleteFile:
			return '(deleted)';
		case JobKind.moveAndRewriteFile:
			return '(moved & rewritten)';
		case JobKind.moveFile:
			return '(moved)';
		default:
			return '';
	}
};
