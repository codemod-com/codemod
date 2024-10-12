 Starts Node.js in watch mode. When in watch mode, changes in the watched files cause the Node.js process to restart. By default, watch mode will watch the entry point and any required or imported module. Use `--watch-path` to specify what paths to watch

### Before

```ts
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "openai": "^3.2.1"
  }
}
```

### After

```ts
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node --watch index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "openai": "^3.2.1"
  }
}
```

