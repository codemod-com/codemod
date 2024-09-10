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