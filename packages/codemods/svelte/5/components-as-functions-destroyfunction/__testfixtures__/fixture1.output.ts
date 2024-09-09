import { unmount } from 'svelte';
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
    target: document.getElementById('app'),
    props: { foo: 'bar' },
});
unmount(app);
