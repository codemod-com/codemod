import { type ParserOptions } from '@babel/parser';

const parserOptions = {
	sourceType: 'module',
	allowImportExportEverywhere: true,
	allowReturnOutsideFunction: true,
	startLine: 1,
	tokens: true,
	plugins: [
		'jsx',
		'asyncGenerators',
		'bigInt',
		'classPrivateMethods',
		'classPrivateProperties',
		'classProperties',
		'decorators-legacy',
		'doExpressions',
		'dynamicImport',
		'exportDefaultFrom',
		'exportExtensions',
		'exportNamespaceFrom',
		'functionBind',
		'functionSent',
		'importMeta',
		'nullishCoalescingOperator',
		'numericSeparator',
		'objectRestSpread',
		'optionalCatchBinding',
		'optionalChaining',
		['pipelineOperator', { proposal: 'minimal' }],
		'throwExpressions',
		'typescript',
		'tsx',
	],
} as ParserOptions;

export default parserOptions;
