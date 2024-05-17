import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';
import styles from './style.module.css';

type Props = {
	description: string;
};

let LoadingProgress = ({ description }: Props) => {
	return (
		<div className={styles.root}>
			<VSCodeProgressRing className={styles.progressRing} />
			<span>{description}</span>
		</div>
	);
};

export default LoadingProgress;
