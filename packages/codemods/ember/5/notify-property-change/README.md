This codemod removes all calls to `propertyWillChange` and replaces all calls to `propertyDidChange` with `notifyPropertyChange`.

## Before

```jsx
Ember.propertyWillChange(object, 'someProperty');
doStuff(object);
Ember.propertyDidChange(object, 'someProperty');

object.propertyWillChange('someProperty');
doStuff(object);
object.propertyDidChange('someProperty');
```

## After

```tsx
doStuff(object);
Ember.notifyPropertyChange(object, 'someProperty');

doStuff(object);
object.notifyPropertyChange('someProperty');
```
