# Migrate Tests from Mocha to Vitest

## Description

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

## Applicability Criteria

`mocha` >= 9.0.0

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

[jscodeshift](https://github.com/facebook/jscodeshift)

### Estimated Time Saving

5+ minutes per file

### Owner

[Codemod.com](https://github.com/codemod-com)

### Links for more info
