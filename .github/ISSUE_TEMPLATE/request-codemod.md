---
name: Request codemod
about: Request a new codemod from the community
title: '[codemod request] example codemod'
labels: codemod request
assignees: ''
---

:warning::warning: Please do not include any proprietary code in the issue. :warning::warning:

---

### Codemod description

Add a clear description of what should the codemod do.

### Applicability criteria
Applicability criteria could be used by the codemod engine to only process required projects or files, which improves performance and reduces false positives.
Codemods without applicability criteria still work, but they won't be as efficient as they could be, and you are probably in the best position to provide this info :) 
-   Language/framework/library: [e.g. Next.js]
-   Version range containing the code pattern to detect: [e.g. v12.0.0 - v12.3.2]  
-   File extensions: [e.g. js, ts, jsx, tsx]

### Code before transformation

```
//insert your code before transformation here
```

### Code after transformation

```
//insert the expected **correct** output here
```

### Sample repo to test the codemod
A good sample repository is something that is popular, big enough to be meaningful, and contains different patterns to be detected and transformed, not so huge that it requires a lot of manual work due to custom business logic or intermediary layers.

### Codemod package path
Where should the codemod code reside? Which GitHub repo and folder should we open up a PR against? (e.g. https://github.com/reactjs/react-codemod)

The PR will include a folder that contains the codemod package (codemod script, test fixtures, license, metadata and config, and package.json). 

If no path is provided, we will find a catch-all repo to store the codemod package.

### Codemod maintainer

If someone in the community builds the codemod, who (which organization) is going to continue to maintain the codemod?

- [ ] Link to your GitHub org (e.g. https://github.com/vercel)
- [ ] Codemod team (chat with us first)
- [ ] Community (no specific maintainer, might discourage others to use)


### Additional context

Add any other context about the problem here. This might include extra considerations, edge cases, relevant business logic, existing migration guides, relevant links, etc.
