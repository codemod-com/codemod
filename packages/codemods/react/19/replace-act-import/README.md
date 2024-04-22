This codemod will replace the usages of `TestUtils.act()` to use `React.act()`, introduced in React v19.

## Before

```ts
import { act } from 'react-dom/test-utils';

act();
```

## After

```ts
import { act } from "react";

act();
```



## Before

```ts
import * as ReactDOMTestUtils from 'react-dom/test-utils';

ReactDOMTestUtils.act();
```

## After

```ts
import * as React from "react";

React.act();
```

