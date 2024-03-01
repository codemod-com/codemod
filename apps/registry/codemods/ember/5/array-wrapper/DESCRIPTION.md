# Array Wrapper

## Description

This codemod removes any usage of `new` with `A`, and calls `A` as a standard function.

## Example

### Before:

```jsx
import { A } from '@ember/array';

let arr = new A();
```

### After:

```tsx
import { A as emberA } from '@ember/array';

let arr = A();
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

-   https://deprecations.emberjs.com/v3.x/#toc_array-new-array-wrapper
