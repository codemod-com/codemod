This codemod migrates **BigNumber** in v5 to **BigInt** in v6 in **ethers.js** library.
It also changes the syntax for addition, and checking equality according to v6.

## Example

### Before

```ts
// Using BigNumber in v5
value = BigNumber.from('1000');
// Adding two values in v5
sum = value1.add(value2);
// Checking equality in v5
isEqual = value1.eq(value2);
```

### After

```ts
// Using BigInt in v6
value = BigInt('1000');
// Addition, keep in mind, both values must be a BigInt
sum = value1 + value2;
// Checking equality
isEqual = value1 == value2;
```

