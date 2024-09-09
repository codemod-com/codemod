This codemod updates Svelte component instantiation and event handling for Svelte 5:

- Converts `new Component({ target })` to `mount(Component, { target })`.
- Adds the `mount` import from `svelte` if not present.
- Replaces `$on` method calls with the `events` property in the mount options.

This ensures compatibility with Svelte 5's function-based components and new event handling.

## Before

```jsx
import App from './App.svelte';

const app = new App({ target: document.getElementById('app') });
app.$on('event', callback);
```

## After

```jsx
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
    target: document.getElementById('app'),
    events: { event: callback },
});
```
