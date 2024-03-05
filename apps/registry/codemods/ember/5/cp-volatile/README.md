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