# Fpe Observes

## Description

## Example

### Before:

```jsx
import EmberObject from '@ember/object';

export default EmberObject.extend({
	valueObserver: function () {
		// Executes whenever the "value" property changes
	}.observes('value'),
});
```

### After:

```tsx
import EmberObject from '@ember/object';

export default EmberObject.extend({
	valueObserver: observer('value', function () {
		// Executes whenever the "value" property changes
	}),
});
```
