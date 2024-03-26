import { AllEngines, Arguments } from "./codemodConfigSchema.js";

export type CodemodListReturn = {
	name: string;
	author: string;
	engine: AllEngines;
	tags: string[];
	verified: boolean;
	arguments: Arguments;
}[];
