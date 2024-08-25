Sentry.configureScope((scope) => {
  scope.setTag('level', 'info');
  scope.setTag('action', 'click');
});