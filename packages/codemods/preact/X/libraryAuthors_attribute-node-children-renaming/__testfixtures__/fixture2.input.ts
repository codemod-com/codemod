class HTTPError extends Error {}

const response = await fetch('https://example.com', {
  method: 'POST',
  body: JSON.stringify({ foo: true }),
  headers: {
    'content-type': 'application/json',
  },
});

if (!response.ok) {
  throw new HTTPError(`Fetch error: ${response.statusText}`);
}

const json = await response.json();

console.log(json);
//=> `{data: '🦄'}`