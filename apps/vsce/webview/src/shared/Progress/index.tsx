import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import s from './style.module.css';

let Progress = () => {
	return (
		<div className={s.loadingContainer}>
			<VSCodeProgressRing className={s.progressBar} />
			<span aria-label="loading">Loading...</span>
		</div>
	);
};

export default Progress;
