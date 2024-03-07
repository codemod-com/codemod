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