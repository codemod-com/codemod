This codemod renames the query key to querystring and changes the body key to bulkBody in client.transport.request.
## What Changed

Previously, the query key was used for query parameters and body was used for the request body in client.transport.request. Now, you need to use querystring for query parameters and bulkBody for the request body.

## Before

```jsx
const body = await client.transport.request({
  method: 'GET',
  path: '/my-index/_search',
  body: { foo: 'bar' },
  query: { bar: 'baz' }
});

client.transport.request({
  method: 'GET',
  path: '/my-index/_search',
  body: { foo: 'bar' },
  query: { bar: 'baz' }
}, (err, body, statusCode, headers) => {
  if (err) console.log(err);
});
```

## After

```jsx
const { body, statusCode, headers, warnings } = await client.transport.request({
  method: 'GET',
  path: '/my-index/_search',
  bulkBody: { foo: 'bar' },
  querystring: { bar: 'baz' }
});

client.transport.request({
  method: 'GET',
  path: '/my-index/_search',
  bulkBody: { foo: 'bar' },
  querystring: { bar: 'baz' }
}, (err, { body, statusCode, headers, warnings }) => {
  if (err) console.log(err);
});
```
