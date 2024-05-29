

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
