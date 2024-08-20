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
