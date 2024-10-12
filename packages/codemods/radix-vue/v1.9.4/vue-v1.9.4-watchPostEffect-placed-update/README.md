When floating-ui returned isPositioned=true, radix-vue immediately emitted an event to focus on the selected item in the Select component. However, at this point, the PopperContent element did not yet have the correct transform CSS property set, resulting in the Popper being positioned at coordinates (0, -200%)

Credits to the contributor

## Example

### Before

```ts
import { watchEffect } from 'vue';

watchEffect(() => {});
```

### After

```ts
import { watchPostEffect } from 'vue';

watchPostEffect(() => {});
```

