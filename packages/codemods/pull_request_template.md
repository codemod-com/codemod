:warning::warning: Please do not include any proprietary code in the pull request. :warning::warning:

For your codemod to be compatible with the Codemod.com platform, it must conform to the following structure:

```bash
├── dist
│   ├── index.cjs # this is the default path for the built codemod file. this is what gets executed when someone runs the codemod.
├── src
│   ├── index.ts # this is the default path for the codemod's entry point file.
│   ├── ...
├── test
│   ├── test.ts # containts tests (optional, but preferred)
├── .codemodrc.json # contains the codemod's metadata; refer to existing codemods for the config file structure.
├── README.md # must contain a short description and examples, such as in the structure described below

├── package.json # optional file for maintaining your package and its dependencies
└── tsconfig.json # optional file for TypeScript configuration
```

You can also specify custom paths for build input and output files in the `.codemodrc.json` file using `build.input` and `build.output` options. For more information, refer to the [Codemod.com RC file documentation](https://docs.codemod.com/).

---

## Description

Add a clear description of what should the codemod do.

## Examples

### Before

```
//insert your code before transformation here
```

### After

```
//insert your code after transformation here
```
