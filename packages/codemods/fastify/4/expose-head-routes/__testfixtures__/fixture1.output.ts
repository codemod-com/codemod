const fastify = require('fastify')();

fastify.get('/example', (request, reply) => {
    reply.send({ message: 'Hello, World!' });
});
fastify.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
