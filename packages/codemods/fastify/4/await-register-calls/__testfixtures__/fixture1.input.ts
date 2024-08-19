// biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
fastify.register((instance, opts, done) => {
    instance.addHook('onRoute', (routeOptions) => {
        const { path, method } = routeOptions;
        console.log({ path, method });
    });
    done();
});
