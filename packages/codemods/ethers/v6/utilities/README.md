This codemod does tranformation based on changes in the utils in ethers.js

## Example

Byte32 string helpers

### Before

```ts
bytes32 = ethers.utils.formatBytes32String(text);
text = ethers.utils.parseBytes32String(bytes32);
```

### After

```ts
bytes32 = ethers.encodeBytes32String(text);
text = ethers.decodeBytes32String(bytes32);
```
Constants

### Before

```ts
ethers.constants.AddressZero;
ethers.constants.HashZero;
```

### After

```ts
ethers.ZeroAddress;
ethers.ZeroHash;
```
Data Manipulation

### Before

```ts
slice = ethers.utils.hexDataSlice(value, start, end);
padded = ethers.utils.hexZeroPad(value, length);
hex = hexlify(35);
```

### After

```ts
slice = ethers.dataSlice(value, start, end);
padded = ethers.zeroPadValue(value, length);
// v6; converting numbers to hexstrings
hex = toBeHex(35);
```
Deafult AbiCoder

### Before

```ts
// In v5, it is a property of AbiCoder
coder = AbiCoder.defaultAbiCoder;
```

### After

```ts
// In v6, it is a static function on AbiCoder
coder = AbiCoder.defaultAbiCoder();
```
Hex Conversion

### Before

```ts
hex = ethers.utils.hexValue(value);
array = ethers.utils.arrayify(value);
```

### After

```ts
hex = ethers.toQuantity(value);
array = ethers.getBytes(value);
```
Solidity non-standard packed

### Before

```ts
ethers.utils.solidityPack(types, values);
ethers.utils.solidityKeccak256(types, values);
ethers.utils.soliditySha256(types, values);
```

### After

```ts
ethers.solidityPacked(types, values);
ethers.solidityPackedKeccak256(types, values);
ethers.solidityPackedSha256(types, values);
```
Property Manipulation
### Before

```ts
ethers.utils.defineReadOnly(obj, 'name', value);
```

### After

```ts
ethers.defineProperties(obj, { name: value });
```

Above were some transformation, that were done in utilities section of ethers, now below are some cleanups and breaking changes.
PS: These changes are not done using codemod.

**Fetching content**

Basic Fetch with Json

### Before

```ts
data = await ethers.utils.fetchJson(url, json, processFunc);
```

### After

```ts
const req = new ethers.FetchRequest(url);
req.body = json;
req.processFunc = processFunc;
const resp = await req.send();
data = resp.bodyJson;  // or resp.bodyText / resp.body depending on the desired format
```

Fetch with Connection Overrides:

### Before

```ts
req = {
    url: url,
    user: "username",
    password: "password"
    // etc. properties have FetchRequest equivalents
};
data = await ethers.utils.fetchJson(req, json, processFunc);
```

### After

```ts
const req = new ethers.FetchRequest(url);
req.setCredentials("username", "password");
req.body = json;
req.processFunc = processFunc;
const resp = await req.send();
data = resp.bodyJson;  // or resp.bodyText / resp.body depending on the desired format
```
