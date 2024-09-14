const result = await client.b.c.index(
    {
        index: 'my-index',
        body: { foo: 'bar' },
    },
    {
        headers: { key: 'Value' },
        ignore: ['404'],
    },
);

client.index(
    {
        index: 'my-index',
        body: { foo: 'bar' },
        refresh: true,
    },
    (err, result) => {
        if (err) console.log(err);
    },
);
