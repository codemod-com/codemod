# Deprecate Merge

## Description

This codemod replaces all calls to `Ember.merge` with `Ember.assign`.

## Example

### Before:

```jsx
import { merge } from '@ember/polyfills';

var a = { first: 'Yehuda' };
var b = { last: 'Katz' };
merge(a, b);
```

### After:

```tsx
import { assign } from '@ember/polyfills';

var a = { first: 'Yehuda' };
var b = { last: 'Katz' };
assign(a, b);
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

-   https://deprecations.emberjs.com/v3.x/#toc_ember-polyfills-deprecate-merge
