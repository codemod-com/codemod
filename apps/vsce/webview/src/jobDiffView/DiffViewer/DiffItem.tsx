import {
	type KeyboardEvent,
	forwardRef,
	memo,
	useCallback,
	useState,
} from 'react';
import type { PanelViewProps } from '../../../../src/components/webview/panelViewProps';
import debounce from '../../shared/utilities/debounce';
import { vscode } from '../../shared/utilities/vscode';
import { Collapsable } from '../Components/Collapsable';
import { exportToCodemodStudio, reportIssue } from '../util';
import { Header } from './Container';
import { type Diff, DiffComponent } from './Diff';
import './DiffItem.css';

type Props = PanelViewProps & { kind: 'JOB' } & {
	viewType: 'inline' | 'side-by-side';
	theme: string;
};

export let JobDiffView = memo(
	forwardRef<HTMLDivElement, Props>(
		(
			{
				viewType,
				jobHash,
				jobKind,
				oldFileContent,
				newFileContent,
				originalNewFileContent,
				oldFileTitle,
				reviewed,
				title,
				theme,
				caseHash,
			}: Props,
			ref,
		) => {
			let [diff, setDiff] = useState<Diff | null>(null);

			let report = useCallback(() => {
				reportIssue(
					jobHash,
					oldFileContent ?? '',
					originalNewFileContent ?? '',
					originalNewFileContent !== newFileContent
						? newFileContent
						: null,
				);
			}, [
				jobHash,
				oldFileContent,
				newFileContent,
				originalNewFileContent,
			]);

			let exportToCS = useCallback(() => {
				exportToCodemodStudio(
					jobHash,
					oldFileContent ?? '',
					newFileContent ?? '',
				);
			}, [jobHash, oldFileContent, newFileContent]);

			let handleDiffCalculated = (diff: Diff) => {
				setDiff(diff);
			};

			let handleContentChange = debounce((newContent: string) => {
				let changed = newContent !== newFileContent;
				if (changed) {
					vscode.postMessage({
						kind: 'webview.panel.contentModified',
						newContent,
						jobHash,
					});
				}
			}, 1000);

			return (
				<div
					ref={ref}
					className="px-5 pb-2-5 diff-view-container h-full"
					onKeyDown={(event: KeyboardEvent) => {
						if (event.key === 'ArrowLeft') {
							event.preventDefault();

							vscode.postMessage({
								kind: 'webview.panel.focusOnChangeExplorer',
							});
						}
					}}
				>
					<Collapsable
						defaultExpanded={true}
						className="overflow-hidden rounded h-full"
						headerClassName="p-10"
						contentClassName="p-10 h-full"
						headerSticky
						headerComponent={
							<Header
								diff={diff}
								modifiedByUser={
									originalNewFileContent !== newFileContent
								}
								oldFileTitle={oldFileTitle ?? ''}
								jobKind={jobKind}
								caseHash={caseHash}
								jobHash={jobHash}
								title={title ?? ''}
								reviewed={reviewed}
								onReportIssue={report}
								onFixInStudio={exportToCS}
							/>
						}
					>
						<DiffComponent
							theme={theme}
							viewType={viewType}
							oldFileContent={oldFileContent}
							newFileContent={newFileContent}
							onDiffCalculated={handleDiffCalculated}
							onChange={handleContentChange}
							jobHash={jobHash}
						/>
					</Collapsable>
				</div>
			);
		},
	),
);
