Sentry.addGlobalEventProcessor((event) => {
  delete event.extra;
  return event;
});