# Object New Constructor

## Description

`new EmberObject()` is deprecated in Ember.js v3.9 in favor of constructing instances of `EmberObject` and its subclasses. This codemod replaces all calls to `new EmberObject()` with `EmberObject.create()` and adds a `constructor` function to classes that extend from `EmberObject` so that the classes no longer extend from `EmberObject`.

## Example

### Before:

```jsx
let obj1 = new EmberObject();
let obj2 = new EmberObject({ prop: 'value' });

const Foo = EmberObject.extend();
let foo = new Foo({ bar: 123 });
```

### After:

```tsx
let obj1 = EmberObject.create();
let obj2 = EmberObject.create({ prop: 'value' });

const Foo = EmberObject.extend();
let foo = new Foo({ bar: 123 });
```
