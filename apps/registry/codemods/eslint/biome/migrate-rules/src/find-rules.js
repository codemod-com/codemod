// Credit: https://github.com/anonrig/find-biome-alternatives/blob/main/index.js

import child_process from 'node:child_process';
import path from 'node:path';
import { parseArgs, promisify } from 'node:util';

const exec = promisify(child_process.exec);

const { values } = parseArgs({
	options: {
		cmd: {
			type: 'string',
			default: 'eslint .',
		},
		limit: {
			type: 'string',
			default: '100',
		},
		cwd: {
			type: 'string',
			default: process.cwd(),
		},
	},
});

const eslint_command = `TIMING=${values.limit} ${values.cmd}`;

const output = await exec(eslint_command, {
	encoding: 'utf8',
	cwd: path.resolve(values.cwd),
});
const raw_data = output.stdout;

const most_time_consuming_rules = raw_data
	.split('\n')
	.map((row) => row.split(' ')[0]);
const start = rows.findIndex((row) => row.startsWith('$ '));
rows = rows.slice(start + 3, rows.length - 2);

// Fetch biome rules
const markdown_url =
	'https://raw.githubusercontent.com/biomejs/biome/main/website/src/content/docs/linter/rules-sources.mdx';
const out = await fetch(markdown_url, {
	method: 'GET',
});
const raw_text = await out.text();
const biome_rules_raw = raw_text.slice(4).split('\n');

const regexp = /\[(.*?)\]/g;
const matched_rules = most_time_consuming_rules.flatMap((rule) => {
	const matched = biome_rules_raw.find((line) => line.includes(`[${rule}]`));
	if (!matched) {
		return [];
	}

	return {
		eslint: rule,
		biome: matched.match(regexp).at(-1).slice(1, -1),
		matched_line: matched,
	};
});

prompts.outro(
	`Here are the rules matching your slowest ${values.limit} Eslint rules`,
);
console.table(matched_rules, ['eslint', 'biome']);
