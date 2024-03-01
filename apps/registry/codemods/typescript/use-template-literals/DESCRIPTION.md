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

## Applicability Criteria

TypeScript version higher or equal to 1.4.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~2 minutes per occurrence

### Owner

[Codemod.com](https://codemod.com)
