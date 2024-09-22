In v5, in the case of an ambiguous method, it was necessary to look up a method by its canonical normalized signature. In v6 the signature does not need to be normalized and the Typed API provides a cleaner way to access the desired method.

In v5, duplicate definitions also injected warnings into the console, since there was no way to detect them at run-time.

## Example

### Before

```ts
abi = [
  "function foo(address bar)",
  "function foo(uint160 bar)",
]
contract = new Contract(address, abi, provider)

// In v5 it was necessary to specify the fully-qualified normalized
// signature to access the desired method. For example:
contract["foo(address)"](addr)

// These would fail, since there signature is not normalized:
contract["foo(address )"](addr)
contract["foo(address addr)"](addr)

// This would fail, since the method is ambiguous:
contract.foo(addr)
```

### After

```ts
abi = [
  "function foo(address bar)",
  "function foo(uint160 bar)",
]
contract = new Contract(address, abi, provider)

// Any of these work fine:
contract["foo(address)"](addr)
contract["foo(address )"](addr)
contract["foo(address addr)"](addr)

// This still fails, since there is no way to know which
// method was intended
contract.foo(addr)

// However, the Typed API makes things a bit easier, since it
// allows providing typing information to the Contract:
contract.foo(Typed.address(addr))
```

Transformation done using this codemod

### Before

```ts
abi = ['function foo(address bar)', 'function foo(uint160 bar)'];
contract = new Contract(address, abi, provider);

contract.foo(addr);
```

### After

```ts
abi = ['function foo(address bar)', 'function foo(uint160 bar)'];
contract = new Contract(address, abi, provider);

contract.foo(Typed.address(addr));
```

