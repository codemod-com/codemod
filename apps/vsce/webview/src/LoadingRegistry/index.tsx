import styles from './style.module.css';

let LoadingRegistry = () => {
	return (
		<div className={styles.root}>
			<p className={styles.text}>
				Loading the latest codemod registry...
			</p>
		</div>
	);
};

export default LoadingRegistry;
