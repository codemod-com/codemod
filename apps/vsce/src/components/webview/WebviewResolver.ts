import { randomBytes } from 'node:crypto';
import { Uri, type Webview } from 'vscode';
import { getUri } from '../../utilities';

let monacoWorkers: Record<string, string> = {
	editorWorkerService: 'editor.worker.bundle.js',
	css: 'css.worker.bundle.js',
	html: 'html.worker.bundle.js',
	json: 'json.worker.bundle.js',
	typescript: 'ts.worker.bundle.js',
	javascript: 'ts.worker.bundle.js',
	less: 'css.worker.bundle.js',
	scss: 'css.worker.bundle.js',
	handlebars: 'html.worker.bundle.js',
	razor: 'html.worker.bundle.js',
};
export class WebviewResolver {
	constructor(private readonly __extensionPath: Uri) {}

	public getWebviewOptions() {
		return {
			enableScripts: true,
			localResourceRoots: [
				Uri.joinPath(this.__extensionPath, 'webview/build'),
				Uri.joinPath(this.__extensionPath, 'resources'),
			],
			retainContextWhenHidden: true,
		};
	}

	public resolveWebview(
		webview: Webview,
		webviewName: string,
		initialData: string,
		initialStateKey: string,
	) {
		webview.options = this.getWebviewOptions();
		webview.html = this.__getHtmlForWebview(
			webview,
			webviewName,
			initialData,
			initialStateKey,
		);
	}

	private __getHtmlForWebview(
		webview: Webview,
		webviewName: string,
		initialData: string,
		initialStateKey: string,
	) {
		let stylesUri = getUri(webview, this.__extensionPath, [
			'webview',
			'build',
			webviewName,
			'assets',
			'index.css',
		]);
		let scriptUri = getUri(webview, this.__extensionPath, [
			'webview',
			'build',
			webviewName,
			'assets',
			`${webviewName}.js`,
		]);

		let nonce = randomBytes(16).toString('hex');
		let codiconsUri = getUri(webview, this.__extensionPath, [
			'resources',
			'codicon.css',
		]);

		let scriptSources = [`'nonce-${nonce}'`];

		let styleSources = [webview.cspSource, `'self'`, `'unsafe-inline'`];

		let fontSources = [webview.cspSource];

		let imageSources = [
			webview.cspSource,
			"'self'",
			'data:',
			'vscode-resource:',
			'https:',
		];

		let getWorkerUri = (name: string) =>
			getUri(webview, this.__extensionPath, [
				'webview',
				'build',
				webviewName,
				'monacoeditorwork',
				monacoWorkers[name] ?? '',
			]);

		return /*html*/ `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
					<meta name="theme-color" content="#000000">
					<meta http-equiv="Content-Security-Policy" content="
					default-src 'none';
					script-src ${scriptSources.join(' ')}; 
					font-src ${fontSources.join(' ')};
					style-src ${styleSources.join(' ')};
					worker-src 'self';
					img-src ${imageSources.join(' ')};
					">
					<link href="${codiconsUri}" type="text/css" rel="stylesheet" />
					<link rel="stylesheet" type="text/css" href="${stylesUri}">
					<title>Codemod Panel</title>
					<style>
					 .placeholder {
						text-align: center;
					 }
					</style>
				</head>
				<body>
					<div id="root">
						<h1 class="placeholder">Loading...</h1>
					</div>
					<script nonce="${nonce}">
					window.${initialStateKey}=${initialData}
					</script>
					<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
					<script nonce="${nonce}">self["MonacoEnvironment"] = (function (paths) {
						return {
							globalAPI: false,
							getWorkerUrl : function (moduleId, label) {
								return paths[label];
							}
						};
					})({
							"editorWorkerService": "${getWorkerUri('editorWorkerService')}",
							"css": "${getWorkerUri('css')}",
							"html": "${getWorkerUri('html')}",
							"json": "${getWorkerUri('json')}",
							"typescript": "${getWorkerUri('typescript')}",
							"javascript": "${getWorkerUri('javascript')}"
					});
			</script>
				</body>
			</html>
		`;
	}
}
