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