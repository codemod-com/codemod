ne place this is likely to surface and require a change is your app/entry.server.tsx file, where you'll also need to convert the Node PassThrough into a web ReadableStream via createReadableStreamFromReadable

### Before

```ts
import { PassThrough } from "node:stream";
import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { Response } from "@remix-run/node";

// ... other imports and code ...

function handleRequest({ /* ... */ }) {
  // ... existing code ...
}

function handleBotRequest(...) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream( <
      RemixServer.../>, {
        onAllReady() {
            shellRendered = true;
            const body = new PassThrough();

            responseHeaders.set("Content-Type", "text/html");

            resolve(
              new Response(body, {
                headers: responseHeaders,
                status: responseStatusCode,
              })
            );

            pipe(body);
          },
          // ... other event handlers ...
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(...) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream( <
      RemixServer.../>, {
        onShellReady() {
            shellRendered = true;
            const body = new PassThrough();

            responseHeaders.set("Content-Type", "text/html");

            resolve(
              new Response(body, {
                headers: responseHeaders,
                status: responseStatusCode,
              })
            );

            pipe(body);
          },
          // ... other event handlers ...
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

// ... rest of the code ...
```

### After

```ts
import { createReadableStreamFromReadable } from "@remix-run/node";
import type { AppLoadContext, EntryContext } from "@remix-run/node";

// ... other imports and code ...

function handleRequest({ /* ... */ }) {
  // ... existing code ...
}

function handleBotRequest(...) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream( <
      RemixServer.../>, {
        onAllReady() {
            shellRendered = true;
            const body = new PassThrough();

            responseHeaders.set("Content-Type", "text/html");

            resolve(
              new Response(createReadableStreamFromReadable(body), {
                headers: responseHeaders,
                status: responseStatusCode,
              })
            );

            pipe(body);
          },
          // ... other event handlers ...
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(...) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream( <
      RemixServer.../>, {
        onShellReady() {
            shellRendered = true;
            const body = new PassThrough();

            responseHeaders.set("Content-Type", "text/html");

            resolve(
              new Response(createReadableStreamFromReadable(body), {
                headers: responseHeaders,
                status: responseStatusCode,
              })
            );

            pipe(body);
          },
          // ... other event handlers ...
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

// ... rest of the code ...
```

