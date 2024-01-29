import { Arguments } from './schemata/argumentsSchema.js';

import * as S from '@effect/schema/Schema';

export const javaScriptCodemodEngineSchema = S.union(
	S.literal('jscodeshift'),
	S.literal('repomod-engine'),
	S.literal('filemod'),
	S.literal('ts-morph'),
);

export type JavaScriptCodemodEngine = S.To<
	typeof javaScriptCodemodEngineSchema
>;

export type Codemod =
	| Readonly<{
			source: 'registry';
			name: string;
			engine: 'recipe';
			directoryPath: string;
			codemods: ReadonlyArray<Codemod>;
			arguments: Arguments;
	  }>
	| Readonly<{
			source: 'registry';
			name: string;
			engine: JavaScriptCodemodEngine;
			directoryPath: string;
			indexPath: string;
			arguments: Arguments;
	  }>
	| Readonly<{
			source: 'registry';
			name: string;
			engine: 'piranha';
			directoryPath: string;
			arguments: Arguments;
	  }>
	| Readonly<{
			source: 'fileSystem';
			engine: JavaScriptCodemodEngine;
			indexPath: string;
	  }>;
