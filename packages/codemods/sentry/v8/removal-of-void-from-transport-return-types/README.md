This codemod removes the `void` return type from the `send` method of the `Transport` interface, ensuring that the method always returns a `TransportMakeRequestResponse` in the promise. This change aligns with the updated requirements in Sentry 8.x.

## Example

### Before

```ts
interface Transport {
  send(event: Event): Promise < void | TransportMakeRequestResponse > ;
}
```

### After

```ts
interface Transport {
  send(event: Event): Promise < TransportMakeRequestResponse > ;
}
```
,
### Before

```ts
type TransportSend = (
  event: Event,
) => Promise < void | TransportMakeRequestResponse > ;
```

### After

```ts
type TransportSend = (event: Event) => Promise < TransportMakeRequestResponse > ;
```

