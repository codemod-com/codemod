// biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
import { relative, resolve } from 'node:fs';

const refreshDebounced = debounce(() => {
    cache = null;
    refresh('getStaticAssets');
}, 500);

nuxt.hook('builder:watch', (event, path) => {
    path = relative(nuxt.options.srcDir, resolve(nuxt.options.srcDir, path));
    if (
        key.startsWith(nuxt.options.dir.public) &&
        (event === 'add' || event === 'unlink')
    )
        refreshDebounced();
});


nuxt.hook('builder:watch', async (event, key) => {
    key = relative(nuxt.options.srcDir, resolve(nuxt.options.srcDir, key));
    return console.log('File changed:', path);
});

