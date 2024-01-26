:warning::warning: Please do not include any proprietary code in the pull request. :warning::warning:

For your codemod pull request to be compatible with the Intuita platform, it must follow the following structure:

```bash
├── src
│   ├── index.ts # contains the codemod transform function
│   ├── [example-file].ts # contains any helper files
│   ├── ..
│   ├── .
├── test
│   ├── test.ts # containts tests
├── config.json # contains the codemod's metadata; refer to existing codemods for the config file structure.
├── index.d.ts
├── package.json
├── tsconfig.json
└── README.md # must follow the structure described below
```

---

# Codemod Title

## Description

Add a clear description of what should the codemod do.

## Example

### Before

```
//insert your code before transformation here
```

### After

```
//insert your code after transformation here
```

## Applicability Criteria

-   Framework/library: [e.g. Next.js]
-   Version: [e.g. v12 -> v13]
    > Add details about the type of project this codemod should target. If this codemod is a general refactor, include the target language and other relevant information.

## Other Metadata

### Codemod Version

Insert codemod version [e.g. v1.0.0]

### Change Mode

Can be:

-   **Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.
-   **Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

Can be:

-   [jscodeshift](https://github.com/facebook/jscodeshift)
-   [ts-morph](https://github.com/dsherret/ts-morph)
-   [filemod](https://github.com/codemod-com/filemod/)
-   [Uber Piranha](https://github.com/uber/piranha)

### Estimated Time Saving

Add an expected time saving this codemod can provide. [e.g. 20 minutes per occurrence]

### Owner

Write the codemod author name and link to their GitHub account.
