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