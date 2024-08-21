A codemod that prevents synchronous state access in Preact by converting `setState` to use a callback function.

**Detailed description:**  
In Preact X, state updates are no longer applied synchronously, meaning that accessing `this.state` immediately after calling `setState` may return outdated values. This codemod refactors your code to use the functional form of `setState`, ensuring that state updates correctly depend on the previous state, preventing potential bugs and ensuring compatibility with Preact X.

## Example

### Before

```ts
this.setState({ counter: this.state.counter + 1 });
```

### After

```ts
this.setState((prevState) => {
  return { counter: prevState.counter + 1 };
});
```