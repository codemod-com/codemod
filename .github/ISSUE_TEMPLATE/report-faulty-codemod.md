---
name: Report faulty codemod
about: Report codemod incorrect output
title: '[faulty output]'
labels: invalid
assignees: ''
---

:warning::warning: Please do not include any proprietary code in the issue. :warning::warning:

---

### Faulty codemod

Mention the codemod you ran which resulted in incorrect output. [e.g. `next/13/app-router-recipe`]

### Code before transformation

```jsx
//insert your code before transformation here
```

### Expected code after transformation

```jsx
//insert the expected **correct** output here
```

### Actual code after transformation

```jsx
//insert the actual **faulty** output here
```

### Estimated severity

A general estimation of the severity of this issue. This can be estimated based on the number of files affected and the difficulty of manually fixing the faulty output while reviewing Intuita's dry run results.

### Environment:

-   Intuita CLI version: [e.g. v0.0.21]
-   OS: [e.g. MacOS 13.0.1]
-   Node.js version: [e.g. v16.16.0]

### Additional context

Add any other context about the problem here. This might include the target project, explanation of faulty output related to business logic, relevant links, etc.
