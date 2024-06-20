import type { WebviewApi } from 'vscode-webview';
import type { WebviewResponse } from '../../../../src/components/webview/webviewEvents';

class VSCodeAPIWrapper {
	private readonly vsCodeApi: WebviewApi<unknown> | undefined;

	constructor() {
		if (typeof acquireVsCodeApi === 'function') {
			this.vsCodeApi = acquireVsCodeApi();
		}
	}

	public postMessage(message: WebviewResponse) {
		if (this.vsCodeApi) {
			this.vsCodeApi.postMessage(message);
		} else {
			console.log(message);
		}
	}

	public getState(): unknown | undefined {
		if (this.vsCodeApi) {
			return this.vsCodeApi.getState();
		}

		let state = localStorage.getItem('vscodeState');
		return state ? JSON.parse(state) : undefined;
	}

	public setState<T extends unknown | undefined>(newState: T): T {
		if (this.vsCodeApi) {
			return this.vsCodeApi.setState(newState);
		}

		localStorage.setItem('vscodeState', JSON.stringify(newState));
		return newState;
	}
}

export let vscode = new VSCodeAPIWrapper();
