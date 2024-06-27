Replaces default props with  ES6 default parameters. 

## Example

### Before

```tsx
const Button = ({ size, color }) => {
    return <button style={{ color, fontSize: size }}>Click me</button>;
}

Button.defaultProps = {
    size: '16px',
    color: 'blue'
}
```

### After

```tsx
const Button = ({ size = '16px', color = 'blue' }) => {
    return <button style={{ color, fontSize: size }}>Click me</button>;
}
```

