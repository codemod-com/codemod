This codemod removes all calls to `willTransition` or `didTransition` events on the Router via usage of `routeWillChange` event listener and `routeDidChange` event listener.

## Before

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

## After

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
