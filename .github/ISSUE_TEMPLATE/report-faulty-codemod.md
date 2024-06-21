---
name: Report faulty codemod
about: Report codemod incorrect output
title: "[codemod][FP/FN] <codemod-name>"
labels: codemod-issue
assignees: ''

---


### Faulty codemod

1. Mention the codemod name, e.g., `react/19/remove-forward-ref`
2. If available, link to the codemod source, e.g., [source](https://github.com/reactjs/react-codemod/tree/master/transforms)

### Sample code snippets

If the codemod source is available and supported in the studio, please share a link including the before/after code snippets. If not, provide them below, e.g.:

See this [Codemod Studio link](https://go.codemod.com/faulty-codemod-demo) for sample code snippets and a description of the issue.

#### Original

```ts
//insert your original code here
```

#### Expected

```ts
//insert the expected **correct** output here
```

#### Actual

```ts
//insert the actual **faulty** output here
```

### Estimated impact
Numbers about your specific codemod run:

- Total number of files/instances transformed: X
- Number of files/instances missed by the codemod (FN): X
- Number of files/instances mistakenly transformed (FP): X

Anything else that helps the community prioritize, e.g.:
- I still need this fix for my current or upcoming migration.
OR
- I manually fixed my issue, but I'm reporting this for other community members.

### Environment:
-   Codemod CLI version: [e.g. v0.0.21]
-   OS: [e.g. MacOS 13.0.1]
-   Node.js version: [e.g. v16.16.0]

### Additional context
Add any other context about the problem here. This might include the target project, an explanation of the faulty output related to business logic, relevant links, etc.
