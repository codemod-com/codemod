# Remove Public Modifier

## Description

This codemod removes public modifier in interface declarations as it is implicit.

## Example

### Before

```jsx
class MyClass {
    public myProperty: string;

    public constructor() {
    }

    public myMethod(): void {
    }
}
```

### After

```jsx
class MyClass {
    myProperty: string;

    constructor() {
    }

    myMethod(): void {
    }
}
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

~1 minute per occurrence

### Owner

[Codemod.com](https://codemod.com)
