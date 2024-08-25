function processEvent(event) {
  delete event.extra;
  return event;
}

Sentry.addGlobalEventProcessor(processEvent);