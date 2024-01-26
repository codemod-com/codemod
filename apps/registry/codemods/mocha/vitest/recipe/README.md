# Mocha to Vitest Migration Recipe

## Description

This recipe is a set of codemods that will upgrade your project from using `mocha` to `vitest`.

The recipe includes the following codemods:

-   [migrate-configuration](https://github.com/codemod-com/codemod-registry/tree/main/codemods/mocha/vitest/migrate-configuration)
-   [migrate-tests](https://github.com/codemod-com/codemod-registry/tree/main/codemods/mocha/vitest/migrate-tests)

NOTE: if you are not using vitest default `.spec.*` or `.test.*` file names, then you won't be able to run your tests upon migrating. To mitigate this and add your own set of globs, create `vite.config.ts` file in the root of your project and add the following configuration, replacing `**/test/*.ts` with your own globs:

```ts
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: [...configDefaults.include, '**/test/*.ts'],
	},
});
```

## Applicability Criteria

`mocha` >= 9.0.0

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### Estimated Time Saving

5+ minutes per file

### Owner

[Intuita](https://github.com/codemod-com)
