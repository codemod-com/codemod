---
name: Request codemod
about: Request a new codemod from the community
title: "[codemod request] example codemod"
labels: codemod-request
assignees: ''

---

:warning::warning: Please do not include any proprietary code in the issue. :warning::warning:

---

## Codemod name

Give an understandable name for the codemod.


### Codemod description
Write a short description of the changes that should be made by this codemod.

e.g. 
As described in the [upgrade guide](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/7.17/breaking-changes.html):
"The returned value of an API call will no longer be the body, statusCode, and headers for callbacks, and only the body for promises. The new returned value will be a unique object containing the body, statusCode, headers, warnings, and meta, for both callback and promises."


----
To contributors working on this task:
- [ ] **Framework/Subject Matter Expert**: [Build]Share the Codemod Studio link (example) with detailed specs from the framework expert, including before/after pairs and transformation logic, along with edge cases.
- [ ] **Codemod Expert**: [Build](https://go.codemod.com/build-codemod-docs) and [publish](https://go.codemod.com/codemod-publish-doc) quality codemods that cover most edge cases (false negatives are acceptable) with no false positives.
- Questions? -> [Community](https://go.codemod.com/community)



