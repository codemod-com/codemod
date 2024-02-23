import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import cn from "classnames";
import styles from "./style.module.css";

const INSTALL_CODEMOD_ENGINE_NODE_COMMAND = "npm i -g codemod";

const handleCopyCommand = () => {
	navigator.clipboard.writeText(INSTALL_CODEMOD_ENGINE_NODE_COMMAND);
};

const CodemodEngineNodeNotFound = () => {
	return (
		<div className={styles.root}>
			<h1>Halfway there!</h1>
			<p>
				Use this command to install the CLI (or make it global, if its already
				installed) and complete the installation:
			</p>
			<VSCodeTextField
				className={styles.command}
				readOnly
				value={INSTALL_CODEMOD_ENGINE_NODE_COMMAND}
			>
				<span
					slot="start"
					className={cn(styles.icon, "codicon", "codicon-chevron-right")}
				/>
				<span
					slot="end"
					className={cn(styles.icon, "codicon", "codicon-copy")}
					onClick={handleCopyCommand}
				/>
			</VSCodeTextField>
			<small className={styles.reminder}>
				Reminder, Codemod is CLI-centric so you can use its core features
				without an IDE and easily integrate it with the existing tools in your
				workflow.
			</small>
		</div>
	);
};

export default CodemodEngineNodeNotFound;
