Sentry.addGlobalEventProcessor((event) => {
  if (event.level === 'error') {
    delete event.extra;
  }
  return event;
});