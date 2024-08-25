This codemod removes the import statement for the @sentry/replay package and replaces instances of new Replay() with Sentry.replayIntegration(), aligning with the latest Sentry SDK practices.

- **Import Removal:** Eliminates the import statement for Replay from the @sentry/replay package.
- **Integration Replacement:** Transforms all occurrences of new Replay() into Sentry.replayIntegration() to ensure compatibility with the latest Sentry SDK.

## Example

### Before

```ts
import { Replay } from '@sentry/replay';

Sentry.init({
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [new Replay()],
});
```

### After

```ts
Sentry.init({
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [Sentry.replayIntegration()],
});
```
,
### Before

```ts
import { Replay } from '@sentry/replay';

Sentry.init({
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [
    new Replay(),
    // Other integrations
  ],
});
```

### After

```ts
Sentry.init({
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [
    Sentry.replayIntegration(),
    // Other integrations
  ],
});
```
,
### Before

```ts
import { Replay } from '@sentry/replay';

Sentry.init({
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [
    new Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

### After

```ts
Sentry.init({
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

