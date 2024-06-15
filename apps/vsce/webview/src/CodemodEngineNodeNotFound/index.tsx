import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import cn from 'classnames';
import styles from './style.module.css';

let INSTALL_CODEMOD_ENGINE_NODE_COMMAND_NPM = 'npm i -g codemod';
let INSTALL_CODEMOD_ENGINE_NODE_COMMAND_PNPM = 'pnpm i -g codemod';

let handleCopyCommand = (command: string) => {
	navigator.clipboard.writeText(command);
};

let CodemodEngineNodeNotFound = () => {
	return (
		<div className={styles.root}>
			<h1>Halfway there!</h1>
			<p>
				Use one of the two commands below to install the latest Codemod
				CLI and complete the installation:
			</p>
			{[
				INSTALL_CODEMOD_ENGINE_NODE_COMMAND_NPM,
				INSTALL_CODEMOD_ENGINE_NODE_COMMAND_PNPM,
			].map((command) => (
				<VSCodeTextField
					key={command}
					className={styles.command}
					readOnly
					value={command}
				>
					<span
						slot="start"
						className={cn(
							styles.icon,
							'codicon',
							'codicon-chevron-right',
						)}
					/>
					<span
						slot="end"
						className={cn(styles.icon, 'codicon', 'codicon-copy')}
						onClick={() => handleCopyCommand(command)}
					/>
				</VSCodeTextField>
			))}

			<small className={styles.reminder}>
				Reminder, Codemod is CLI-centric so you can use its core
				features without an IDE and easily integrate it with the
				existing tools in your workflow.
			</small>
		</div>
	);
};

export default CodemodEngineNodeNotFound;
