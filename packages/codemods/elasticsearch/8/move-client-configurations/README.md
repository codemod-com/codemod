This codemod moves the client-related configuration parameters (ignore, headers, requestTimeout, and maxRetries) from the API object to the second options object.

## What Changed

Previously, ignore, headers, requestTimeout, and maxRetries could be passed directly inside the API object. Now, these parameters need to be specified in a second options object.

Now, both callbacks and promises return an object containing body, statusCode, headers, warnings, and meta.
## Before

```jsx
const body = await client.search({
  index: 'my-index',
  body: { foo: 'bar' },
  ignore: [404]
});

client.search({
  index: 'my-index',
  body: { foo: 'bar' },
  ignore: [404]
}, (err, body, statusCode, headers) => {
  if (err) console.log(err);
});
```

## After

```jsx
const { body, statusCode, headers, warnings } = await client.search({
  index: 'my-index',
  body: { foo: 'bar' }
}, {
  ignore: [404]
});

client.search({
  index: 'my-index',
  body: { foo: 'bar' }
}, {
  ignore: [404]
}, (err, { body, statusCode, headers, warnings }) => {
  if (err) console.log(err);
});
```
