This codemod removes deprecated handler on any calls to `PushNotificationIOS.removeEventListener`.

## Before:

```ts
const callback = () => {
    console.log('some  callback to remove');
};
PushNotificationIOS.removeEventListener('notification', callback);
```

## After:

```ts
PushNotificationIOS.removeEventListener('notification');
```
