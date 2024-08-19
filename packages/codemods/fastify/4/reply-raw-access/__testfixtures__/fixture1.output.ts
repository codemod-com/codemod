fastify.get('/example', (request, reply) => {
    const rawResponse = reply.raw;
    rawResponse.writeHead(200, { 'Content-Type': 'text/plain' });
    rawResponse.end('Hello, World!');
});
