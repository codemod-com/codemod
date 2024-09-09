In Svelte 3 and 4, components were classes, while in Svelte 5, components are functions. This codemod updates the instantiation of Svelte components to use `mount` or `hydrate` (imported from svelte), ensuring compatibility with Svelte 5's new functional component model.

## Before

```jsx
import App from './App.svelte';

const app = new App({ target: document.getElementById('app') });

export default app;

```

## After

```jsx
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, { target: document.getElementById('app') });

export default app;


```
