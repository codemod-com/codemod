This codemod transforms `get()` to `getProperties()` to use traditional object dot notation. This standard was proposed by Ember.js team in https://github.com/emberjs/rfcs/blob/master/text/0281-es5-getters.md.

## Before

```jsx
let chancancode = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

chancancode.get('fullName');

let model = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

model.get('fullName');

let route = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

route.get('fullName');

let controller = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

controller.get('fullName');
controller.get('foo.bar');
controller.get('foo-bar');
```

## After

```tsx
let chancancode = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

chancancode.get('fullName');

let model = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

model.get('fullName');

let route = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

route.fullName;

let controller = Person.create({ firstName: 'Godfrey', lastName: 'Chan' });

controller.fullName;
controller.get('foo.bar');
controller['foo-bar'];
```
