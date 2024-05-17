import type { ReactNode } from 'react';
import styles from './style.module.css';

type Props = {
	message: string;
	actionButtons: ReactNode;
};

let WarningMessage = ({ message, actionButtons }: Props) => {
	return (
		<div className={styles.root}>
			<p>{message}</p>
			{actionButtons}
		</div>
	);
};

export default WarningMessage;
