# Deprecate Router Events

## Description

This codemod removes all calls to `willTransition` or `didTransition` events on the Router via usage of `routeWillChange` event listener and `routeDidChange` event listener.

## Example

### Before:

```jsx
import Router from '@ember/routing/router';
import { inject as service } from '@ember/service';

export default Router.extend({
	currentUser: service('current-user'),

	willTransition(transition) {
		this._super(...arguments);
		if (!this.currentUser.isLoggedIn) {
			transition.abort();
			this.transitionTo('login');
		}
	},

	didTransition(privateInfos) {
		this._super(...arguments);
		ga.send('pageView', {
			pageName: privateInfos.name,
		});
	},
});
```

### After:

```tsx
import Router from '@ember/routing/router';
import { inject as service } from '@ember/service';

export default Router.extend({
	currentUser: service('current-user'),

	init() {
		this._super(...arguments);

		this.on('routeWillChange', (transition) => {
			if (!this.currentUser.isLoggedIn) {
				transition.abort();
				this.transitionTo('login');
			}
		});

		this.on('routeDidChange', (transition) => {
			ga.send('pageView', {
				pageName: privateInfos.name,
			});
		});
	},
});
```

## Applicability Criteria

Ember.js version higher or equal to 3.6.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Rajasegar Chandran](https://github.com/rajasegar)

### Links for more info

-   https://deprecations.emberjs.com/v3.x/#toc_deprecate-router-events
