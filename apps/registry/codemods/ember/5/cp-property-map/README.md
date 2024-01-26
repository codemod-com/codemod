# Cp Property Map

## Description

`.property()` is a modifier that adds additional property dependencies to an existing computed property. For `filter`, `map`, and `sort` computed property macros, this codemod ensures they receive an array of additional dependent keys as a second parameter.

## Example

### Before:

```jsx
const Person = EmberObject.extend({
	friendNames: map('friends', function (friend) {
		return friend[this.get('nameKey')];
	}).property('nameKey'),
});
```

### After:

```tsx
const Person = EmberObject.extend({
	friendNames: map('friends', ['nameKey'], function (friend) {
		return friend[this.get('nameKey')];
	}),
});
```

## Applicability Criteria

Ember.js version higher or equal to 3.9.

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

-   https://deprecations.emberjs.com/v3.x/#toc_computed-property-property
