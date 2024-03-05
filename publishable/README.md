
# 

## Examples

### Before

```ts
import { useContext } from "react";
import ThemeContext from "./ThemeContext";

const theme = useContext(ThemeContext);
```

### After

```ts
 import { use } from "react";
 import ThemeContext from "./ThemeContext";

 const theme = use(ThemeContext);
```

## Applicability Criteria

## Other Metadata

### Codemod Version

v0.1.0

### Change Mode (CHOOSE ONE)

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.
**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

[jscodeshift](https://github.com/facebook/jscodeshift)

### Estimated Time Saving

### Owner

[razenization](https: //github.com/razenization)
