This codemod facilitates the migration from Sentry v7.x to v8.x by replacing the deprecated `addGlobalEventProcessor` function with the new `getGlobalScope().addEventProcessor` method. 

## Example

### Before

```ts
Sentry.addGlobalEventProcessor((event) => {
  delete event.extra;
  return event;
});
```

### After

```ts
Sentry.getGlobalScope().addEventProcessor((event) => {
  delete event.extra;
  return event;
});
```
,
### Before

```ts
Sentry.addGlobalEventProcessor((event) => {
  delete event.extra;
  return event;
});

Sentry.addGlobalEventProcessor((event) => {
  delete event.tags;
  return event;
});
```

### After

```ts
Sentry.getGlobalScope().addEventProcessor((event) => {
  delete event.extra;
  return event;
});

Sentry.getGlobalScope().addEventProcessor((event) => {
  delete event.tags;
  return event;
});
```
,
### Before

```ts
function processEvent(event) {
  delete event.extra;
  return event;
}

Sentry.addGlobalEventProcessor(processEvent);
```

### After

```ts
function processEvent(event) {
  delete event.extra;
  return event;
}

Sentry.getGlobalScope().addEventProcessor(processEvent);
```
,
### Before

```ts
Sentry.addGlobalEventProcessor((event) => {
  if (event.level === 'error') {
    delete event.extra;
  }
  return event;
});
```

### After

```ts
Sentry.getGlobalScope().addEventProcessor((event) => {
  if (event.level === 'error') {
    delete event.extra;
  }
  return event;
});
```

