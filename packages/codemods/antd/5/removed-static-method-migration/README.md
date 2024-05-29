

Replace message.warn with message.warning.
Replace notification.close with notification.destroy.

## Example

### Before

```TypeScript
import { message, notification } from 'antd';

const App = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const onClick1 = () => {
   message.warn();

  }
  const onClick2 = () => {
   messageApi.warn();
  };

  const [notificationApi] = notification.useNotification();
  const onClick3 = () => {
   notification.close();
  }
  const onClick4 = () => {
   notificationApi.close();
  };

  return <>{contextHolder}</>;
};

```

### After

```TypeScript
import { message, notification } from 'antd';

const App = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const onClick1 = () => {
   message.warning();
  }
  const onClick2 = () => {
   messageApi.warning();
  };

  const [notificationApi] = notification.useNotification();
  const onClick3 = () => {
   notification.destroy();
  }
  const onClick4 = () => {
   notificationApi.destroy();
  };

  return <>{contextHolder}</>;
};
```