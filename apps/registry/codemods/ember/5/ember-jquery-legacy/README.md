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

-   https://github.com/ember-codemods/ember-3x-codemods/blob/master/transforms/ember-jquery-legacy
