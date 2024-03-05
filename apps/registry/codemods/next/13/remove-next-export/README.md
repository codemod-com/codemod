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
