# Cp Volatile

## Description

This codemod removes all calls to `volatile()` and ensures that native getters are directly used.

## Example

### Before:

```jsx
const Person = EmberObject.extend({
	fullName: computed(function () {
		return `${this.firstName} ${this.lastName}`;
	}).volatile(),
});
```

### After:

```tsx
const Person = EmberObject.extend({
	get fullName() {
		return `${this.firstName} ${this.lastName}`;
	},
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

-   https://deprecations.emberjs.com/v3.x/#toc_computed-property-volatile
