# Remove Style Import

## Description

Comment out the style file import from antd (in js file).

## Example

### Before

```TypeScript
import 'antd/es/auto-complete/style';
import 'antd/lib/button/style/index.less';
import 'antd/dist/antd.compact.min.css';

```

### After

```TypeScript
// import 'antd/es/auto-complete/style';
// import 'antd/lib/button/style/index.less';
// import 'antd/dist/antd.compact.min.css';
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

-   https://github.com/ant-design/codemod-v5/tree/main?tab=readme-ov-file#v5-remove-style-import
