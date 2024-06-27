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