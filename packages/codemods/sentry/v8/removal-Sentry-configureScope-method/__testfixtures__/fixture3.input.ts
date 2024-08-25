Sentry.configureScope((scope) => {
  scope.setUser({ id: '456', email: 'user@example.com' });
});