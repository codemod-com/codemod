# Core Styles Import

## Description

Renames private import from `core/styles/*` to `core/styles`

## Example

### Before

```typescript
import { createTheme } from '@material-ui/core/styles';
import { darken, lighten } from '@material-ui/core/styles/colorManipulator';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Overrides } from '@material-ui/core/styles/overrides';
```

### After

```typescript
import {
	createTheme,
	darken,
	lighten,
	makeStyles,
	Overrides,
} from '@material-ui/core/styles';
```

## Applicability Criteria

MUI version >= 4.0.0

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

[jscodeshift](https://github.com/facebook/jscodeshift)

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[MUI](https://github.com/mui)
