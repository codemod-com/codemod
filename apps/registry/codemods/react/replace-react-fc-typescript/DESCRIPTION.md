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

## Applicability Criteria

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

jscodeshift

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Gonzalo D'Elia](https://github.com/gndelia)

### Links for more info

-   [gndelia/codemod-replace-react-fc-typescript](https://github.com/gndelia/codemod-replace-react-fc-typescript/tree/main)
-   [facebook/create-react-app - Remove React.FC from Typescript template (PR#8177)](https://github.com/facebook/create-react-app/pull/8177)
-   [Spotify Architecture Decision Records - Avoid React.FC and React.SFC](https://backstage.io/docs/architecture-decisions/adrs-adr006)
