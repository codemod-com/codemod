# Removed Component Migration

## Description

Replace import for removed component in v5.

## Example

### Before

```TypeScript
import { Avatar, BackTop, Comment, PageHeader } from 'antd';

```

### After

```TypeScript
import { Comment } from '@ant-design/compatible';
import { PageHeader } from '@ant-design/pro-layout';
import { Avatar, FloatButton } from 'antd';
```

## Applicability Criteria

Ant Design >= 5.0.0

## Other Metadata

### Codemod Version

v1.0.0

### Change Mode

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.

### **Codemod Engine**

[jscodeshift](https://github.com/facebook/jscodeshift)

### Estimated Time Saving

Up to 1 minutes per occurrence

### Owner

[Ant Design](https://github.com/ant-design)

### Links for more info

-   https://github.com/ant-design/codemod-v5/tree/main?tab=readme-ov-file#v5-removed-component-migration
