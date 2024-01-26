# Convert moduleFor to setupTest

## Description

This codemod transforms from the older `moduleFor*` syntax of `ember-qunit@2` to the newer `setup*Test` syntax.

## Example

### Before:

```tsx
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:flash', 'Unit | Service | Flash', {
	unit: true,
});

test('should allow messages to be queued', function (assert) {
	let subject = this.subject();
});
```

### After:

```tsx
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Service | Flash', function (hooks) {
	setupTest(hooks);

	test('should allow messages to be queued', function (assert) {
		let subject = this.owner.lookup('service:flash');
	});
});
```

## Applicability Criteria

Ember.js version higher or equal to 2.4.

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

[Robert Jackson](https://github.com/rwjblue)

### Links for more info

-   https://github.com/ember-codemods/ember-qunit-codemod/tree/master/transforms/convert-module-for-to-setup-test
