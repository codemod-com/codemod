# Ember Jquery Legacy

## Description

Using event object APIs that are specific to `jQuery.Event`, such as `originalEvent`, is deprecated in Ember.js v3.3. This codemod ensures the access to the native event without triggering any deprecations via wrapping the `event` with the `normalizeEvent` function provided by `ember-jquery-legacy`.

## Example

### Before:

```jsx
export default Component.extend({
	click(event) {
		let nativeEvent = event.originalEvent;
	},
});
```

### After:

```tsx
import { normalizeEvent } from 'ember-jquery-legacy';

export default Component.extend({
	click(event) {
		let nativeEvent = normalizeEvent(event);
	},
});
```
