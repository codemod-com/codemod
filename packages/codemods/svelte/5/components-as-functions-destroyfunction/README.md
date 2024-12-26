This codemod updates Svelte component instantiation and event handling for Svelte 5:

- Converts `new Component({ target })` to `mount(Component, { target })`.
- Replaces `$destroy` method calls with `unmount`.
- Ensures compatibility with Svelte 5's function-based components and new event handling.

## Before

```jsx
import App from './App.svelte';

const app = new App({
    target: document.getElementById('app'),
    props: { foo: 'bar' },
});
app.$destroy();
```

## After

```jsx
import { unmount } from 'svelte';
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
    target: document.getElementById('app'),
    props: { foo: 'bar' },
});
unmount(app);
```
