Sentry.getGlobalScope().addEventProcessor((event) => {
  if (event.level === 'error') {
    delete event.extra;
  }
  return event;
});