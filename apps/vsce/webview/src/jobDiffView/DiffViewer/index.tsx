import { useRef, useState } from 'react';
import { CaseHash } from '../../../../src/cases/types';
import type { PanelViewProps } from '../../../../src/components/webview/panelViewProps';
import { useTheme } from '../../shared/Snippet/useTheme';
import { DiffViewType } from '../../shared/types';
import { vscode } from '../../shared/utilities/vscode';
import { useCTLKey } from '../hooks/useKey';
import { JobDiffView } from './DiffItem';
import { Header } from './Header';

const focusExplorerNodeSibling = (
	caseHashDigest: CaseHash,
	direction: 'prev' | 'next',
) => {
	vscode.postMessage({
		kind: 'webview.global.focusExplorerNodeSibling',
		caseHashDigest,
		direction,
	});
};

export const JobDiffViewContainer = (
	props: PanelViewProps & { kind: 'JOB' },
) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [viewType, setViewType] = useState<DiffViewType>('side-by-side');

	useCTLKey('d', () => {
		setViewType((v) => (v === 'side-by-side' ? 'inline' : 'side-by-side'));
	});

	const theme = useTheme();

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
