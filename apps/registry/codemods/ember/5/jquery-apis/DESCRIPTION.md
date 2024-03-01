# Jquery Apis

## Description

This codemod replaces all calls to `this.$()` inside of an `Ember.Component` with `this.element` property, which provides a reference to a native DOM element.

## Example

## Events

### Before:

```jsx
import Component from '@ember/component';

export default Component.extend({
	waitForAnimation() {
		this.$().on('transitionend', () => this.doSomething());
	},
});
```

### After:

```tsx
import Component from '@ember/component';

export default Component.extend({
	waitForAnimation() {
		this.element.addEventListener('transitionend', () =>
			this.doSomething(),
		);
	},
});
```

## Query Selector

### Before:

```jsx
import Component from '@ember/component';

export default Component.extend({
	waitForAnimation() {
		this.$('.animated').on('transitionend', () => this.doSomething());
	},
});
```

### After:

```tsx
import Component from '@ember/component';

export default Component.extend({
	waitForAnimation() {
		this.element
			.querySelectorAll('.animated')
			.forEach((el) =>
				el.addEventListener('transitionend', () => this.doSomething()),
			);
	},
});
```
