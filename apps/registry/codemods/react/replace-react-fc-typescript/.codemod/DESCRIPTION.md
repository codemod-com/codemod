# Replace React FC Typescript

## Description

This codemod removes `React.FC`, `React.FunctionComponent` and `React.SFC` and replaces the Props as the type of the unique argument in the component definition.

This codemod supports:

-   Inline defined props.
-   Generics.
-   Props defined with intersection.
-   Component modules defined using intersection.
-   Regular named functions.
-   Functions that accept a component definition.
-   Using FC, FunctionComponent and SFC as a named export.

## Example

### Before:

```jsx
type Props2 = { id: number };
export const MyComponent2: React.FC<Props2> = (props) => {
  return <span>{props.id}</span>
}
```

### After:

```tsx
type Props2 = { id: number };
export const MyComponent2 = (props: Props2) => {
	return <span>{props.id}</span>;
};
```