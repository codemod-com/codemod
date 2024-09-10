This release adds a new API module.enableCompileCache() that can be used to enable on-disk code caching of all modules loaded after this API is called. Previously this could only be enabled by the NODE_COMPILE_CACHE environment variable, so it could only set by end-users. This API allows tooling and library authors to enable caching of their own code. This is a built-in alternative to the v8-compile-cache/v8-compile-cache-lib packages, but have better performance and supports ESM.


### Before

```ts
const http = require('http');

function startServer() {
  // Create an HTTP server
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, Node.js!\n');
  });

  server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000/');
  });
}

startServer();
```

### After

```ts
const http = require('http');

function startServer() {
  // Enable compile cache for all modules loaded after this point
  const result = module.enableCompileCache();

  // Create an HTTP server
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, Node.js!\n');
  });

  server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000/');
  });
}

startServer();
```

