import { writeFileSync } from "node:fs";
import { compile, compileFromFile } from "json-schema-to-typescript";

const biomeLicense = await fetch(
	"https://raw.githubusercontent.com/biomejs/biome/main/LICENSE-MIT",
)
	.then((res) => res.text())
	.then((text) => text.replace(/\n/g, "\n * "));
compileFromFile("./node_modules/@biomejs/biome/configuration_schema.json").then(
	(ts) => writeFileSync("types/biome.d.ts", `/**${biomeLicense}\n*/\n${ts}`),
);

const schemastoreLicense = await fetch(
	"https://raw.githubusercontent.com/SchemaStore/schemastore/master/LICENSE",
)
	.then((res) => res.text())
	.then((text) => text.replace(/\n/g, "\n * "));
const schemastoreNotice = await fetch(
	"https://raw.githubusercontent.com/SchemaStore/schemastore/master/NOTICE",
)
	.then((res) => res.text())
	.then((text) => text.replace(/\n/g, "\n * "));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eslintSchema: any = await fetch(
	"https://github.com/SchemaStore/schemastore/raw/master/src/schemas/json/eslintrc.json",
).then((res) => res.json());
compile(eslintSchema, "ESLint").then((ts) =>
	writeFileSync(
		"types/eslint.d.ts",
		`/**${schemastoreLicense}${schemastoreNotice}\n*/\n${ts}`,
	),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prettierSchema: any = await fetch(
	"https://github.com/SchemaStore/schemastore/raw/master/src/schemas/json/prettierrc.json",
).then((res) => res.json());
compile(prettierSchema, "Prettier").then((ts) =>
	writeFileSync(
		"types/prettier.d.ts",
		`/**${schemastoreLicense}${schemastoreNotice}\n*/\n${ts}`,
	),
);
