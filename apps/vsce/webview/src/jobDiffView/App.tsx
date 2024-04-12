import { useEffect, useState } from "react";
import type { PanelViewProps } from "../../../src/components/webview/panelViewProps";
import type { WebviewMessage } from "../shared/types";
import { vscode } from "../shared/utilities/vscode";
import { JobDiffViewContainer } from "./DiffViewer/index";
import "./index.css";
import styles from "./style.module.css";

declare global {
	interface Window {
		panelViewProps: PanelViewProps;
	}
}

export const App = () => {
	const [viewProps, setViewProps] = useState(window.panelViewProps);

	useEffect(() => {
		vscode.postMessage({
			kind: "webview.jobDiffView.webviewMounted",
		});
	}, []);

	useEffect(() => {
		const eventHandler = (event: MessageEvent<WebviewMessage>) => {
			if (event.data.kind === "webview.setPanelViewProps") {
				setViewProps(event.data.panelViewProps);
			}
		};

		window.addEventListener("message", eventHandler);

		return () => {
			window.removeEventListener("message", eventHandler);
		};
	}, []);

	return (
		<main className={styles.app}>
			<JobDiffViewContainer {...viewProps} />
		</main>
	);
};
