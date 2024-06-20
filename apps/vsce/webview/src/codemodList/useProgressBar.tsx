import { useEffect, useState } from 'react';
import type { CodemodHash, WebviewMessage } from '../shared/types';

export type Progress = Readonly<{
	codemodHash: CodemodHash;
	progressKind: 'finite' | 'infinite';
	totalFileNumber: number;
	processedFileNumber: number;
}>;

export let useProgressBar = (): Progress | null => {
	let [codemodExecutionProgress, setCodemodExecutionProgress] =
		useState<Progress | null>(null);

	useEffect(() => {
		let handler = (e: MessageEvent<WebviewMessage>) => {
			let message = e.data;

			if (message.kind === 'webview.global.setCodemodExecutionProgress') {
				setCodemodExecutionProgress({
					codemodHash: message.codemodHash,
					progressKind: message.progressKind,
					totalFileNumber: message.totalFileNumber,
					processedFileNumber: message.processedFileNumber,
				});
			}

			if (message.kind === 'webview.global.codemodExecutionHalted') {
				setCodemodExecutionProgress(null);
			}
		};

		window.addEventListener('message', handler);

		return () => {
			window.removeEventListener('message', handler);
		};
	}, [codemodExecutionProgress?.codemodHash]);

	return codemodExecutionProgress;
};
