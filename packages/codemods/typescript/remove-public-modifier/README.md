This codemod removes public modifier in interface declarations as it is implicit.

## Before

```jsx
class MyClass {
    public myProperty: string;

    public constructor() {
    }

    public myMethod(): void {
    }
}
```

## After

```jsx
class MyClass {
    myProperty: string;

    constructor() {
    }

    myMethod(): void {
    }
}
```
