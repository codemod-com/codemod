Codemod to replace the deprecated Severity enum with the SeverityLevel type in Sentry from version 7.x to 8.x.

## Example

### Before

```ts
import { Severity } from '@sentry/types';
```

### After

```ts
import { SeverityLevel } from '@sentry/types';
```
,
### Before

```ts
const level = Severity.error;
```

### After

```ts
const level: SeverityLevel = 'error';
```
,
### Before

```ts
const warningLevel = Severity.warning;
const infoLevel = Severity.info;
```

### After

```ts
const warningLevel: SeverityLevel = 'warning';
const infoLevel: SeverityLevel = 'info';
```
,
### Before

```ts
let currentLevel = Severity.fatal;
```

### After

```ts
let currentLevel: SeverityLevel = 'fatal';
```
,
### Before

```ts
function getSeverity() {
  return Severity.debug;
}
```

### After

```ts
function getSeverity(): SeverityLevel {
  return 'debug';
}
```

