This codemod updates the API response structure for search calls, replacing the previous body-only return with an object containing additional fields like `statusCode`, `headers`, and `warnings`
## What Changed

Previously, the return value of search calls differed based on whether a callback or promise was used:

- For promises, only the body was returned.
- For callbacks, body, statusCode, and headers were returned separately.

Now, both callbacks and promises return an object containing body, statusCode, headers, warnings, and meta.
## Before

```jsx
// Promise
const body = await client.search({
  index: 'my-index',
  body: { foo: 'bar' }
});

// Callback
client.search({
  index: 'my-index',
  body: { foo: 'bar' }
}, (err, body, statusCode, headers) => {
  if (err) console.log(err);
});

```

## After

```jsx
// Promise
const { body, statusCode, headers, warnings } = await client.search({
  index: 'my-index',
  body: { foo: 'bar' }
});

// Callback
client.search({
  index: 'my-index',
  body: { foo: 'bar' }
}, (err, { body, statusCode, headers, warnings }) => {
  if (err) console.log(err);
});


```
