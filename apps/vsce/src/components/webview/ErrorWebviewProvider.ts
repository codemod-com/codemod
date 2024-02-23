import areEqual from "fast-deep-equal";
import { ExtensionContext, WebviewView, WebviewViewProvider } from "vscode";
import { Store } from "../../data";
import { actions } from "../../data/slice";
import { selectErrorWebviewViewProps } from "../../selectors/selectErrorWebviewViewProps";
import { MessageBus, MessageKind } from "../messageBus";
import { MainViewProvider } from "./MainProvider";
import { WebviewResolver } from "./WebviewResolver";
import { WebviewMessage } from "./webviewEvents";

export class ErrorWebviewProvider implements WebviewViewProvider {
	private readonly __webviewResolver: WebviewResolver;
	private __webviewView: WebviewView | null = null;

	public constructor(
		context: ExtensionContext,
		messageBus: MessageBus,
		private readonly __store: Store,
		private readonly __mainWebviewViewProvider: MainViewProvider,
	) {
		this.__webviewResolver = new WebviewResolver(context.extensionUri);

		let prevProps = this.__buildViewProps();

		const handler = async () => {
			const nextProps = this.__buildViewProps();

			if (areEqual(prevProps, nextProps)) {
				return;
			}

			prevProps = nextProps;

			this.__postMessage({
				kind: "webview.error.setProps",
				errorWebviewViewProps: nextProps,
			});

			if (
				nextProps.kind === "CASE_SELECTED" &&
				nextProps.executionErrors.length !== 0
			) {
				this.showView();
			}
		};

		messageBus.subscribe(MessageKind.mainWebviewViewVisibilityChange, handler);

		messageBus.subscribe(
			MessageKind.codemodSetExecuted,
			async ({ case: kase, executionErrors }) => {
				this.__store.dispatch(
					actions.setExecutionErrors({
						caseHash: kase.hash,
						errors: executionErrors,
					}),
				);
			},
		);

		this.__store.subscribe(handler);
	}

	public resolveWebviewView(webviewView: WebviewView): void | Thenable<void> {
		this.__webviewView = webviewView;

		const resolve = () => {
			this.__webviewResolver.resolveWebview(
				webviewView.webview,
				"errors",
				JSON.stringify(this.__buildViewProps()),
				"errorWebviewViewProps",
			);
		};

		resolve();

		this.__webviewView.onDidChangeVisibility(() => {
			if (this.__webviewView?.visible) {
				resolve();
			}
		});
	}

	public showView() {
		this.__webviewView?.show(true);
	}

	private __buildViewProps() {
		return selectErrorWebviewViewProps(
			this.__store.getState(),
			this.__mainWebviewViewProvider.isVisible(),
		);
	}

	private __postMessage(message: WebviewMessage) {
		this.__webviewView?.webview.postMessage(message);
	}
}
