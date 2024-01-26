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

## Applicability Criteria

Ember.js version higher or equal to 3.3.

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

-   https://github.com/ember-codemods/ember-3x-codemods/blob/master/transforms/jquery-event
