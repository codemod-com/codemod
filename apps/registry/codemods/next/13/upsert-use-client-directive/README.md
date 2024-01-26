# Upsert Use Client Directive

## Description

Since Next.js 13.4, you can mark the files that contain only client-side code with the `use client` directive at the top.

The codemod will look for identifiers and string literals common for files that contain client-side code, such as React hooks or event handlers. On the other hand, it will not upsert any directive should it spot elements indicating server-side code.

The codemod will not remove the existing `use client` directive even if it would suggest otherwise due to the code in question.

## Example

### Before

```jsx
import { useState } from 'react';

export default function Page() {
	const [x, setX] = useState('');

	return x;
}
```

### After

```jsx
'use client';

import { useState } from 'react';

export default function Page() {
	const [x, setX] = useState('');

	return x;
}
```

## Applicability Criteria

Next.js version is greater or equal to 13.4.

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

[ts-morph](https://github.com/dsherret/ts-morph)

### Estimated Time Saving

~5 minutes per occurrence

### Owner

[Intuita](https://github.com/codemod-com)
