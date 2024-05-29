

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