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

-   https://deprecations.emberjs.com/v3.x/#toc_jquery-apis
