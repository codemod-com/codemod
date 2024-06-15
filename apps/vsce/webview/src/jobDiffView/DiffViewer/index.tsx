import { useRef, useState } from 'react';
import type { CaseHash } from '../../../../src/cases/types';
import type { PanelViewProps } from '../../../../src/components/webview/panelViewProps';
import { useTheme } from '../../shared/Snippet/useTheme';
import type { DiffViewType } from '../../shared/types';
import { vscode } from '../../shared/utilities/vscode';
import { useCTLKey } from '../hooks/useKey';
import { JobDiffView } from './DiffItem';
import { Header } from './Header';

let focusExplorerNodeSibling = (
	caseHashDigest: CaseHash,
	direction: 'prev' | 'next',
) => {
	vscode.postMessage({
		kind: 'webview.global.focusExplorerNodeSibling',
		caseHashDigest,
		direction,
	});
};

export let JobDiffViewContainer = (props: PanelViewProps & { kind: 'JOB' }) => {
	let containerRef = useRef<HTMLDivElement>(null);
	let [viewType, setViewType] = useState<DiffViewType>('side-by-side');

	useCTLKey('d', () => {
		setViewType((v) => (v === 'side-by-side' ? 'inline' : 'side-by-side'));
	});

	let theme = useTheme();

	return (
		<div className="w-full h-full flex flex-col">
			<Header
				onViewChange={setViewType}
				viewType={viewType}
				changeJob={(direction) =>
					focusExplorerNodeSibling(props.caseHash, direction)
				}
			/>
			<div className="w-full pb-2-5 h-full" ref={containerRef}>
				<JobDiffView theme={theme} viewType={viewType} {...props} />
			</div>
		</div>
	);
};
