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

## Applicability Criteria

Ember.js version higher or equal to 3.11.

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

-   https://github.com/ember-codemods/ember-3x-codemods/blob/master/transforms/fpe-observes
