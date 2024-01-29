import cn from 'classnames';
import { useEffect, useRef } from 'react';
import {
	CodemodNodeHashDigest,
	NodeDatum,
} from '../../../../src/selectors/selectCodemodTree';
import { CodemodHash } from '../../shared/types';
import CodemodArguments from '../CodemodArguments';
import { InfiniteProgress } from '../TreeView/InfiniteProgress';
import ProgressBar from '../TreeView/ProgressBar';
import { Progress } from '../useProgressBar';
import Codemod from './Codemod';
import Directory from './Directory';
import styles from './style.module.css';

const EXPANDABLE_CONTENT_MAX_HEIGHT = 1000;

const getIndent = (depth: number) => {
	return depth * 17;
};

type Deps = {
	progress: Progress | null;
	screenWidth: number | null;
	rootPath: string | null;
	autocompleteItems: ReadonlyArray<string>;
};

type Props = Readonly<{
	nodeDatum: NodeDatum;
	onFlip: (hashDigest: CodemodNodeHashDigest) => void;
	onFocus: (hashDigest: CodemodNodeHashDigest) => void;
}>;

const renderProgressBar = (progress: Progress | null) => {
	if (progress === null) {
		return null;
	}

	if (progress.progressKind === 'infinite') {
		return <InfiniteProgress />;
	}

	const value =
		progress.totalFileNumber > 0
			? (progress.processedFileNumber / progress.totalFileNumber) * 100
			: 0;

	return <ProgressBar percent={value} />;
};

const getCodemodNodeRenderer =
	({ rootPath, autocompleteItems, progress, screenWidth }: Deps) =>
	({ nodeDatum, onFlip }: Props) => {
		const { node, focused, expanded, argumentsExpanded } = nodeDatum;
		const { hashDigest, label } = node;

		const ref = useRef<HTMLDivElement>(null);

		useEffect(() => {
			if (!focused) {
				return;
			}

			ref.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center',
			});
			ref.current?.focus();
		}, [focused]);

		return (
			<div
				key={hashDigest}
				id={hashDigest}
				tabIndex={0}
				ref={ref}
				className={cn(styles.root, focused && styles.focused)}
				onClick={() => onFlip(hashDigest)}
			>
				<div
					style={{
						minWidth: `${getIndent(nodeDatum.depth)}px`,
					}}
				/>
				{node.kind === 'CODEMOD' && (
					<div className="w-full">
						<Codemod
							hashDigest={hashDigest}
							label={label}
							progress={
								progress?.codemodHash ===
								(node.hashDigest as unknown as CodemodHash)
									? progress
									: null
							}
							isPrivate={node.isPrivate}
							focused={focused}
							queued={node.queued}
							icon={node.icon}
							screenWidth={screenWidth}
							permalink={node.permalink}
							executionPath={node.executionPath}
							autocompleteItems={autocompleteItems}
							rootPath={rootPath}
							argumentsExpanded={argumentsExpanded}
							args={node.args}
						/>
						{argumentsExpanded && (
							<div
								className={styles.expandableContent}
								style={{
									marginLeft: `-${getIndent(
										nodeDatum.depth,
									)}px`,
									maxHeight: `${EXPANDABLE_CONTENT_MAX_HEIGHT}px`,
								}}
							>
								<CodemodArguments
									autocompleteItems={autocompleteItems}
									rootPath={rootPath}
									executionPath={node.executionPath}
									hashDigest={hashDigest}
									arguments={node.args}
								/>
							</div>
						)}
						{progress !== null &&
							(hashDigest as unknown as CodemodHash) ===
								progress.codemodHash && (
								<div
									className={styles.expandableContent}
									style={{
										marginLeft: `-${getIndent(
											nodeDatum.depth,
										)}px`,
									}}
								>
									<div className={styles.progressContainer}>
										<p
											className={
												styles.progressStatusLabel
											}
										>
											{progress.progressKind === 'finite'
												? `Processed ${progress.processedFileNumber} / ${progress.totalFileNumber} files`
												: 'Processing all files...'}
										</p>

										{renderProgressBar(progress)}
									</div>
								</div>
							)}
					</div>
				)}

				{['DIRECTORY', 'ROOT'].includes(node.kind) && (
					<Directory expanded={expanded} label={label} />
				)}
			</div>
		);
	};

export { getCodemodNodeRenderer };
