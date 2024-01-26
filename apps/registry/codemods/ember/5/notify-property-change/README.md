# Notify Property Change

## Description

This codemod removes all calls to `propertyWillChange` and replaces all calls to `propertyDidChange` with `notifyPropertyChange`.

## Example

### Before:

```jsx
Ember.propertyWillChange(object, 'someProperty');
doStuff(object);
Ember.propertyDidChange(object, 'someProperty');

object.propertyWillChange('someProperty');
doStuff(object);
object.propertyDidChange('someProperty');
```

### After:

```tsx
doStuff(object);
Ember.notifyPropertyChange(object, 'someProperty');

doStuff(object);
object.notifyPropertyChange('someProperty');
```

## Applicability Criteria

Ember.js version higher or equal to 3.1.

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

-   https://github.com/ember-codemods/ember-3x-codemods/blob/master/transforms/notify-property-change
