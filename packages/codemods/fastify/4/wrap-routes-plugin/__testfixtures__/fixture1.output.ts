fastify.register((instance, opts, done) => {
    instance.addHook('onRoute', (routeOptions) => {
        const { path, method } = routeOptions;
        console.log({ path, method });
        done();
    });
});

fastify.register((instance, opts, done) => {
    instance.get('/', (request, reply) => {
        reply.send('hello');
    });
    done();
});
