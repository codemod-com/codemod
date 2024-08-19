fastify.get('/posts/:id?', (request, reply) => {
    const { id } = request.params;
});
