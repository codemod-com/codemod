const body = await client.transport.request({
    method: 'GET',
    path: '/my-index/_search',
    body: { foo: 'bar' },
    query: { bar: 'baz' },
});

client.transport.request(
    {
        method: 'GET',
        path: '/my-index/_search',
        body: { foo: 'bar' },
        query: { bar: 'baz' },
    },
    (err, body, statusCode, headers) => {
        if (err) console.log(err);
    },
);
