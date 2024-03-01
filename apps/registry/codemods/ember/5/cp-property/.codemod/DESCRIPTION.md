# Cp Property

## Description

`.property()` is a modifier that adds additional property dependencies to an existing computed property. This codemod moves the dependencies to the main computed property definition.

## Example

### Before:

```jsx
const Person = EmberObject.extend({
	fullName: computed(function () {
		return `${this.firstName} ${this.lastName}`;
	}).property('firstName', 'lastName'),
});
```

### After:

```tsx
const Person = EmberObject.extend({
	fullName: computed('firstName', 'lastName', function () {
		return `${this.firstName} ${this.lastName}`;
	}),
});
```
