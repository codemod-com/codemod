// biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
nuxt.hook('builder:watch', (event, path) => {
    if (
        key.startsWith(nuxt.options.dir.public) &&
        (event === 'add' || event === 'unlink')
    )
        refreshDebounced();
});

nuxt.hook('builder:watch', async (event, key) =>
    console.log('File changed:', path),
);
