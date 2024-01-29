/** @type {import('prettier').Config} */
module.exports = {
	tabWidth: 4,
	useTabs: true,
	semi: true,
	singleQuote: true,
	quoteProps: 'as-needed',
	trailingComma: 'all',
	bracketSpacing: true,
	arrowParens: 'always',
	endOfLine: 'lf',
	importOrder: ['^dotenv', '<THIRD_PARTY_MODULES>', '^~/(.*)$', '^[./]'],
	importOrderParserPlugins: [
		'typescript',
		'jsx',
		'classProperties',
		'decorators-legacy',
	],
	plugins: ['@ianvs/prettier-plugin-sort-imports'],
};
