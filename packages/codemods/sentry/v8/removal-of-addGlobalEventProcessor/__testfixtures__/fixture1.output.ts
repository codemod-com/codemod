Sentry.getGlobalScope().addEventProcessor((event) => {
  delete event.extra;
  return event;
});