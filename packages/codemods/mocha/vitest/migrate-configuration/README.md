# Migrate Configuration from Mocha to Vitest

## Description

Run this codemod to upgrade configuration files that need to be changed after migrating from `mocha` to `vitest`.

## Example

### `package.json`

### Before

```json
{
	"name": "package-name",
	"dependencies": {
		"mocha": "^10.2.0",
		"some-mocha-plugin": "^10.0.4"
	},
	"devDependencies": {
		"mocha": "^10.2.0",
		"@types/mocha": "^10.0.4"
	},
	"main": "./dist/index.cjs",
	"types": "/dist/index.d.ts",
	"scripts": {
				"test": "mocha"
	},
	"mocha": {
		"config-key": "config-value"
	},
	"files": ["README.md", ".codemodrc.json", "./dist/index.cjs", "./index.d.ts"],
	"type": "module"
}
```

### After

```json
{
	"name": "package-name",
	"dependencies": {},
	"devDependencies": {
		"vitest": "^1.0.1",
		"@vitest/coverage-v8": "^1.0.1"
	},
	"main": "./dist/index.cjs",
	"types": "/dist/index.d.ts",
	"scripts": {
				"test": "vitest run",
		"coverage": "vitest run --coverage"
	},
	"files": ["README.md", ".codemodrc.json", "./dist/index.cjs", "./index.d.ts"],
	"type": "module"
}
```

### `tsconfig.json`

### Before

```json
{
	"compilerOptions": { "types": ["mocha"] },
	"include": [
		"./src/**/*.ts",
		"./src/**/*.js",
		"./test/**/*.ts",
		"./test/**/*.js"
	]
}
```

### After

```json
{
	"compilerOptions": {},
	"include": [
		"./src/**/*.ts",
		"./src/**/*.js",
		"./test/**/*.ts",
		"./test/**/*.js"
	]
}
```

### `.mocharc`

### Before

```json
{
	"loader": ["ts-node/esm"],
	"full-trace": true,
	"failZero": false,
	"bail": true,
	"spec": "./**/test.ts",
	"timeout": 5000
}
```

### After

`Removed`