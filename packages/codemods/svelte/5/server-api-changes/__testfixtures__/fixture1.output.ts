import { render } from 'svelte/server';
import App from './App.svelte';

const { html, head } = render(App, {
    props: { message: 'hello' },
});
