This codemod migrates the plugins option to client.extend() calls.

## What Changed

Previously, you could pass plugins as an option to the Client constructor. Now, plugins need to be added using the client.extend() method.
## Before

```jsx
const { Client } = require('elasticsearch');
const client = new Client({
  node: 'http://localhost:9200',
  plugins: ['pluginA', 'pluginB']
});

```

## After

```jsx
const { Client } = require('@elastic/elasticsearch');
const client = new Client({
  node: 'http://localhost:9200'
});
client.extend('pluginA');
client.extend('pluginB');
```
