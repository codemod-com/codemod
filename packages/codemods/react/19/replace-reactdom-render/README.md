# Replace reactDOM methods

## Description

- Replaces usages of `ReactDom.render()` with `createRoot(node).render()`.
- Replaces usages of `ReactDom.hydrate()` with `hydrateRoot()`
- Replaces usages of `ReactDom.unmountComponentAtNode()` with `root.unmount()`

## Examples

### Before

```ts
import ReactDom from "react-dom";
import Component from "Component";

ReactDom.render(<Component />, document.getElementById('app'));
```

### After

```ts
import { createRoot } from "react-dom/client";
import ReactDom from "react-dom";
import Component from "Component";

const root = createRoot(document.getElementById('app'));
root.render(<Component />);

```

### Before

```ts
import ReactDom from "react-dom";
import Component from "Component";

ReactDom.hydrate(<Component />, document.getElementById("app"));
```

### After

```ts
import { hydrateRoot } from "react-dom/client";
import ReactDom from "react-dom";
import Component from "Component";

hydrateRoot(document.getElementById("app"), <Component />);

```