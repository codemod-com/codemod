In Vue 3.x, h is now globally imported instead of being automatically passed as an argument. This codemod migrates the render function API to be compatible with Vue 3.x.

## Before

```ts
export default {
  render(h) {
    return h('div')
  }
}
```

## After

```ts
import { h } from 'vue'

export default {
  render() {
    return h('div')
  }
}
```
