A codemod that enhances child handling in Preact components by using `toChildArray` for accurate child count.

**Detailed description:**  
This codemod refactors Preact components to improve the handling of `props.children`. It introduces the `toChildArray` utility from Preact, ensuring that child elements are accurately counted, especially when dealing with fragments or nested arrays. This leads to more robust and predictable behavior in your components.

## Example

### Before

```ts
function Foo(props) {
  const count = props.children.length;
  return < div > I have { count } children < /div>;
}
```

### After

```ts
import { toChildArray } from 'preact';

function Foo(props) {
  const count = toChildArray(props.children).length;
  return < div > I have { count } children < /div>;
}
```