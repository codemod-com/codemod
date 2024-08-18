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
