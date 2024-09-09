This codemod updates Svelte component rendering:

- Converts calls to `Component.render({...})` to `render(Component, { props })`.
- Ensures the import statement `import { render } from 'svelte/server'` is added if render is used.


## Before

```jsx
import App from './App.svelte';

const { html, head } = App.render({ message: 'hello' });
```

## After

```jsx
import { render } from 'svelte/server';
import App from './App.svelte';

const { html, head } = render(App, {
    props: { message: 'hello' },
});
```
