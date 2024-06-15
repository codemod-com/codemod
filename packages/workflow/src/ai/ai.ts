import * as fs from 'node:fs/promises';
import { formatText } from '@codemod-com/utilities';
import MagicString from 'magic-string';
import OpenAI from 'openai';
import type { PLazy } from '../PLazy';
import { getAstGrepNodeContext, getFileContext } from '../contexts';
import { FunctionExecutor, fnWrapper } from '../engineHelpers';
import { clc } from '../helpers';

let SYSTEM_PROMPT = `
You are a meticulous engineer assigned to migrate a codebase by updating its code when necessary.

When you write code, the code works on the first try, and is complete. Take into account the current repository's language, code style, and dependencies.

You will be given a Migration Description and a Source File. You will rewrite the Source File in order to apply the changes described in the Migration Description.

If a line of code is not affected by the migration, you should keep it as it is.

Source file will be split into multiple parts, each part starts with a comment like this:
// codemod#ai#0
part code here
// codemod#ai#0
where 0 is a number that represents the part number.

You must print the modified Source File in the following format:

\`\`\`
modified Source File
\`\`\`

You must preserve parts naming and order.
`;

type CodeSample = {
	filename: string;
	startPosition: number;
	endPosition: number;
	text: string;
};

class AiHandler {
	private beforesSamples: CodeSample[] = [];
	private completion: OpenAI.Chat.Completions.ChatCompletion | undefined;
	public query: string | undefined;

	constructor(private userPrompt: string) {}

	addBefore(before: CodeSample) {
		this.beforesSamples.push(before);
	}

	private get prompt() {
		return `
You are migrating a code, which matches ast-grep pattern:
${this.query ?? ''}

${this.userPrompt}

${this.beforesSamples
	.map(
		(before, index) => `
// codemod#ai#${index}
${before.text}
// codemod#ai#${index}

`,
	)
	.join('')}`;
	}

	private get completionText() {
		return this.completion?.choices[0]?.message.content;
	}

	public get usage() {
		return this.completion?.usage;
	}

	public get replacements() {
		// Match code block inside ``` and replace those quotes with empty string
		let code = this.completionText
			?.match(/```([\s\S]*?)```/g)?.[0]
			?.replace(/^```/g, '')
			?.replace(/```$/g, '');

		let replacements: string[] = [];
		let parts = code?.split('\n') ?? [];
		let currentIndex = -1;
		let currentCode = '';
		for (let part of parts) {
			let index = Number.parseInt(
				part.match(/\/\/ codemod#ai#(\d+)/)?.[1] ?? '',
				10,
			);
			if (!Number.isNaN(index)) {
				if (currentIndex === index) {
					replacements.push(currentCode);
					currentCode = '';
				} else {
					currentIndex = index;
				}
				continue;
			}

			currentCode += part;
		}

		return replacements;
	}

	async execute() {
		let apiKey = process.argv
			.find((arg) => arg.startsWith('--OPENAI_API_KEY='))
			?.replace('--OPENAI_API_KEY=', '');
		if (!apiKey) {
			console.log(
				`Please set OPENAI_API_KEY environment variable like "codemod ... --OPENAI_API_KEY=YOUR_API_KEY"`,
			);
			return;
		}
		let openai = new OpenAI({ apiKey });
		this.completion = await openai.chat.completions.create({
			model: 'gpt-4-turbo',
			seed: 7,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: this.prompt },
			],
			temperature: 0.001,
			n: 1,
		});
		let replacements = this.replacements;
		let files: Record<
			string,
			{
				startPosition: number;
				endPosition: number;
				text: string;
			}[]
		> = {};
		for (let i = 0; i < this.beforesSamples.length; i++) {
			let before = this.beforesSamples[i] as CodeSample;
			let after = replacements[i] as string;
			if (!files[before.filename]) {
				files[before.filename] = [];
			}
			files[before.filename]?.push({
				startPosition: before.startPosition,
				endPosition: before.endPosition,
				text: after,
			});
		}
		for (let [filename, replacements] of Object.entries(files)) {
			try {
				let contents = new MagicString(
					await fs.readFile(filename, 'utf-8'),
				);
				for (let replacement of replacements) {
					contents.update(
						replacement.startPosition,
						replacement.endPosition,
						replacement.text,
					);
				}
				if (contents.hasChanged()) {
					await fs.writeFile(
						filename,
						await formatText(filename, contents.toString(), true),
					);
					console.log(`${clc.blueBright('FILE')} ${filename}`);
				}
			} catch (e) {
				//
			}
		}
	}
}

export function aiLogic(
	rawPrompt: string | readonly string[],
): PLazy<AiHelpers> & AiHelpers {
	let prompt = typeof rawPrompt === 'string' ? rawPrompt : rawPrompt.join('');
	let aiHandler = new AiHandler(prompt);

	return new FunctionExecutor('ai')
		.arguments(() => ({ prompt }))
		.helpers(aiHelpers)
		.executor(async () => {
			let { node } = getAstGrepNodeContext();
			let { file } = getFileContext();
			let range = node.range();
			let { query } = getAstGrepNodeContext();
			aiHandler.query =
				typeof query === 'string' ? query : JSON.stringify(query);
			aiHandler.addBefore({
				filename: file,
				startPosition: range.start.index,
				endPosition: range.end.index,
				text: node.text(),
			});
		})
		.return(async (self) => {
			await aiHandler.execute();
			return self.wrappedHelpers();
		})
		.run();
}

export let ai = fnWrapper('ai', aiLogic);

let aiHelpers = {};
type AiHelpers = typeof aiHelpers;
