# Props Changed Migration

## Description

This codemod changes the way the component props are applied.

## Example

### Before

```TypeScript
import { Tag } from 'antd';

const Component = () => {
  const [visible, setVisible] = useState(false);

  return <Tag visible={visible} />;
};
```

### After

```TypeScript
import { Tag } from 'antd';

const Component = () => {
  const [visible, setVisible] = useState(false);

  return (visible ? <Tag /> : null);
};
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

-   https://github.com/ant-design/codemod-v5/tree/main?tab=readme-ov-file#v5-props-changed-migration
