import { writeFileSync } from 'fs';
import { compile, compileFromFile } from 'json-schema-to-typescript';

compileFromFile('./node_modules/@biomejs/biome/configuration_schema.json').then(
	(ts) => writeFileSync('types/biome.d.ts', ts),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eslintSchema: any = await fetch(
	'https://github.com/SchemaStore/schemastore/raw/master/src/schemas/json/eslintrc.json',
).then((res) => res.json());
compile(eslintSchema, 'ESLint').then((ts) =>
	writeFileSync('types/eslint.d.ts', ts),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prettierSchema: any = await fetch(
	'https://github.com/SchemaStore/schemastore/raw/master/src/schemas/json/prettierrc.json',
).then((res) => res.json());
compile(prettierSchema, 'Prettier').then((ts) =>
	writeFileSync('types/prettier.d.ts', ts),
);
