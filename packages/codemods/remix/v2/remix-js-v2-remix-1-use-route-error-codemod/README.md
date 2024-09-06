In v1, a thrown Response rendered the closest CatchBoundary while all other unhandled exceptions rendered the ErrorBoundary. In v2 there is no CatchBoundary and all unhandled exceptions will render the ErrorBoundary, response or otherwise.

### Before

```ts
import { useCatch } from '@remix-run/react';

export function CatchBoundary() {
  const caught = useCatch();

  return ( <
    div >
    <
    h1 > Oops < /h1> <
    p > Status: { caught.status } < /p> <
    p > { caught.data.message } < /p> <
    /div>
  );
}

export function ErrorBoundary({ error }) {
  console.error(error);
  return ( <
    div >
    <
    h1 > Uh oh... < /h1> <
    p > Something went wrong < /p> <
    pre > { error.message || 'Unknown error' } < /pre> <
    /div>
  );
}
```

### After

```ts
import { useRouteError, isRouteErrorResponse } from '@remix-run/react';

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return ( <
      div >
      <
      h1 > Oops < /h1> <
      p > Status: { error.status } < /p> <
      p > { error.data.message } < /p> <
      /div>
    );
  }

  let errorMessage = 'Unknown error';
  if (isDefinitelyAnError(error)) {
    errorMessage = error.message;
  }

  return ( <
    div >
    <
    h1 > Uh oh... < /h1> <
    p > Something went wrong. < /p> <
    pre > { errorMessage } < /pre> <
    /div>
  );
}
```

