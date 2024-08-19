Migrate from axios to fetch.

Requires `--OPENAI_API_KEY=$OPENAI_API_KEY` to be set.

## Example

### Before

```ts
const { data } = await axios.get(url, {
    responseType: "arraybuffer",
});
```

### After

```ts
const response = await fetch(url);
if (!response.ok) throw new Error("Network response was not ok.");
const data = await response.arrayBuffer();
```

### Before

```ts
const { data } = await axios.post(
    `https://app.posthog.com/api/projects/${this.__projectId}/query/`,
    {
        query: {
        kind: "HogQLQuery",
        query:
            "select properties.codemodName, count(*) from events where event in ('codemod.CLI.codemodExecuted', 'codemod.VSCE.codemodExecuted') group by properties.codemodName",
        },
    },
    {
        headers: {
        Authorization: this.__authHeader,
        },
    },
);
```

### After

```ts
const response = await fetch(
    `https://app.posthog.com/api/projects/${this.__projectId}/query/`,
    {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
            Authorization: this.__authHeader,
        },
        body: JSON.stringify({
            query: {
                kind: "HogQLQuery",
                query:
                "select properties.codemodName, count(*) from events where event in ('codemod.CLI.codemodExecuted', 'codemod.VSCE.codemodExecuted') group by properties.codemodName",
            },
        }),
    },
);
if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();
```

