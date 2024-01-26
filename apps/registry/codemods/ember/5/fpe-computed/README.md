# Fpe Computed

## Description

## Example

### Before:

```jsx
import EmberObject from '@ember/object';

let Person = EmberObject.extend({
	init() {
		this._super(...arguments);

		this.firstName = 'Betty';
		this.lastName = 'Jones';
	},

	fullName: function () {
		return `${this.firstName} ${this.lastName}`;
	}.property('firstName', 'lastName'),
});

let client = Person.create();

client.get('fullName'); // 'Betty Jones'

client.set('lastName', 'Fuller');
client.get('fullName'); // 'Betty Fuller'
```

### After:

```tsx
import EmberObject, { computed } from '@ember/object';

let Person = EmberObject.extend({
	init() {
		this._super(...arguments);

		this.firstName = 'Betty';
		this.lastName = 'Jones';
	},

	fullName: computed('firstName', 'lastName', function () {
		return `${this.firstName} ${this.lastName}`;
	}),
});

let client = Person.create();

client.get('fullName'); // 'Betty Jones'

client.set('lastName', 'Fuller');
client.get('fullName'); // 'Betty Fuller'
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

-   https://github.com/ember-codemods/ember-3x-codemods/blob/master/transforms/fpe-computed
