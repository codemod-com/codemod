fastify.register((instance, opts, done) => {
    instance.addHook('onRoute', (routeOptions) => {
        const { path, method } = routeOptions;
        console.log({ path, method });
        done();
    });
});

fastify.get('/', (request, reply) => {
    reply.send('hello');
});
