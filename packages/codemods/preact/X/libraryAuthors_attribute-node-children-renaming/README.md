
This codemod is intended for library authors who are maintaining packages to be used with Preact X.

**Detailed description:**  
This codemod refactors JSX-like virtual node objects by replacing the outdated `nodeName` and `attributes` properties with the current `type` and `props` properties. This update aligns your code with modern Preact conventions, ensuring compatibility and improving code clarity.



### Before

```ts
const myVNode = {
  nodeName: 'div',
  attributes: {
    id: 'example',
    className: 'container',
  },
  children: [{
    nodeName: 'span',
    attributes: { className: 'text' },
    children: ['Hello, World!'],
  }, ],
};
```

### After

```ts
const myVNode = {
  type: 'div',
  props: {
    id: 'example',
    className: 'container',
  },
  children: [{
    type: 'span',
    props: { className: 'text' },
    children: ['Hello, World!'],
  }, ],
};
```