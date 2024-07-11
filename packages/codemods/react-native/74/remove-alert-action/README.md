This codemod removes references to deprecated `alertAction`.

## Before:

```ts
const alertAction = 'view';
PushNotificationIOS.presentLocalNotification({ alertBody: 'body', alertAction });
```

## After:

```ts
PushNotificationIOS.presentLocalNotification({ alertBody: 'body' });
```
