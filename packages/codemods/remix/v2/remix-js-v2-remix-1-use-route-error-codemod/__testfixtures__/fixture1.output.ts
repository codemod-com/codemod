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