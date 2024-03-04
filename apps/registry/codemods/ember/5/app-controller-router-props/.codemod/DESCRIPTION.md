# App Controller Router Props

## Description

This codemod replaces all occurrences of `this.currentRouteName` with `this.router.currentRouteName`
and `this.currentPath` with `this.router.currentPath`.

## Example

### Before:

```jsx
import Controller from '@ember/controller';
import fetch from 'fetch';

export default Controller.extend({
	store: service('store'),

	actions: {
		sendPayload() {
			fetch('/endpoint', {
				method: 'POST',
				body: JSON.stringify({
					route: this.currentRouteName,
				}),
			});
		},
	},
});
```

### After:

```tsx
import Controller from '@ember/controller';
import fetch from 'fetch';

export default Controller.extend({
	router: service('router'),
	store: service('store'),

	actions: {
		sendPayload() {
			fetch('/endpoint', {
				method: 'POST',
				body: JSON.stringify({
					route: this.router.currentRouteName,
				}),
			});
		},
	},
});
```