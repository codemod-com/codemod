This codemod transforms some of the other method operations that are present in Contracts class of ethers.

## Example

### Before

```ts
contract.functions.foo(addr);
```

### After

```ts
contract.foo.staticCallResult(addr);
```

### Before

```ts
contract.callStatic.foo(addr);
```

### After

```ts
contract.foo.staticCall(addr);
```

### Before

```ts
contract.estimateGas.foo(addr);
```

### After

```ts
contract.foo.estimateGas(addr);
```


### Before

```ts
contract.populateTransaction.foo(addr);
```

### After

```ts
contract.foo.populateTransaction(addr);
```

Below transformation is not done using codemod, since it is a new feature in v6

Explicitly sends a transaction, regardless of function type

```ts
contract.foo.send(addr)
```
