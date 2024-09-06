This codemod migrates the `output.library` and `output.libraryTarget` properties in Webpack configurations to the new format required by Webpack 5. It changes `output.library` to `output.library.name` and `output.libraryTarget` to `output.library.type`.

## Example

### Before

```ts
module.exports = {
  output: {
    library: 'MyLibrary',
    libraryTarget: 'commonjs2',
  },
};
```

### After

```ts
module.exports = {
  output: {
    library: {
      name: 'MyLibrary',
      type: 'commonjs2',
    },
  },
};
```
,

### Before

```ts
module.exports = {
  output: {
    library: 'MyLibrary',
    libraryTarget: 'commonjs2',
    filename: 'bundle.js',
  },
};
```

### After

```ts
module.exports = {
  output: {
    library: {
      name: 'MyLibrary',
      type: 'commonjs2',
    },

    filename: 'bundle.js',
  },
};
```
,

### Before

```ts
module.exports = {
  output: {
    library: 'MyLibrary',
  },
};
```

### After

```ts
module.exports = {
  output: {
    library: {
      name: 'MyLibrary',
      type: undefined,
    },
  },
};
```
,

### Before

```ts
module.exports = {
  output: {
    library: 'MyLibrary',
    libraryTarget: 'umd',
    path: './dist',
  },
};
```

### After

```ts
module.exports = {
  output: {
    library: {
      name: 'MyLibrary',
      type: 'umd',
    },

    path: './dist',
  },
};
```

