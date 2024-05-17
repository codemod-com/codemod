import { execPromise } from '@codemod-com/utilities';
import type { FileCommand } from './fileCommands.js';

let javaScriptPatterns = ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'];
let typeScriptPatterns = ['**/*.ts', '**/*.cts', '**/*.mts'];
let tsxPatterns = ['**/*.tsx'];
let pythonPatterns = ['**/*.py', '**/*.py3', '**/*.pyi', '**/*.bzl'];
let javaPatterns = ['**/*.java'];
let bashPatterns = [
	'**/*.bash',
	'**/*.bats',
	'**/*.cgi',
	'**/*.command',
	'**/*.env',
	'**/*.fcgi',
	'**/*.ksh',
	'**/*.sh',
	'**/*.sh.in',
	'**/*.tmux',
	'**/*.tool',
	'**/*.zsh',
];
let cPatterns = ['**/*.c', '**/*.h'];
let cppPatterns = [
	'**/*.cc',
	'**/*.hpp',
	'**/*.cpp',
	'**/*.c++',
	'**/*.hh',
	'**/*.cxx',
	'**/*.cu',
	'**/*.ino',
];
let jsonPatterns = ['**/*.json'];
let htmlPatterns = ['**/*.html', '**/*.htm', '**/*.xhtml'];
export let astGrepLanguageToPatterns: Record<string, string[]> = {
	js: javaScriptPatterns,
	jsx: javaScriptPatterns,
	javascript: javaScriptPatterns,

	ts: typeScriptPatterns,
	typescript: typeScriptPatterns,

	tsx: tsxPatterns,

	py: pythonPatterns,
	python: pythonPatterns,

	java: javaPatterns,

	'bash-exp': bashPatterns,

	c: cPatterns,

	cc: cppPatterns,
	'c++': cppPatterns,
	cpp: cppPatterns,
	cxx: cppPatterns,

	json: jsonPatterns,

	html: htmlPatterns,
};

type AstGrepCompactOutput = {
	text: string;
	range: {
		byteOffset: { start: number; end: number };
		start: { line: number; column: number };
		end: { line: number; column: number };
	};
	file: string;
	lines: string;
	replacement?: string;
	replacementOffsets?: { start: number; end: number };
	language: string;
	ruleId: string;
	severity: string;
	note: string | null;
	message: string;
};

export let runAstGrepCodemod = async (
	rulesPath: string,
	oldPath: string,
	oldData: string,
	disablePrettier: boolean,
): Promise<readonly FileCommand[]> => {
	try {
		// Use `which` command to check if the command is available
		await execPromise('which sg');
	} catch (error) {
		let astInstallCommand = 'npm install -g @ast-grep/cli';
		if (process.platform === 'win32') {
			await execPromise(`powershell -Command ${astInstallCommand}`);
		} else {
			await execPromise(astInstallCommand);
		}
	}

	let commands: FileCommand[] = [];

	let rulesPathEscaped = rulesPath.replace(/(\s+)/g, '\\$1');
	let oldPathEscaped = oldPath.replace(/(\s+)/g, '\\$1');

	let astCommandBase = `sg scan --rule ${rulesPathEscaped} ${oldPathEscaped} --json=compact`;

	let astCommand =
		process.platform === 'win32'
			? `powershell -Command "${astCommandBase}"`
			: astCommandBase;

	let { stdout } = await execPromise(astCommand);
	let matches = JSON.parse(stdout.trim()) as AstGrepCompactOutput[];
	// Sort in reverse order to not mess up replacement offsets
	matches.sort((a, b) => b.range.byteOffset.start - a.range.byteOffset.start);

	let newData = oldData;
	for (let result of matches) {
		let { replacementOffsets, replacement } = result;
		if (!replacementOffsets) {
			continue;
		}

		newData =
			newData.slice(0, replacementOffsets.start) +
			replacement +
			newData.slice(replacementOffsets.end);
	}

	if (typeof newData !== 'string' || oldData === newData) {
		return commands;
	}

	commands.push({
		kind: 'updateFile',
		oldPath,
		oldData,
		newData,
		formatWithPrettier: !disablePrettier,
	});

	return commands;
};
