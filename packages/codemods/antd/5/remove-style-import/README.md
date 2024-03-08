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