This codemod migrates the `target` property in Webpack configurations from a function to `false` and moves the function to the `plugins` array.

In Webpack 4, it was possible to set the `target` property to a function. However, in Webpack 5, this approach is no longer supported. Instead, the `target` should be set to `false`, and the function should be included in the `plugins` array. This codemod automates the transformation of Webpack configurations to adhere to the new specification.


## Example


### Before

```ts
module.exports = {
  target: WebExtensionTarget(nodeConfig),
};
```

### After

```ts
module.exports = {
  target: false,
  plugins: [WebExtensionTarget(nodeConfig)],
};
```
,

### Before

```ts
const WebExtensionTarget = require('webpack-extension-target');

module.exports = {
  target: WebExtensionTarget(nodeConfig),
  mode: 'development',
  output: {
    filename: 'bundle.js',
  },
};
```

### After

```ts
const WebExtensionTarget = require('webpack-extension-target');

module.exports = {
  target: false,
  plugins: [WebExtensionTarget(nodeConfig)],
  mode: 'development',

  output: {
    filename: 'bundle.js',
  },
};
```
,

### Before

```ts
module.exports = {
  target: WebExtensionTarget(nodeConfig),
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
```

### After

```ts
module.exports = {
  target: false,
  plugins: [WebExtensionTarget(nodeConfig)],

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
};
```
,

### Before

```ts
module.exports = {
  target: CustomTargetFunction(config),
};
```

### After

```ts
module.exports = {
  target: false,
  plugins: [CustomTargetFunction(config)],
};
```

