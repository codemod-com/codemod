import { type Arguments, type KnownEngines } from "@codemod-com/utilities";

export type Codemod =
	| Readonly<{
			source: "registry";
			name: string;
			include?: string[];
			engine: "recipe";
			directoryPath: string;
			codemods: ReadonlyArray<Codemod>;
			arguments: Arguments;
	  }>
	| Readonly<{
			source: "registry";
			name: string;
			include?: string[];
			engine: KnownEngines;
			directoryPath: string;
			indexPath: string;
			arguments: Arguments;
	  }>
	| Readonly<{
			source: "registry";
			name: string;
			include?: string[];
			engine: "piranha";
			directoryPath: string;
			arguments: Arguments;
	  }>
	| Readonly<{
			source: "fileSystem";
			include?: string[];
			engine: KnownEngines;
			indexPath: string;
	  }>;
