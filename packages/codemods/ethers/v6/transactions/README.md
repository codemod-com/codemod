The transaction helpers present in v5 were all wrapped into a **Transaction** class, which can handle any supported transaction format to be further processed.

## Example

### Before

```ts
tx = parseTransaction(txBytes);
```

### After

```ts
tx = Transaction.from(txBytes);
```

There is new way to serialize the transaction object('tx') back into raw transaction bytes.
The advantage here is that *Transaction* object itself manages whether the transaction is signed or not, and the serialized property 
will automatically include the signature if it is present in the Transaction object.

Whereas in v5 we have to we have to explicitly mentioned whether the transaction is signed or not.

This is for both the transformation below.

### Before

```ts
txBytes = serializeTransaction(tx);
```

### After

```ts
txBytes = Transaction.from(tx).serialized;
```

### Before

```ts
txBytes = serializeTransaction(tx, sig);
```

### After

```ts
txBytes = Transaction.from(tx).serialized;
```

