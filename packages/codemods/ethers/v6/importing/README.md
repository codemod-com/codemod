This codemod helps in tranformation, related to some import packages.

In v5, the project was maintained as a large set of sub-packages managed as a monorepo.

In v6 all imports are available in the root package, and for those who wish to have finer-grained control, the pkg.exports makes certain folders available directly.

## Example

### Before

```ts
import { InfuraProvider } from '@ethersproject/providers';
```

### After

```ts
import { InfuraProvider } from 'ethers/providers';
```
,
### Before

```ts
// in v5, some packages were grouped behind an additional property
import { providers } from "ethers"
// And then we could retrieve the below package
const { InfuraProvider } = providers;
// PS: this codemod transforms the above line only, 
// import line in this before claus had to be removed manually
```

### After

```ts
// Everything is available on the root package
import { InfuraProvider } from 'ethers';
```

