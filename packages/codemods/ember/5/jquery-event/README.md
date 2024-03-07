# Jquery Event

## Description

Using event object APIs that are specific to `jQuery.Event`, such as `originalEvent`, is deprecated in Ember.js v3.3. This codemod removes all calls to `originalEvent` in case of accessing properties that work with jQuery events as well as native events.

## Example

### Before:

```jsx
// your event handler:
export default Component.extend({
	click(event) {
		let x = event.originalEvent.clientX;
	},
});
```

### After:

```tsx
// your event handler:
export default Component.extend({
	click(event) {
		let x = event.clientX;
	},
});
```
