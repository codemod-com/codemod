:warning::warning: Please do not include any proprietary code in the pull request. :warning::warning:

For your codemod pull request to be compatible with the Codemod.com platform, it must follow the following structure:

```bash
├── src
│   ├── index.ts # contains the codemod transform function
│   ├── [example-file].ts # contains any helper files
│   ├── ..
│   ├── .
├── test
│   ├── test.ts # containts tests
├── .codemodrc.json # contains the codemod's metadata; refer to existing codemods for the config file structure.
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
