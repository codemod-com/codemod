/** @type {import("eslint").Linter.Config} */
module.exports = {
	root: true,
	extends: [
		"plugin:prettier/recommended",
		"plugin:@typescript-eslint/recommended",
	],
	parser: "@typescript-eslint/parser",
	plugins: ["@typescript-eslint", "unused-imports"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
		ecmaVersion: "latest",
		sourceType: "module",
	},
	rules: {
		"@typescript-eslint/ban-types": "warn",
		"@typescript-eslint/no-explicit-any": "warn",
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{
				vars: "all",
				varsIgnorePattern: "^_",
				args: "after-used",
				argsIgnorePattern: "^_",
				destructuredArrayIgnorePattern: "^_",
			},
		],
		"unused-imports/no-unused-imports": "error",
		"no-restricted-imports": [
			"error",
			{
				patterns: ["lodash"],
			},
		],
		"prefer-template": "error",
	},
	overrides: [
		{
			files: ["*.d.ts"],
			rules: { "prettier/prettier": "off" },
		},
	],
};
