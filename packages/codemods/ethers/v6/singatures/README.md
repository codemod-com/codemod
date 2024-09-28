The Signature is now a class which facilitates all the parsing and serializing.

## Example

### Before

```ts
splitSig = splitSignature(sigBytes);
```

### After

```ts
splitSig = ethers.Signature.from(sigBytes);
```
,
### Before

```ts
sigBytes = joinSignature(splitSig);
```

### After

```ts
sigBytes = ethers.Signature.from(splitSig).serialized;
```

