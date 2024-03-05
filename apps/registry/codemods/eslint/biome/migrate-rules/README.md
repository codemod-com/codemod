# Migrate eslintrc to biome.json

## Description

This codemod replaces configuration files for ESLint with corresponding biome.json for all the found rules. It also replaces Prettier configuration.

### NOTE:

This codemod accepts manual user input, which is required to migrate away from eslint. In order to run it properly, run the following command:

```bash
npx eslint --print-config <path-to-a-file-that-eslint-checks> | codemod eslint/biome/migrate-rules
```

It's important that you pass these rules to the codemod, because our codemods are limited in access for security purposes and have no access to most node features that could maliciously affect your system.

This codemod requires internet connection.

## Example

### `package.json`

### Before

```json
{
	"name": "package-name",
	"dependencies": {
		"prettier": "^3.1.0",
		"prettier-plugin-tailwindcss": "^0.5.4",
		"@tanstack/eslint-plugin-query": "^4.29.25",
		"@someorg/prettier-config": "^1.1.1"
	},
	"devDependencies": {
		"eslint-plugin-airbnb": "^10.2.0",
		"eslint": "^10.2.0",
		"eslint-plugin-prettier": "^10.2.0",
		"eslint-config-prettier": "^10.2.0"
	},
	"main": "./dist/index.cjs",
	"types": "/dist/index.d.ts",
	"scripts": {
		"start": "pnpm run build:cjs && node ./dist/index.cjs",
		"build:cjs": "cjs-builder ./src/index.ts",
		"lint:eslint": "eslint . --fix",
		"lint:prettier": "prettier --write ."
	},
	"eslintIgnore": ["ignore-key"],
	"files": [
		"prettier-test-no-replace",
		"README.md",
		".codemodrc.json",
		"./dist/index.cjs",
		"./index.d.ts"
	],
	"lint-staged": {
		"*.js": "eslint --fix",
		"*.ts": "eslint --fix"
	},
	"type": "module"
}
```

### After

```json
{
	"name": "package-name",
	"dependencies": {},
	"devDependencies": {
		"@biomejs/biome": "1.5.3"
	},
	"main": "./dist/index.cjs",
	"types": "/dist/index.d.ts",
	"scripts": {
		"start": "pnpm run build:cjs && node ./dist/index.cjs",
		"build:cjs": "cjs-builder ./src/index.ts",
		"lint:eslint": "pnpm dlx @biomejs/biome lint . --apply",
		"lint:prettier": "pnpm dlx @biomejs/biome format --write .",
		"NOTE": "You can apply both linter, formatter and import ordering by using https://biomejs.dev/reference/cli/#biome-check",
		"NOTE2": "There is an ongoing work to release prettier-tailwind-plugin alternative: https://biomejs.dev/linter/rules/use-sorted-classes/, https://github.com/biomejs/biome/issues/1274"
	},
	"files": [
		"prettier-test-no-replace",
		"README.md",
		".codemodrc.json",
		"./dist/index.cjs",
		"./index.d.ts"
	],
	"lint-staged": {
		"*.js": "pnpm dlx @biomejs/biome lint --apply",
		"*.ts": "pnpm dlx @biomejs/biome lint --apply"
	},
	"type": "module"
}
```

### `.eslintrc.json`

### Before

```json
{
	"rules": [...]
}
```

### After

`Removed and replaced with corresponding rules in biome.json`

### `.prettierrc`

### Before

```json
{
	"printWidth": 80
}
```

### After

`Removed and replaced with corresponding values in biome.json`

### `biome.json`

```json
{
	"linter": {
		"ignore": [
			"ignore-key",
			"dist",
			"build",
			"pnpm-lock.yaml",
			"node_modules"
		],
		"rules": {
			"suspicious": {
				"noDoubleEquals": "warn",
				"noAssignInExpressions": "warn"
			},
			"correctness": {
				"noUnusedVariables": "off"
			}
		}
	},
	"formatter": {
		"ignore": [],
		"indentStyle": "tab"
	}
}
```