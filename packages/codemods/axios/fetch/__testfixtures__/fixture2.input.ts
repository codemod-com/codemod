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