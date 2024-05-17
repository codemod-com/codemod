import * as vscode from 'vscode';

export let getConfiguration = () => {
	let configuration = vscode.workspace.getConfiguration('codemod');

	let workerThreadCount = configuration.get<number>('workerThreadCount') ?? 4;

	let includePatterns = configuration.get<string[]>('include') ?? [
		'**/*.*{ts,tsx,js,jsx,mjs,cjs,mdx,json}',
	];
	let excludePatterns = configuration.get<string[]>('exclude') ?? [
		'**/node_modules/**/*.*',
	];

	let formatWithPrettier =
		configuration.get<boolean>('formatWithPrettier') ?? false;

	return {
		workerThreadCount,
		includePatterns,
		excludePatterns,
		formatWithPrettier,
	};
};

export let setConfigurationProperty = async (
	propertyName: string,
	value: unknown,
	configurationTarget: vscode.ConfigurationTarget,
) => {
	let configuration = vscode.workspace.getConfiguration('codemod');

	return configuration.update(propertyName, value, configurationTarget);
};
export type Configuration = ReturnType<typeof getConfiguration>;
