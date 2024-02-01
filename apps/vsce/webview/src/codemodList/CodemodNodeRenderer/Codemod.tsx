import cn from 'classnames';
import areEqual from 'fast-deep-equal';
import { memo, useState } from 'react';
import { CodemodNode } from '../../../../src/selectors/selectCodemodTree';
import CustomPopover from '../../shared/CustomPopover';
import { CodemodHash } from '../../shared/types';
import { vscode } from '../../shared/utilities/vscode';
import ActionButton from '../TreeView/ActionButton';
import { Progress } from '../useProgressBar';
import styles from './style.module.css';
import 'react-toastify/dist/ReactToastify.css';

type CodemodItemNode = CodemodNode & { kind: 'CODEMOD' };

type Props = Omit<CodemodItemNode, 'name' | 'kind'> &
	Readonly<{
		progress: Progress | null;
		screenWidth: number | null;
		focused: boolean;
		argumentsExpanded: boolean;
	}>;

const renderActionButtons = (
	hashDigest: CodemodItemNode['hashDigest'],
	isPrivate: CodemodItemNode['isPrivate'],
	permalink: CodemodItemNode['permalink'],
	codemodInProgress: boolean,
	queued: boolean,
	label: string,
	argumentsExpanded: boolean,
) => {
	if (!codemodInProgress && !queued) {
		const handleDryRunClick = (e: React.MouseEvent) => {
			e.stopPropagation();

			vscode.postMessage({
				kind: isPrivate
					? 'webview.codemodList.dryRunPrivateCodemod'
					: 'webview.codemodList.dryRunCodemod',
				value: hashDigest as unknown as CodemodHash,
				name: label,
			});
		};
		const handleCodemodLinkCopy = (e: React.MouseEvent) => {
			e.stopPropagation();

			if (!isPrivate) {
				navigator.clipboard.writeText(
					`vscode://codemod.codemod-vscode-extension/showCodemod?chd=${hashDigest}`,
				);
				vscode.postMessage({
					kind: 'webview.global.showInformationMessage',
					value: 'Codemod link copied to clipboard',
				});
				return;
			}
			if (permalink === null) {
				vscode.postMessage({
					kind: 'webview.global.showWarningMessage',
					value: 'Permalink for this codemod is missing. Re-export it from Codemod studio.',
				});
				return;
			}

			navigator.clipboard.writeText(permalink);
			vscode.postMessage({
				kind: 'webview.global.showInformationMessage',
				value: 'Permalink in codemod studio copied to clipboard',
			});
		};

		const handleCodemodArgumentsClick = () => {
			vscode.postMessage({
				kind: 'webview.global.setCodemodArgumentsPopupHashDigest',
				hashDigest: argumentsExpanded ? null : hashDigest,
			});
		};

		const handleRemovePrivateCodemod = () => {
			vscode.postMessage({
				kind: 'webview.main.removePrivateCodemod',
				hashDigest,
			});
		};

		return (
			<>
				<ActionButton
					id={`${hashDigest}-dryRunButton`}
					content="Set codemod arguments"
					onClick={handleCodemodArgumentsClick}
					active={argumentsExpanded}
				>
					<span className={cn('codicon', 'codicon-settings-gear')} />
				</ActionButton>
				<ActionButton
					id={`${hashDigest}-dryRunButton`}
					content="Dry-run this codemod (without making change to file system)."
					onClick={handleDryRunClick}
				>
					<span className={cn('codicon', 'codicon-play')} />
				</ActionButton>
				<ActionButton
					id={`${hashDigest}-shareButton`}
					content={
						isPrivate
							? 'Copy to clipboard the permalink in codemod studio.'
							: 'Copy to clipboard the link to this codemod.'
					}
					onClick={handleCodemodLinkCopy}
				>
					<span className={cn('codicon', 'codicon-link')} />
				</ActionButton>
				{isPrivate && (
					<ActionButton
						id={`${hashDigest}-deleteButton`}
						content={'Remove from Private Registry'}
						onClick={handleRemovePrivateCodemod}
					>
						<span className={cn('codicon', 'codicon-trash')} />
					</ActionButton>
				)}
			</>
		);
	}

	if (!codemodInProgress && queued) {
		return (
			<CustomPopover content="This codemod has already been queued for execution.">
				<i className="codicon codicon-history mr-2" />
			</CustomPopover>
		);
	}

	return (
		<ActionButton
			content="Stop Codemod Execution"
			iconName="codicon-debug-stop"
			onClick={(e) => {
				e.stopPropagation();
				vscode.postMessage({
					kind: 'webview.codemodList.haltCodemodExecution',
				});
			}}
		/>
	);
};

const getLabelStyle = (
	areButtonsVisible: boolean,
	screenWidth: number | null,
) => {
	if (screenWidth === null) {
		return undefined;
	}
	if (
		(areButtonsVisible && screenWidth > 330) ||
		(!areButtonsVisible && screenWidth > 235)
	) {
		return undefined;
	}

	if (areButtonsVisible) {
		if (screenWidth <= 190) {
			return { flex: screenWidth / 830 };
		}
		if (screenWidth <= 210) {
			return { flex: screenWidth / 580 };
		}
		if (screenWidth <= 235) {
			return { flex: screenWidth / 470 };
		}
		if (screenWidth <= 265) {
			return { flex: screenWidth / 420 };
		}
	}

	return { flex: screenWidth / 375 };
};

const getActionGroupStyle = (
	areButtonsVisible: boolean,
	screenWidth: number | null,
) => {
	if (screenWidth === null || !areButtonsVisible || screenWidth > 330) {
		return undefined;
	}

	if (screenWidth <= 235) {
		return { marginLeft: 0 };
	}
	if (screenWidth <= 265) {
		return { marginLeft: '4px' };
	}
	return { marginLeft: '8px' };
};

const Codemod = ({
	hashDigest,
	label,
	progress,
	queued,
	icon,
	screenWidth,
	focused,
	isPrivate,
	permalink,
	argumentsExpanded,
}: Props) => {
	const [hovering, setHovering] = useState(false);
	const areButtonsVisible = focused || hovering;

	const popoverText =
		icon === 'private'
			? 'Private codemod'
			: icon === 'certified'
			  ? 'Codemod maintained by Codemod.com'
			  : 'Codemod maintained by the community';

	return (
		<>
			<div
				id={`${hashDigest}-codemod`}
				className={styles.codemodRoot}
				onMouseEnter={() => {
					setHovering(true);
				}}
				onMouseLeave={() => {
					setHovering(false);
				}}
			>
				<CustomPopover content={popoverText}>
					{icon === 'private' ? (
						<span className={cn('codicon', 'codicon-star')} />
					) : icon === 'certified' ? (
						<span
							className={cn('codicon', 'codicon-verified')}
							style={{
								color: 'var(--vscode-focusBorder)',
							}}
						/>
					) : (
						<span className={cn('codicon', 'codicon-verified')} />
					)}
				</CustomPopover>
				<span
					className={cn(
						styles.labelContainer,
						focused && styles.focused,
					)}
				>
					<span
						className={styles.label}
						style={getLabelStyle(areButtonsVisible, screenWidth)}
					>
						{label}
					</span>
					<div
						className={styles.actionGroup}
						style={{
							...getActionGroupStyle(
								areButtonsVisible,
								screenWidth,
							),
						}}
					>
						{renderActionButtons(
							hashDigest,
							isPrivate,
							permalink,
							progress !== null,
							queued,
							label,
							argumentsExpanded,
						)}
					</div>
				</span>
			</div>
		</>
	);
};

export default memo(Codemod, areEqual);
