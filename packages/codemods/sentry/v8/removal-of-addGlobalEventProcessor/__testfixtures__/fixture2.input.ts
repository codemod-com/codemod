Sentry.addGlobalEventProcessor((event) => {
  delete event.extra;
  return event;
});

Sentry.addGlobalEventProcessor((event) => {
  delete event.tags;
  return event;
});