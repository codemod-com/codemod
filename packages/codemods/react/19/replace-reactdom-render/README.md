# React 18 migrate to create root

## Description

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

