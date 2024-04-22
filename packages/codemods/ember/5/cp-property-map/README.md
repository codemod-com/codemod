`.property()` is a modifier that adds additional property dependencies to an existing computed property. For `filter`, `map`, and `sort` computed property macros, this codemod ensures they receive an array of additional dependent keys as a second parameter.

## Before

```jsx
const Person = EmberObject.extend({
	friendNames: map('friends', function (friend) {
		return friend[this.get('nameKey')];
	}).property('nameKey'),
});
```

## After

```tsx
const Person = EmberObject.extend({
	friendNames: map('friends', ['nameKey'], function (friend) {
		return friend[this.get('nameKey')];
	}),
});
```