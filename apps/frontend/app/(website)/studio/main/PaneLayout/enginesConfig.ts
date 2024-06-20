import type { KnownEngines } from "@codemod-com/utilities";

export const enginesConfig: Array<{
	label: string;
	disabled: boolean;
	value: KnownEngines | "piranha";
}> = [
	{
		label: "jscodeshift",
		value: "jscodeshift",
		disabled: false,
	},
	{
		label: "ts-morph [beta]",
		value: "ts-morph",
		disabled: false,
	},
	{
		label: "piranha (alpha)",
		value: "piranha",
		disabled: true,
	},
];
