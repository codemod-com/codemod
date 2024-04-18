Run this codemod to upgrade your codebase from using mocha to vitest.

## Example

### Before

```ts
import { expect } from 'chai';

describe('Test Suite 1', () => {
	it('addition', () => {
		expect(1 + 1).to.equal(2);
	});
});
```

### After

```ts
import { describe, expect, it } from 'vitest';

describe('Test Suite 1', () => {
	it('addition', () => {
		expect(1 + 1).to.equal(2);
	});
});
```