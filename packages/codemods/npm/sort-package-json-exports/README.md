Sort package.json export order to prefer CJS over ESM

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "require": "./dist/index.cjs", // <-- this would cause platforms to prefer CJS over ESM
    "import": "./dist/index.js"
  },
}
```

## Example

### Before

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js",
    "require": "./dist/index.cjs"
  },
}
```

### After

```ts
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "require": "./dist/index.cjs",
    "import": "./dist/index.js"
  },
}
```
