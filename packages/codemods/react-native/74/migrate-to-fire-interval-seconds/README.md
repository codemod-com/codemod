This codemod migrates `PushNotificationIOS.scheduleLocalNotification` deprecated `repeatInterval` to `fireIntervalSeconds`.

Further manual changes are required: firing multiple notifications using `fireDate` or `fireIntervalSeconds`.

## Before:

```ts
PushNotificationIOS.scheduleLocalNotification({
    repeatInterval: 'minute',
});
```

## After:

```ts
PushNotificationIOS.scheduleLocalNotification({
    fireIntervalSeconds: 60,
});
```