import App from './App.svelte';

const app = new App({ target: document.getElementById('app') });
app.$on('event', callback);
