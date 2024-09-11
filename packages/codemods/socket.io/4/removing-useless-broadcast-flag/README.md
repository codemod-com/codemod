

This codemod will get rid of following error:

cannot get emit of undefined 

## Example
### Before:

```ts
socket.to("room1").broadcast.emit(/* ... */);
```
was working in Socket.IO v3 but is now considered invalid, as the broadcast flag is useless because the to("room1") method already puts the Socket instance in broadcasting mode.

### After:

```ts
socket.to("room1").emit(/* ... */); 
```