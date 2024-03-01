# Use Template Literals

## Description

This codemod replaces string concatenations with template literals.

## Example

### Before

```jsx
const name = 'John';
const greeting = 'Hello, ' + name + '!';
```

### After

```jsx
const name = 'John';
const greeting = `Hello, ${name}!`;
```
