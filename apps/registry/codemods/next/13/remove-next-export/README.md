# Remove Next Export

## Description

The `next export` command is deprecated. This codemod dangerously removes all references to the command in `*.md`, `*.sh`, `package.json`. It also adds a property `output` with the value `export` to the `module.exports` object in `next.config.js` files.

## Example

### Before (Shell files):

```sh
npm run next build
npm run next export
```

### After (Shell files):

```sh
npm run next build
```

### Before (`next.config.js` files):

```javascript
module.exports = {
	distDir: 'out',
};
```

### After (`next.config.js` files):

```javascript
module.exports = {
	distDir: 'out',
	output: 'export',
};
```

## Applicability Criteria

Next.js version higher or equal to 13.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

Intuita File Transformation Engine

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Intuita](https://github.com/codemod-com)

### Links for more info

-   https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration
