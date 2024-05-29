

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