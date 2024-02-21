import {
	Event,
	EventEmitter,
	ProviderResult,
	TextDocumentContentProvider,
	Uri,
} from "vscode";

export class CustomTextDocumentContentProvider
	implements TextDocumentContentProvider
{
	readonly URI = Uri.parse("codemod:jscodeshiftCodemod.ts");
	readonly #onDidChangeEmitter = new EventEmitter<Uri>();
	readonly onDidChange: Event<Uri> | undefined = undefined;

	#content = "";

	constructor() {
		this.onDidChange = this.#onDidChangeEmitter.event;
	}

	setContent(content: string) {
		this.#content = content;

		this.#onDidChangeEmitter.fire(this.URI);
	}

	provideTextDocumentContent(uri: Uri): ProviderResult<string> {
		if (uri.toString() !== this.URI.toString()) {
			throw new Error(
				`You can only read the content of ${this.URI.toString()}`,
			);
		}

		return this.#content;
	}
}
