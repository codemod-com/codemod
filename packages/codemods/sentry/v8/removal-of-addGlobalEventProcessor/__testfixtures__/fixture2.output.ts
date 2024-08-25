Sentry.getGlobalScope().addEventProcessor((event) => {
  delete event.extra;
  return event;
});

Sentry.getGlobalScope().addEventProcessor((event) => {
  delete event.tags;
  return event;
});