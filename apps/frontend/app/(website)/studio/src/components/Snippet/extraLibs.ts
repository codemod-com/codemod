import type { Monaco } from "@monaco-editor/react";
import ASTTypes from "./dts/ast-types.txt?raw";
import jsCodeShiftIndex from "./dts/jscodeshift.txt?raw";
import recast from "./dts/recast.txt?raw";
import tsmorph from "./dts/ts-morph.txt?raw";

export const applyExtraLibs = (m: Monaco) => {
	// generate bundled d.ts content with:
	// dts-bundle --name ast-types --main node_modules/ast-types/main.d.ts --out /intuita/@studio/src/components/Snippet/dts/ast-types.txt

	m.languages.typescript.typescriptDefaults.addExtraLib(
		ASTTypes,
		"ast-types/main.d.ts",
	);

	m.languages.typescript.typescriptDefaults.addExtraLib(
		recast,
		"recast/main.d.ts",
	);

	m.languages.typescript.typescriptDefaults.addExtraLib(
		jsCodeShiftIndex,
		"@types/jscodeshift/index.d.ts",
	);

	m.languages.typescript.typescriptDefaults.addExtraLib(
		tsmorph,
		"ts-morph/lib/ts-morph.d.ts",
	);
};
