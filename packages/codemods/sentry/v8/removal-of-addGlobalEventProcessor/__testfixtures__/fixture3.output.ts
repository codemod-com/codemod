function processEvent(event) {
  delete event.extra;
  return event;
}

Sentry.getGlobalScope().addEventProcessor(processEvent);