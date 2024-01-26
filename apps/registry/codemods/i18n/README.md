# Replace API Routes

## Description

This codemod removes unused i18n translations.

## Example:

> This codemod supports removing several i18n unused translation patterns. The example below shows only one of the cases that might occur. For an exhaustive list of the supported patterns, please refer to the codemod's [`test.ts` file](./test.ts).

### Before:

```jsx
import { useLocale } from '@calcom/lib/hooks/useLocale';

export default function A() {
	const { t } = useLocale();

	return <p>{t('key1')}</p>;
}
```

### After:

```jsx
{
	"key1": "key1",
	"key2": "key2"
}
```

## Applicability Criteria

Any version of i18n.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

Intuita File Transformation Engine

### Estimated Time Saving

~3 minutes per occurrence

### Owner

[Intuita](https://github.com/codemod-com)
