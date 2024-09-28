In addition to all the `ethers.providers.*` being moved to `ethers.*`, the biggest change developers need to keep in mind is that Web3Provider (which historically was used to wrap link-web3 providers) is now called BrowserProvider which is designed to wrap EIP-1193 providers, which is the standard that both modern Web3.js and injected providers offer.

## Example

### Before

```ts
provider = new ethers.providers.Web3Provider(window.ethereum);
```

### After

```ts
provider = new ethers.BrowserProvider(window.ethereum);
```

Method for broadcasting transactions to the network has changed

### Before

```ts
provider.sendTransaction(signedTx);
```

### After

```ts
provider.broadcastTransaction(signedTx);
```
The **StaticJsonRpcProvider** in v5 is now integrated into the v6 **JsonRpcProvider** directly. When connecting to a network which cannot change its network, it is much more efficient to disable the automatic safety check ethers performs.

### Before

```ts
provider = new StaticJsonRpcProvider(url, network);
```

### After

```ts
// This method is involved in tranformation
// v6: If you know the network ahead of time and wish to avoid even a single eth_chainId call
provider = new JsonRpcProvider(url, network, {
  staticNetwork: network,
});


// If you want to transform your StaticJsonRpcProvider into below method you have to do it manually

// v6: If you want the network automatically detected, this will query eth_chainId only once
provider = new JsonRpcProvider(url, undefined, {
  staticNetwork: true
});
```
Since the fees for Ethereum chains has become more complicated, all Fee parameters in v6 were coalesced into a single `.getFeeData` method. While `gasPrice` is no longer widely used in modern networks, when using a legacy network, it is available using that method.

### Before

```ts
await provider.getGasPrice();
```

### After

```ts
(await provider.getFeeData()).gasPrice
```

