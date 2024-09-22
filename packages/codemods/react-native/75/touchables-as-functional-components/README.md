This codemod changes the touchables from being generic expressions to functional components.

## Before:

```ts
import { TouchableHighlight } from 'react-native';
const ref = useRef<TouchableHighlight>();
```

## After:

```ts
import { TouchableHighlight } from 'react-native';
const ref = useRef<View>();
```
