Renames private import from `core/styles/*` to `core/styles`

## Before

```typescript
import { createTheme } from '@material-ui/core/styles';
import { darken, lighten } from '@material-ui/core/styles/colorManipulator';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Overrides } from '@material-ui/core/styles/overrides';
```

## After

```typescript
import {
	createTheme,
	darken,
	lighten,
	makeStyles,
	Overrides,
} from '@material-ui/core/styles';
```