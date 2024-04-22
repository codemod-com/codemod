This codemod replaces string concatenations with template literals.

## Before

```jsx
const name = 'John';
const greeting = 'Hello, ' + name + '!';
```

## After

```jsx
const name = 'John';
const greeting = `Hello, ${name}!`;
```
