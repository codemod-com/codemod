# ES5 Getter Ember Codemod

## Description

This codemod transforms `get()` to `getProperties()` to use traditional object dot notation. This standard was proposed by Ember.js team in https://github.com/emberjs/rfcs/blob/master/text/0281-es5-getters.md.

## Example

### Before:

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

### After:

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

[Multiple Contributors](https://github.com/ember-codemods/es5-getter-ember-codemod/graphs/contributors)

### Links for more info

-   https://github.com/ember-codemods/es5-getter-ember-codemod/blob/master/transforms/es5-getter-ember-codemod
