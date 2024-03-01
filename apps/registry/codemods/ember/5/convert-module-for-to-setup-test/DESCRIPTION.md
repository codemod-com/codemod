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